# Register4u Pro - Event Management System 🎉

A modern, feature-rich event management system built with React, Vite, Tailwind CSS, and integrated with existing Register4u backend API.

## ✨ Features

- 🎨 **Modern UI/UX** - Built with Tailwind CSS and custom components
- 📊 **Interactive Dashboard** - Real-time statistics and charts
- 👥 **Employee Management** - Full CRUD operations for employee records
- 🏢 **Organization Management** - Manage organizations and their details
- 📅 **Event Management** - Create and manage events efficiently
- 🎫 **Visitor Management** - Register and track visitors with QR codes
- 📋 **Task Management** - Assign and track employee tasks
- 📸 **Photo Gallery** - Upload and manage event photos
- 🔍 **QR Code Scanner** - Scan visitor QR codes for quick check-in
- 📂 **Category Management** - Organize organizations by categories
- ⚙️ **Settings** - Configure system settings and preferences
- 🔐 **Authentication** - Secure login with token-based authentication
- 📱 **Responsive Design** - Works seamlessly on all devices

## 🚀 Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **API Calls:** Axios
- **Charts:** Chart.js with react-chartjs-2
- **Forms:** React Hook Form
- **Icons:** Heroicons
- **Routing:** React Router v6
- **Notifications:** React Hot Toast

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm/yarn installed
- Access to the Register4u backend API

### Steps

1. **Clone the repository**
   ```bash
   cd Register4u_Pro/Register4u_Pro_CRM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Open `src/lib/api.js` and update the API base URL:
   ```javascript
   export const API_BASE_URL = 'https://uatapi.registration4u.in/api'
   // For local development:
   // export const API_BASE_URL = 'http://localhost:4001/api'
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
Register4u_Pro_CRM/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout/       # Layout components (Sidebar, Header)
│   │   └── ui/           # UI components (Button, Card, Input, etc.)
│   ├── lib/              # Utility functions and API
│   │   ├── api.js        # API configuration and endpoints
│   │   └── utils.js      # Helper functions
│   ├── pages/            # Page components
│   │   ├── Auth/         # Login, Forgot Password
│   │   ├── Dashboard/    # Dashboard with statistics
│   │   ├── Employee/     # Employee management
│   │   ├── Organization/ # Organization management
│   │   ├── Event/        # Event management
│   │   ├── EmployeeTask/ # Task management
│   │   ├── Visitors/     # Visitor management
│   │   ├── Scanner/      # QR code scanner
│   │   ├── Category/     # Category management
│   │   ├── Settings/     # System settings
│   │   ├── Photos/       # Photo gallery
│   │   └── Profile/      # User profile
│   ├── store/            # State management (Zustand)
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🔑 Default Login Credentials

```
Username: admin123
Password: admin123
```

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🎨 UI Components

The project includes a comprehensive set of reusable UI components:

- **Button** - Multiple variants (primary, secondary, outline, ghost, etc.)
- **Input** - Text inputs with error states
- **Select** - Dropdown selects
- **Textarea** - Multi-line text inputs
- **Card** - Container component with header and content
- **Table** - Data tables with headers and rows
- **Badge** - Status indicators
- **Dialog** - Modal dialogs
- **Loading** - Loading spinners and skeletons

## 🔌 API Integration

All API endpoints are configured in `src/lib/api.js`. The application uses:

- **Authentication API** - Login, forgot password, reset password
- **Dashboard API** - Statistics and analytics
- **Employee API** - CRUD operations for employees
- **Organization API** - CRUD operations for organizations
- **Event API** - CRUD operations for events
- **Employee Task API** - Task management
- **Visitor API** - Visitor management with photo upload
- **Category API** - Category management
- **Settings API** - System settings

## 🌐 Backend Integration

This frontend application is designed to work with the existing Register4u backend API located in:
```
Register4u/Registration4u_API/
```

The backend uses:
- Node.js + Express
- MySQL database (via Sequelize ORM)
- JWT authentication

**Database:** Uses the same database (`r4u`) as the original Register4u application.

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🎯 Key Improvements Over Original

1. **Modern UI/UX** - Clean, intuitive interface with smooth animations
2. **Better Performance** - Vite for faster builds and HMR
3. **Enhanced Components** - Reusable, customizable UI components
4. **Improved Charts** - Interactive charts with Chart.js
5. **Better State Management** - Zustand for lightweight state management
6. **Enhanced Forms** - React Hook Form for better form handling
7. **Better Notifications** - React Hot Toast for elegant notifications
8. **Improved Navigation** - Smooth routing with React Router v6

## 🔧 Development Guidelines

### Adding a New Page

1. Create component in `src/pages/YourModule/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Layout/Sidebar.jsx`
4. Add API endpoints in `src/lib/api.js` if needed

### Creating Custom Components

1. Create component in `src/components/ui/`
2. Follow existing patterns for consistency
3. Use Tailwind CSS for styling
4. Make it reusable and configurable

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Deploy to Server

Upload the contents of the `dist/` folder to your web server.

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://uatapi.registration4u.in/api
```

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Create a pull request

## 📄 License

This project is proprietary software for Register4u.

## 👨‍💻 Support

For support, please contact the development team.

## 🎉 Credits

Built with ❤️ using modern web technologies.

---

**Version:** 1.0.0  
**Last Updated:** October 2025

