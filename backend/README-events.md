# Event Management API - Simple Guide

## What You Get

A simple, production-ready API for managing college events. No complex code, just what you need.

## Key Features

✅ **Simple & Clean** - Easy to understand code  
✅ **Production Ready** - Proper error handling and security  
✅ **Role-Based Access** - Students, Club Heads, PR Council  
✅ **Complete CRUD** - Create, Read, Update, Delete events  
✅ **Event Registration** - Students can register/unregister  

## Quick Start

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test it works:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Login to get a token:**
   ```bash
   curl -X POST -H "Content-Type: application/json" \
        -d '{"name":"Your Name","rollNumber":"123","password":"your-password","userType":"student"}' \
        http://localhost:3000/api/auth/login
   ```

4. **Use the token to get events:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:3000/api/events
   ```

## API Endpoints

| Method | Endpoint | Who Can Use | What It Does |
|--------|----------|-------------|--------------|
| GET | `/api/events` | Everyone | Get all events |
| GET | `/api/events/:date` | Everyone | Get events for date |
| POST | `/api/events` | Club Heads, PR | Create event |
| PUT | `/api/events/:id` | Club Heads, PR | Update event |
| DELETE | `/api/events/:id` | Club Heads, PR | Delete event |
| POST | `/api/events/:id/register` | Students | Register for event |
| DELETE | `/api/events/:id/register` | Students | Unregister |

## Code Structure

```
routes/events.js          # Main API code (simple & clean)
models/Event.js           # Database structure
middleware/auth.js        # Security & permissions
test/events-simple.test.js # Basic tests
docs/simple-api-guide.md  # How to use
examples/api-examples.js  # Copy-paste examples
```

## What Makes It Simple

### 1. **Clear Functions**
```javascript
// Easy to understand
router.get('/', authenticateToken, async (req, res) => {
  const events = await Event.find().populate('clubId', 'name');
  res.json({ success: true, events });
});
```

### 2. **Simple Error Handling**
```javascript
// Just return what went wrong
res.status(500).json({
  success: false,
  message: 'Error getting events'
});
```

### 3. **Easy Permissions**
```javascript
// Clear helper function
const canManageEvent = async (user, eventId) => {
  if (user.role === 'pr_council') return true;
  // ... simple logic
};
```

## Testing

Run the simple test:
```bash
node test/events-simple.test.js
```

See examples:
```bash
node examples/api-examples.js
```

## Common Tasks

### Create an Event
```javascript
const eventData = {
  title: "Workshop",
  description: "Learn something new",
  date: "2024-02-15",
  startTime: "14:00",
  endTime: "16:00",
  venue: "Room 101",
  clubId: "your-club-id"
};
```

### Register for Event
```javascript
// Just POST to /api/events/:id/register
// No data needed, user comes from token
```

### Check Who's Registered
```javascript
// GET /api/events/:date returns events with registeredUsers
```

## Security Features

- ✅ JWT token authentication
- ✅ Role-based permissions
- ✅ Input validation
- ✅ Error handling
- ✅ No sensitive data exposure

## Production Ready

- ✅ Proper error responses
- ✅ Database indexing
- ✅ Input sanitization
- ✅ CORS configured
- ✅ Environment variables

## Need Help?

1. Check `docs/simple-api-guide.md` for usage
2. Look at `examples/api-examples.js` for code samples
3. Run `test/events-simple.test.js` to verify setup
4. Check server logs for errors

## What's Different from Complex Version

❌ **Removed:** Excessive validation, complex error codes, verbose comments  
❌ **Removed:** Over-engineered features, unnecessary complexity  
✅ **Kept:** All functionality, security, production readiness  
✅ **Added:** Simplicity, clarity, ease of understanding  

This is the same powerful API, just easier to work with!