# Messages API Documentation

## Overview

The Messages API provides comprehensive messaging functionality for the KMIT PR App, supporting both college-wide broadcasts and club-specific communications with role-based permissions.

## Base URL
```
/api/messages
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Send Message

**POST** `/api/messages`

Send a broadcast message (college-wide or club-specific).

#### Request Body
```json
{
  "content": "string (required) - Message content",
  "targetType": "string (required) - 'college_wide' or 'club_specific'",
  "targetId": "string (optional) - Club ID for club-specific messages",
  "isUrgent": "boolean (optional) - Mark message as urgent (default: false)"
}
```

#### Permissions
- **College-wide messages**: Only PR council members
- **Club-specific messages**: Club heads (own club only) and PR council (any club)

#### Response
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "_id": "message_id",
      "content": "Message content",
      "sender": {
        "_id": "user_id",
        "name": "Sender Name",
        "role": "pr_council"
      },
      "targetType": "college_wide",
      "targetClub": null,
      "isUrgent": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Example Requests

**College-wide message (PR Council only):**
```bash
curl -X POST /api/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Important college announcement",
    "targetType": "college_wide",
    "isUrgent": true
  }'
```

**Club-specific message:**
```bash
curl -X POST /api/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Club meeting tomorrow at 3 PM",
    "targetType": "club_specific",
    "targetId": "club_id_here",
    "isUrgent": false
  }'
```

### 2. Get Messages

**GET** `/api/messages`

Retrieve messages with filtering and pagination based on user permissions.

#### Query Parameters
- `type` (optional): Filter by message type (`college_wide` or `club_specific`)
- `clubId` (optional): Filter by specific club ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 20, max: 50)
- `urgent` (optional): Filter urgent messages only (`true`)

#### User Access Rules
- **Students**: College-wide messages + messages from joined clubs
- **Club Heads**: College-wide messages + messages from own club
- **PR Council**: All messages

#### Response
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "content": "Message content",
        "sender": {
          "_id": "user_id",
          "name": "Sender Name",
          "role": "pr_council"
        },
        "targetType": "college_wide",
        "targetClub": null,
        "isUrgent": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "readBy": 5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalMessages": 45,
      "messagesPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### Example Requests

**Get all accessible messages:**
```bash
curl -X GET "/api/messages" \
  -H "Authorization: Bearer <token>"
```

**Get urgent college-wide messages:**
```bash
curl -X GET "/api/messages?type=college_wide&urgent=true" \
  -H "Authorization: Bearer <token>"
```

**Get messages with pagination:**
```bash
curl -X GET "/api/messages?page=2&limit=10" \
  -H "Authorization: Bearer <token>"
```

### 3. Get College-Wide Messages

**GET** `/api/messages/college-wide`

Retrieve only college-wide messages (accessible to all authenticated users).

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 20, max: 50)
- `urgent` (optional): Filter urgent messages only (`true`)

#### Response
```json
{
  "success": true,
  "message": "College-wide messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "content": "College announcement",
        "sender": {
          "_id": "user_id",
          "name": "PR Council Member",
          "role": "pr_council"
        },
        "isUrgent": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalMessages": 25,
      "messagesPerPage": 20
    }
  }
}
```

### 4. Get Club Messages

**GET** `/api/messages/club/:clubId`

Retrieve messages for a specific club.

#### Path Parameters
- `clubId`: Club ID

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 20, max: 50)
- `urgent` (optional): Filter urgent messages only (`true`)

#### Permissions
- **Club members**: Can view messages from their clubs
- **Club heads**: Can view messages from their own club
- **PR Council**: Can view messages from any club

#### Response
```json
{
  "success": true,
  "message": "Club messages retrieved successfully",
  "data": {
    "club": {
      "_id": "club_id",
      "name": "SAIL"
    },
    "messages": [
      {
        "_id": "message_id",
        "content": "Club-specific message",
        "sender": {
          "_id": "user_id",
          "name": "Club Head",
          "role": "club_head"
        },
        "isUrgent": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalMessages": 8,
      "messagesPerPage": 20
    }
  }
}
```

### 5. Mark Message as Read

**PUT** `/api/messages/:id/mark-read`

Mark a specific message as read by the current user.

#### Path Parameters
- `id`: Message ID

#### Response
```json
{
  "success": true,
  "message": "Message marked as read",
  "data": {
    "messageId": "message_id",
    "readAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Example Request
```bash
curl -X PUT "/api/messages/message_id_here/mark-read" \
  -H "Authorization: Bearer <token>"
```

### 6. Get My Club Messages

**GET** `/api/messages/my-clubs`

Retrieve messages from all clubs the current user is a member of.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 20, max: 50)
- `urgent` (optional): Filter urgent messages only (`true`)

#### User Access Rules
- **Students**: Messages from joined clubs
- **Club Heads**: Messages from own club
- **PR Council**: Messages from all clubs

#### Response
```json
{
  "success": true,
  "message": "Club messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "content": "Club message content",
        "sender": {
          "_id": "user_id",
          "name": "Club Head",
          "role": "club_head"
        },
        "targetClub": {
          "_id": "club_id",
          "name": "SAIL"
        },
        "isUrgent": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalMessages": 15,
      "messagesPerPage": 20
    }
  }
}
```

## Error Responses

### Common Error Codes

#### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELDS",
    "message": "Content and targetType are required"
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "NO_TOKEN",
    "message": "Access token is required"
  }
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Only PR council members can send college-wide messages"
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "CLUB_NOT_FOUND",
    "message": "Target club not found"
  }
}
```

### Specific Error Codes

| Code | Description |
|------|-------------|
| `MISSING_FIELDS` | Required fields are missing from request |
| `INVALID_TARGET_TYPE` | targetType must be 'college_wide' or 'club_specific' |
| `MISSING_TARGET_ID` | targetId required for club-specific messages |
| `INSUFFICIENT_PERMISSIONS` | User lacks permission for the operation |
| `ACCESS_DENIED` | User cannot access the requested resource |
| `CLUB_NOT_FOUND` | Specified club does not exist |
| `MESSAGE_NOT_FOUND` | Specified message does not exist |
| `NO_TOKEN` | Authentication token is missing |
| `TOKEN_EXPIRED` | Authentication token has expired |
| `INVALID_TOKEN` | Authentication token is invalid |

## Usage Examples

### Frontend Integration

#### Sending a College-Wide Message (PR Council)
```javascript
const sendCollegeMessage = async (content, isUrgent = false) => {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        targetType: 'college_wide',
        isUrgent
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Message sent successfully');
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
```

#### Retrieving Messages for Dashboard
```javascript
const getMessages = async (page = 1, urgent = false) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20'
    });
    
    if (urgent) params.append('urgent', 'true');
    
    const response = await fetch(`/api/messages?${params}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    const data = await response.json();
    return data.data.messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};
```

#### Club-Specific Messaging
```javascript
const sendClubMessage = async (clubId, content) => {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        targetType: 'club_specific',
        targetId: clubId
      })
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error sending club message:', error);
    return false;
  }
};
```

## Role-Based Access Summary

| Role | College-Wide Send | Club-Specific Send | View College-Wide | View Club Messages |
|------|-------------------|-------------------|-------------------|-------------------|
| **Student** | ❌ | ❌ | ✅ | ✅ (joined clubs only) |
| **Club Head** | ❌ | ✅ (own club only) | ✅ | ✅ (own club only) |
| **PR Council** | ✅ | ✅ (any club) | ✅ | ✅ (any club) |

## Database Indexes

The Message model includes the following indexes for optimal performance:

- `targetType`: For filtering by message type
- `createdAt`: For chronological sorting (newest first)
- `targetType + targetId`: Compound index for club-specific message queries
- `targetType + createdAt`: Compound index for efficient message listing

## Rate Limiting Considerations

While not implemented in the current version, consider adding rate limiting for message sending:

- College-wide messages: 5 per hour per user
- Club-specific messages: 20 per hour per user
- Message retrieval: 100 requests per minute per user

This helps prevent spam and ensures system stability.