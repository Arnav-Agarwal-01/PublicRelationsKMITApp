# Simple Event API Guide

## What This API Does

This API lets you manage college events. Students can view and register for events. Club heads can create events for their club. PR council can manage all events.

## How to Use

### 1. Authentication

All requests need a login token in the header:
```
Authorization: Bearer your-token-here
```

### 2. Get All Events

**GET** `/api/events`

Shows all events in the college.

**Example:**
```bash
curl -H "Authorization: Bearer your-token" http://localhost:3000/api/events
```

### 3. Get Events for a Date

**GET** `/api/events/2024-02-15`

Shows events for February 15, 2024.

### 4. Create an Event

**POST** `/api/events`

Only club heads and PR council can do this.

**Send this data:**
```json
{
  "title": "Tech Workshop",
  "description": "Learn coding",
  "date": "2024-02-15",
  "startTime": "14:00",
  "endTime": "16:00",
  "venue": "Computer Lab",
  "clubId": "your-club-id-here"
}
```

### 5. Update an Event

**PUT** `/api/events/event-id-here`

Only the club that created it (or PR council) can update.

**Send any fields you want to change:**
```json
{
  "title": "Updated Workshop Title",
  "venue": "New Venue"
}
```

### 6. Delete an Event

**DELETE** `/api/events/event-id-here`

Only the club that created it (or PR council) can delete.

### 7. Register for Event (Students)

**POST** `/api/events/event-id-here/register`

Students can register for events.

### 8. Unregister from Event (Students)

**DELETE** `/api/events/event-id-here/register`

Students can cancel their registration.

## Who Can Do What

### Students
- ✅ View all events
- ✅ Register for events
- ✅ Unregister from events
- ❌ Create/edit/delete events

### Club Heads
- ✅ View all events
- ✅ Create events for their club
- ✅ Edit/delete their club's events
- ❌ Manage other clubs' events

### PR Council
- ✅ View all events
- ✅ Create events for any club
- ✅ Edit/delete any event
- ✅ Full control

## Error Messages

If something goes wrong, you'll get a response like:
```json
{
  "success": false,
  "message": "What went wrong"
}
```

## Success Messages

When things work, you'll get:
```json
{
  "success": true,
  "message": "What happened",
  "event": { ... event data ... }
}
```

## Testing with Postman

1. Set Authorization header: `Bearer your-token`
2. Set Content-Type: `application/json`
3. Use the endpoints above
4. Check the response

That's it! The API is simple and straightforward.