variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "ap-south-1" # Mumbai
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "personal"
}

variable "mongodb_uri" {
  description = "MongoDB Atlas connection string"
  type        = string
  default     = "mongodb+srv://<username>:<password>@cluster0.bdcde4t.mongodb.net/tabvault?retryWrites=true&w=majority&appName=Cluster0"
}

variable "jwt_access_secret" {
  description = "Secret key for JWT token signing"
  type        = string
  default     = "tabvault_super_secure_access_secret_min_32_characters"
}
