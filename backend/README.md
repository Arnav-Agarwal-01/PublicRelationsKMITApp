# KMIT PR App Backend

Backend API server for the KMIT College Event Management App built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

4. Start development server:
```bash
npm run dev
```

5. Test the server:
```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api
```

## 📁 Project Structure

```
backend/
├── controllers/     # Business logic handlers
├── middleware/      # Custom middleware functions
├── models/         # MongoDB/Mongoose data models
├── routes/         # API route definitions
├── server.js       # Main server file
├── package.json    # Dependencies and scripts
└── .env           # Environment variables
```

## 🔧 Environment Variables

Required environment variables (see `.env.example`):

- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## 📚 API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication (Coming Soon)
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Password change

### Events (Coming Soon)
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Clubs (Coming Soon)
- `GET /api/clubs` - Get all clubs
- `POST /api/clubs/:id/join-request` - Join club request

### Users (Coming Soon)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🛠️ Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## 🔒 Security Features

- JWT-based authentication with 1.5 month expiry
- Password hashing with bcrypt
- CORS configuration for mobile app
- Input validation and sanitization
- Error handling with sanitized responses

## 📱 Mobile App Integration

The backend is configured to work with React Native/Expo apps:
- CORS enabled for development servers
- JSON API responses
- Mobile-friendly error messages
- Expo push notification support (coming soon)

## 🚀 Deployment

The backend is ready for deployment on:
- Render
- Heroku
- Railway
- Vercel (serverless functions)

Make sure to set environment variables in your deployment platform.

## 📝 Next Steps

1. Implement authentication endpoints (Task 4)
2. Create MongoDB data models (Task 3)
3. Build event management API (Task 9)
4. Add club management features (Task 11)
5. Implement messaging system (Task 13)

## 🤝 Contributing

This is a learning project for KMIT college students. Code is extensively commented for educational purposes.

## 📄 License

ISC License - See package.json for details.