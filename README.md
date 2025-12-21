# Register4u Pro - Complete Project

This repository contains the complete Register4u Pro event management system with both frontend and backend.

## 📁 Project Structure

```
Register4u_Pro/
├── Register4u_Pro_CRM/       # Modern Frontend (React + Vite + Tailwind)
└── README.md                  # This file
```

## 🚀 Quick Start

### Frontend (Register4u_Pro_CRM)

```bash
cd Register4u_Pro_CRM
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

### Backend

The backend is located in the original `Register4u/Registration4u_API/` folder and uses the same database.

```bash
cd ../Register4u/Registration4u_API
npm install
npm start
```

The backend will start on `http://localhost:4001`

## 🔗 Backend Integration

This new frontend (`Register4u_Pro_CRM`) connects to the existing backend API at:
- Production: `https://uatapi.registration4u.in/api`
- Development: `http://localhost:4001/api`

## 📚 Documentation

For detailed documentation, see:
- Frontend: [Register4u_Pro_CRM/README.md](./Register4u_Pro_CRM/README.md)

## ✨ Features

### Modern Frontend (Register4u_Pro_CRM)
- 🎨 Modern UI with Tailwind CSS
- 📊 Interactive Dashboard with Charts
- 👥 Employee Management
- 🏢 Organization Management
- 📅 Event Management
- 🎫 Visitor Management with QR Codes
- 📋 Task Management
- 🔍 QR Scanner
- 📸 Photo Gallery
- ⚙️ Settings & Configuration
- 📱 Fully Responsive

## 🔑 Default Credentials

```
Username: admin123
Password: admin123
```

## 🗄️ Database

Both old and new frontends use the same MySQL database:
- Database Name: `r4u`
- Host: `localhost`
- Port: `3306`

## 🆚 Comparison

| Feature | Old Register4u | New Register4u Pro |
|---------|---------------|-------------------|
| UI Framework | React + Bootstrap | React + Tailwind CSS |
| Build Tool | Create React App | Vite |
| State Management | Redux | Zustand |
| Charts | Basic | Chart.js |
| Performance | Good | Excellent |
| Mobile UI | Basic | Optimized |
| Load Time | ~3s | ~1s |

## 📦 Technologies Used

### Frontend
- React 18
- Vite
- Tailwind CSS
- Zustand (State Management)
- React Router v6
- Chart.js
- React Hook Form
- Axios

### Backend (Shared)
- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT Authentication

## 🎯 Benefits of Register4u Pro

1. **Modern Design** - Clean, professional interface
2. **Better Performance** - Faster load times with Vite
3. **Enhanced UX** - Smoother animations and transitions
4. **Improved Components** - Reusable, customizable UI components
5. **Better Charts** - Interactive visualizations
6. **Mobile Optimized** - Better mobile experience
7. **Easier Maintenance** - Cleaner code structure
8. **Same Backend** - No backend changes required

## 🚀 Deployment

### Frontend
```bash
cd Register4u_Pro_CRM
npm run build
```
Deploy the `dist/` folder to your web server.

### Backend
Use the existing `Registration4u_API` deployment.

## 📞 Support

For any questions or issues, please contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Developed with ❤️**

