/**
 * Simple API Usage Examples
 * 
 * Copy these examples to test the API with curl or JavaScript
 */

// ============================================
// CURL EXAMPLES (use in terminal)
// ============================================

console.log(`
📋 CURL Examples for Testing Event API

1. Get all events:
curl -H "Authorization: Bearer YOUR_TOKEN" \\
     http://localhost:3000/api/events

2. Get events for a specific date:
curl -H "Authorization: Bearer YOUR_TOKEN" \\
     http://localhost:3000/api/events/2024-02-15

3. Create a new event (Club Head/PR Council):
curl -X POST \\
     -H "Authorization: Bearer YOUR_TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{
       "title": "Tech Workshop",
       "description": "Learn latest technologies",
       "date": "2024-02-15",
       "startTime": "14:00",
       "endTime": "16:00",
       "venue": "Computer Lab",
       "clubId": "YOUR_CLUB_ID_HERE"
     }' \\
     http://localhost:3000/api/events

4. Update an event:
curl -X PUT \\
     -H "Authorization: Bearer YOUR_TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{
       "title": "Updated Workshop Title",
       "venue": "New Venue"
     }' \\
     http://localhost:3000/api/events/EVENT_ID_HERE

5. Delete an event:
curl -X DELETE \\
     -H "Authorization: Bearer YOUR_TOKEN" \\
     http://localhost:3000/api/events/EVENT_ID_HERE

6. Register for event (Students):
curl -X POST \\
     -H "Authorization: Bearer YOUR_TOKEN" \\
     http://localhost:3000/api/events/EVENT_ID_HERE/register

7. Unregister from event (Students):
curl -X DELETE \\
     -H "Authorization: Bearer YOUR_TOKEN" \\
     http://localhost:3000/api/events/EVENT_ID_HERE/register
`);

// ============================================
// JAVASCRIPT EXAMPLES (for frontend)
// ============================================

const API_BASE = 'http://localhost:3000/api';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = 'YOUR_JWT_TOKEN_HERE'; // Get this from login
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  return response.json();
};

// Example functions you can use in your frontend
const eventAPI = {
  
  // Get all events
  getAllEvents: async () => {
    return await apiCall('/events');
  },
  
  // Get events for a specific date
  getEventsByDate: async (date) => {
    return await apiCall(`/events/${date}`);
  },
  
  // Create new event
  createEvent: async (eventData) => {
    return await apiCall('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },
  
  // Update event
  updateEvent: async (eventId, updateData) => {
    return await apiCall(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },
  
  // Delete event
  deleteEvent: async (eventId) => {
    return await apiCall(`/events/${eventId}`, {
      method: 'DELETE'
    });
  },
  
  // Register for event
  registerForEvent: async (eventId) => {
    return await apiCall(`/events/${eventId}/register`, {
      method: 'POST'
    });
  },
  
  // Unregister from event
  unregisterFromEvent: async (eventId) => {
    return await apiCall(`/events/${eventId}/register`, {
      method: 'DELETE'
    });
  }
};

// Example usage:
console.log(`
📱 JavaScript Examples for Frontend

// Get all events
const events = await eventAPI.getAllEvents();
console.log(events);

// Create an event
const newEvent = await eventAPI.createEvent({
  title: "Tech Workshop",
  description: "Learn coding",
  date: "2024-02-15",
  startTime: "14:00",
  endTime: "16:00",
  venue: "Computer Lab",
  clubId: "your-club-id"
});

// Register for an event
const registration = await eventAPI.registerForEvent("event-id-here");
`);

console.log(`
🔧 How to Get Started:

1. Start the server:
   npm run dev

2. Get a login token:
   - Use the auth API to login
   - Copy the token from the response

3. Replace YOUR_TOKEN in examples above

4. Test with curl or use JavaScript in your frontend

5. Check server logs for any errors
`);

module.exports = { eventAPI };