output "api_endpoint" {
  description = "Base API Gateway HTTP Endpoint"
  value       = aws_apigatewayv2_stage.default_stage.invoke_url
}

output "health_check_url" {
  description = "Health Check URL"
  value       = "${aws_apigatewayv2_stage.default_stage.invoke_url}/api/v1/health"
}

output "lambda_function_name" {
  description = "Lambda Function Name"
  value       = aws_lambda_function.tabvault_api.function_name
}
