# Authentication API Documentation

## Overview

The authentication system supports three types of users with simplified login:
- **Students**: Login with roll number + initial password "PR123$"
- **Club Heads**: Login with club name + initial password "PR123$"  
- **PR Council**: Login with "PR COUNCIL" + initial password "PR123$"

## Endpoints

### POST /api/auth/login

Authenticates users and returns a JWT token.

**Request Body:**
```json
{
  "rollNumber": "21A91A0501",  // For students only
  "clubName": "SAIL",          // For council members only
  "password": "PR123$",        // Initial password for all users
  "userType": "student"        // "student" or "council"
}
```

**Student Login Example:**
```json
{
  "rollNumber": "21A91A0501",
  "password": "PR123$",
  "userType": "student"
}
```

**Club Head Login Example:**
```json
{
  "clubName": "SAIL",
  "password": "PR123$",
  "userType": "council"
}
```

**PR Council Login Example:**
```json
{
  "clubName": "PR COUNCIL",
  "password": "PR123$",
  "userType": "council"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "name": "User Name",
      "role": "student",
      "rollNumber": "ROLL001",
      "clubName": null,
      "isPasswordChanged": false,
      "joinedClubs": []
    }
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Invalid credentials

### POST /api/auth/change-password

Changes user password. Requires authentication token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one special character

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` - Missing fields or weak password
- `401` - Invalid current password or token
- `404` - User not found

### GET /api/auth/verify-token

Verifies if the provided token is valid.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "userId": "user_id",
      "name": "User Name",
      "role": "student",
      "rollNumber": "ROLL001",
      "clubName": null
    }
  }
}
```

## Authentication Flow

### Initial Login
1. All users start with the same initial password: `"PR123$"`

2. Login credentials:
   - **Students**: Roll number (e.g., "21A91A0501") + "PR123$"
   - **Club Heads**: Club name (e.g., "SAIL") + "PR123$"
   - **PR Council**: "PR COUNCIL" + "PR123$"

3. Users can change their password after login using the change-password endpoint

4. JWT tokens expire after 45 days (1.5 months)

### Using Protected Endpoints
1. Include JWT token in Authorization header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

2. Token will be validated on each request

3. User information is available in `req.user` for protected routes

## Error Codes

| Code | Description |
|------|-------------|
| `MISSING_FIELDS` | Required fields are missing |
| `MISSING_ROLL_NUMBER` | Roll number required for student login |
| `MISSING_CLUB_NAME` | Club name required for council login |
| `INVALID_CREDENTIALS` | Username/password combination is incorrect |
| `WEAK_PASSWORD` | Password doesn't meet requirements |
| `NO_TOKEN` | Authorization token is missing |
| `TOKEN_EXPIRED` | JWT token has expired |
| `INVALID_TOKEN` | JWT token is malformed |
| `USER_NOT_FOUND` | User no longer exists |
| `SERVER_ERROR` | Internal server error |

## Testing with cURL

### Student Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "rollNumber": "21A91A0501", 
    "password": "PR123$",
    "userType": "student"
  }'
```

### Club Head Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "clubName": "SAIL",
    "password": "PR123$",
    "userType": "council"
  }'
```

### PR Council Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "clubName": "PR COUNCIL",
    "password": "PR123$",
    "userType": "council"
  }'
```

### Change Password
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "PR123$",
    "newPassword": "MyNewPassword123!"
  }'
```

### Verify Token
```bash
curl -X GET http://localhost:3000/api/auth/verify-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```