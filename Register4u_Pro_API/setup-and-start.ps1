# Register4u Pro Backend - Setup and Start
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Register4u Pro Backend Setup" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create .env file
Write-Host "Creating .env file with correct configuration..." -ForegroundColor Green

$envContent = @"
# Server Configuration
PORT=4002
NODE_ENV=development

# Database Configuration - Password is EMPTY!
DB_HOST=localhost
DB_PORT=3306
DB_NAME=r4u
DB_USER=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=register4u-pro-secret-key-2025
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:3000
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "✅ .env file created!" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Backend Server..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend URL: http://localhost:4002" -ForegroundColor Green
Write-Host "API Endpoint: http://localhost:4002/api/v1" -ForegroundColor Green
Write-Host ""

# Start server
npm run dev

