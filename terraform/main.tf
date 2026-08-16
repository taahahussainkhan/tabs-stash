terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

# 1. IAM Role for Lambda Execution
resource "aws_iam_role" "lambda_exec" {
  name = "tabvault_lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach basic CloudWatch logging policy to Lambda
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# 2. AWS Lambda Function
resource "aws_lambda_function" "tabvault_api" {
  function_name = "tabvault-api"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "dist/lambda.lambdaHandler"
  runtime       = "nodejs20.x"
  memory_size   = 512
  timeout       = 15

  filename         = "${path.module}/lambda_payload.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda_payload.zip")

  environment {
    variables = {
      NODE_ENV                     = "production"
      MONGODB_URI                  = var.mongodb_uri
      JWT_ACCESS_SECRET            = var.jwt_access_secret
      JWT_ACCESS_EXPIRES_IN        = "15m"
      JWT_REFRESH_EXPIRES_DAYS     = "30"
      RATE_LIMIT_WINDOW_MS         = "900000"
      RATE_LIMIT_MAX_REQUESTS      = "100"
      AUTH_RATE_LIMIT_MAX_REQUESTS = "10"
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution
  ]
}

# 3. API Gateway (v2 HTTP API)
resource "aws_apigatewayv2_api" "http_api" {
  name          = "tabvault-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["*"]
    allow_methods = ["*"]
    allow_origins = ["*"]
    max_age       = 86400
  }
}

# API Gateway Lambda Integration
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.tabvault_api.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# API Gateway Default Catch-All Route
resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

# Lambda Permission to allow API Gateway invocations
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tabvault_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
