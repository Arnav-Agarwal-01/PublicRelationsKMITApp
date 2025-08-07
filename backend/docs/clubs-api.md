# Club Management API Documentation

## Overview

The Club Management API provides endpoints for managing college clubs (SAIL, VAAN, LIFE, KRYPT), handling student enrollment requests, and managing club memberships.

## Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. List All Clubs
**GET** `/api/clubs`

Returns a list of all active clubs with basic information.

**Access:** All authenticated users

**Response:**
```json
{
  "success": true,
  "message": "Clubs retrieved successfully",
  "data": {
    "clubs": [
      {
        "_id": "club_id",
        "name": "SAIL",
        "description": "Software and AI Learning club",
        "category": "technical",
        "brandColor": "#00ff88",
        "clubHead": {
          "_id": "user_id",
          "name": "Club Head Name"
        },
        "memberCount": 25,
        "pendingRequestsCount": 3,
        "canJoin": true
      }
    ],
    "totalCount": 4
  }
}
```

### 2. Get User's Clubs
**GET** `/api/clubs/my-clubs`

Returns clubs that the current user is a member of.

**Access:** All authenticated users

**Response:**
```json
{
  "success": true,
  "message": "User clubs retrieved successfully",
  "data": {
    "clubs": [...],
    "totalCount": 2
  }
}
```

### 3. Get Club Details
**GET** `/api/clubs/:id`

Returns detailed information about a specific club.

**Access:** All authenticated users

**Response:**
```json
{
  "success": true,
  "message": "Club details retrieved successfully",
  "data": {
    "club": {
      "_id": "club_id",
      "name": "SAIL",
      "description": "Software and AI Learning club",
      "clubHead": {...},
      "memberCount": 25,
      "userStatus": {
        "isMember": false,
        "canManage": false,
        "hasPendingRequest": false
      },
      "members": [...], // Only visible to members, club heads, or PR council
      "pendingRequests": [...] // Only visible to club heads or PR council
    }
  }
}
```

### 4. Get Club Members
**GET** `/api/clubs/:id/members`

Returns the list of club members.

**Access:** Club members, club heads, or PR council

**Response:**
```json
{
  "success": true,
  "message": "Club members retrieved successfully",
  "data": {
    "clubName": "SAIL",
    "members": [
      {
        "_id": "user_id",
        "name": "Student Name",
        "rollNumber": "ROLL001"
      }
    ],
    "memberCount": 25
  }
}
```

### 5. Submit Join Request
**POST** `/api/clubs/:id/join-request`

Submit a request to join a club.

**Access:** Students only

**Response:**
```json
{
  "success": true,
  "message": "Join request submitted successfully",
  "data": {
    "clubName": "SAIL",
    "requestDate": "2025-01-08T10:30:00.000Z",
    "status": "pending"
  }
}
```

### 6. Approve/Reject Member
**PUT** `/api/clubs/:id/approve-member`

Approve or reject a join request.

**Access:** Club heads (own club only) or PR council

**Request Body:**
```json
{
  "userId": "user_id",
  "action": "approve" // or "reject"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Member approved and added to club successfully",
  "data": {
    "clubName": "SAIL",
    "action": "approve",
    "userId": "user_id"
  }
}
```

### 7. Remove Member
**DELETE** `/api/clubs/:id/remove-member`

Remove a member from the club.

**Access:** Club heads (own club only) or PR council

**Request Body:**
```json
{
  "userId": "user_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Member removed from club successfully",
  "data": {
    "clubName": "SAIL",
    "removedUserId": "user_id"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

- `CLUB_NOT_FOUND` - Club does not exist
- `ACCESS_DENIED` - Insufficient permissions
- `ALREADY_MEMBER` - User is already a club member
- `REQUEST_EXISTS` - Join request already pending
- `REQUEST_NOT_FOUND` - Join request not found
- `NOT_A_MEMBER` - User is not a club member
- `INVALID_REQUEST` - Invalid request data
- `SERVER_ERROR` - Internal server error

## Role-Based Access

### Students
- View all clubs and club details
- Submit join requests
- View members of clubs they belong to

### Club Heads
- All student permissions
- Approve/reject join requests for their club
- View pending requests for their club
- Remove members from their club

### PR Council
- All permissions for all clubs
- Can manage any club's membership
- Override club head permissions

## Requirements Coverage

✅ **8.1** - Club listing (SAIL, VAAN, LIFE, KRYPT)  
✅ **8.2** - Student enrollment requests  
✅ **8.3** - Club head approvals  
✅ **8.4** - Member management  
✅ **9.1** - Club enrollment management  
✅ **9.2** - Member operations  

## Setup

1. Ensure MongoDB is running
2. Run the club seeding script: `node scripts/seedClubs.js`
3. Start the server: `npm run dev`
4. Test endpoints using Postman or similar tool

## Testing

Run the club API tests:
```bash
node test/clubs.test.js
```

This will verify all functionality is working correctly.