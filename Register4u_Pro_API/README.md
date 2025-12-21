# Register4u Pro API - Backend

Modern, well-structured REST API for Register4u Pro Event Management System built with Node.js, Express, and MySQL.

## ✨ Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 📝 **CRUD Operations** - Complete REST API for all modules
- ✅ **Input Validation** - Express validator for data validation
- 🛡️ **Security** - Helmet, CORS, and bcrypt for security
- 📁 **File Upload** - Multer for handling file uploads
- 🗄️ **MySQL Database** - Sequelize ORM for database operations
- 🔄 **Environment Variables** - dotenv for configuration
- 📊 **Dashboard API** - Statistics and analytics endpoints
- 🚀 **Modern Architecture** - Clean, modular, and maintainable code
- 📱 **RESTful Design** - Standard HTTP methods and status codes
- 🔍 **Search & Pagination** - Built-in search and pagination support
- 📖 **API Documentation** - Self-documenting API endpoints

## 🚀 Tech Stack

- **Runtime:** Node.js 16+
- **Framework:** Express.js 4
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **File Upload:** Multer
- **Security:** Helmet, bcrypt, CORS
- **Environment:** dotenv
- **Logging:** Morgan
- **Compression:** compression

## 📦 Installation

### Prerequisites

- Node.js 16 or higher
- MySQL 5.7 or higher
- npm or yarn

### Steps

1. **Navigate to API directory**
   ```bash
   cd Register4u_Pro/Register4u_Pro_API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to create `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   # Server
   PORT=4002
   NODE_ENV=development
   
   # Database
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=r4u
   DB_USER=root
   DB_PASSWORD=
   
   # JWT
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=7d
   
   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the server**
   
   Development mode with auto-reload:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

5. **Verify server is running**
   
   Visit `http://localhost:4002/health`

## 🗂️ Project Structure

```
Register4u_Pro_API/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Database configuration
│   │   └── jwt.js           # JWT configuration
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── organizationController.js
│   │   ├── eventController.js
│   │   ├── employeeTaskController.js
│   │   ├── visitorController.js
│   │   ├── categoryController.js
│   │   └── dashboardController.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js          # Authentication middleware
│   │   ├── validation.js    # Validation middleware
│   │   ├── upload.js        # File upload middleware
│   │   └── errorHandler.js  # Error handling middleware
│   ├── models/              # Database models
│   │   ├── Admin.js
│   │   ├── Employee.js
│   │   ├── Organization.js
│   │   ├── Event.js
│   │   ├── EmployeeTask.js
│   │   ├── Visitor.js
│   │   ├── Category.js
│   │   └── index.js
│   ├── routes/              # API routes
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── organizationRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── employeeTaskRoutes.js
│   │   ├── visitorRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── dashboardRoutes.js
│   ├── app.js               # Express app configuration
│   └── server.js            # Server entry point
├── uploads/                 # Uploaded files directory
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 📚 API Endpoints

### Base URL
```
http://localhost:4002/api/v1
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/change-password` | Change password |
| POST | `/auth/forgot-password` | Forgot password |
| POST | `/auth/reset-password` | Reset password |

### Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/employees` | Get all employees (with pagination) |
| GET | `/employees/:id` | Get employee by ID |
| POST | `/employees/create` | Create employee |
| PUT | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Delete employee |

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/organizations` | Get all organizations |
| GET | `/organizations/:id` | Get organization by ID |
| POST | `/organizations` | Create organization |
| PUT | `/organizations/:id` | Update organization |
| DELETE | `/organizations/:id` | Delete organization |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events` | Get all events |
| GET | `/events/:id` | Get event by ID |
| POST | `/events/create` | Create event |
| PUT | `/events/:id` | Update event |
| DELETE | `/events/:id` | Delete event |

### Visitors

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/visitors` | Get all visitors (with pagination) |
| GET | `/visitors/:id` | Get visitor by ID |
| POST | `/visitors/create` | Create visitor (with photo) |
| PUT | `/visitors/:id` | Update visitor |
| DELETE | `/visitors/:id` | Delete visitor |
| POST | `/visitors/:id/check-in` | Check-in visitor |
| POST | `/visitors/:id/check-out` | Check-out visitor |

### Employee Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employee-tasks` | Get all tasks |
| GET | `/employee-tasks/:id` | Get task by ID |
| POST | `/employee-tasks` | Create task |
| PUT | `/employee-tasks/:id` | Update task |
| DELETE | `/employee-tasks/:id` | Delete task |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all categories |
| GET | `/categories/:id` | Get category by ID |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get dashboard statistics |

### Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/docs` | API documentation |

## 🔐 Authentication

All endpoints except `/auth/login` require authentication using JWT token.

**Request Header:**
```
Authorization: Bearer <your-jwt-token>
```

**Login Example:**
```bash
curl -X POST http://localhost:4002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin123", "password": "admin123"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": 1,
    "username": "admin123",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

## 📝 API Request/Response Examples

### Create Employee
```bash
curl -X POST http://localhost:4002/api/v1/employees/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "designation": "Developer",
    "department": "IT"
  }'
```

### Get All Employees with Pagination
```bash
curl -X POST http://localhost:4002/api/v1/employees \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 10,
    "search": "john"
  }'
```

### Upload Visitor with Photo
```bash
curl -X POST http://localhost:4002/api/v1/visitors/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Jane Doe" \
  -F "email=jane@example.com" \
  -F "phone=9876543210" \
  -F "photo=@/path/to/photo.jpg"
```

## 🗄️ Database

### Connection

The API uses the same MySQL database as the original Register4u:
- **Database Name:** `r4u`
- **Tables:** Same tables as original Register4u

### Models

- **Admin** - Administrator accounts
- **Employee** - Employee records
- **Organization** - Organization/company details
- **Event** - Event information
- **EmployeeTask** - Task assignments
- **Visitor** - Visitor registrations
- **Category** - Organization categories

### Relationships

- Organization `belongsTo` Category
- Event `belongsTo` Organization
- Visitor `belongsTo` Event
- EmployeeTask `belongsTo` Employee

## 🔒 Security Features

- **JWT Tokens** - Secure authentication
- **Password Hashing** - bcrypt for password encryption
- **Input Validation** - express-validator for data validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **File Upload Validation** - File type and size validation
- **SQL Injection Protection** - Sequelize ORM prevents SQL injection
- **XSS Protection** - Built-in Express protections

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 4002 |
| NODE_ENV | Environment | development |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 3306 |
| DB_NAME | Database name | r4u |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | (empty) |
| JWT_SECRET | JWT secret key | (required) |
| JWT_EXPIRES_IN | Token expiration | 7d |
| CORS_ORIGIN | CORS allowed origin | http://localhost:3000 |
| UPLOAD_PATH | File upload directory | ./uploads |
| MAX_FILE_SIZE | Max file size in bytes | 5242880 (5MB) |

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```

This uses nodemon for auto-restart on file changes.

### Testing API
Use tools like:
- Postman
- Insomnia
- Thunder Client (VS Code)
- curl

### Logging
- Morgan for HTTP request logging
- Console logs for debugging
- Error stack traces in development mode

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## 🐛 Troubleshooting

### Port Already in Use
Change `PORT` in `.env` file

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database `r4u` exists

### JWT Token Invalid
- Check `JWT_SECRET` in `.env`
- Ensure token is sent in Authorization header
- Token may have expired

### File Upload Error
- Check `uploads/` directory exists
- Verify file size limits
- Check file type restrictions

## 📈 Performance

- **Connection Pooling** - Sequelize connection pool
- **Compression** - gzip compression for responses
- **Caching** - Ready for Redis integration
- **Pagination** - Efficient data fetching

## 🚀 Deployment

### Production Build
1. Set `NODE_ENV=production` in `.env`
2. Update `JWT_SECRET` with strong secret
3. Configure production database
4. Start with PM2:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name register4u-api
   ```

### Using PM2
```bash
# Start
pm2 start src/server.js --name register4u-api

# Stop
pm2 stop register4u-api

# Restart
pm2 restart register4u-api

# Logs
pm2 logs register4u-api

# Monitor
pm2 monit
```

## 🔗 Integration with Frontend

The API is designed to work seamlessly with Register4u Pro frontend:

**Frontend API Configuration:**
```javascript
// In frontend src/lib/api.js
export const API_BASE_URL = 'http://localhost:4002/api/v1'
```

## 📝 License

This project is proprietary software for Register4u.

## 👨‍💻 Support

For support, please contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Built with ❤️ using modern Node.js practices**

