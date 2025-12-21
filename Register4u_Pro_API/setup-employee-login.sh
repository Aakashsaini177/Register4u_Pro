#!/bin/bash

echo "🚀 Setting up Employee Login System..."
echo ""

# Install required dependencies
echo "📦 Installing dependencies..."
npm install bcrypt crypto-js

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. The Employee model has been updated with login fields"
echo "3. Start the backend: npm run dev"
echo "4. Test employee login at: POST /api/v1/auth/employee-login"
echo ""
echo "🎉 Employee login system is ready!"