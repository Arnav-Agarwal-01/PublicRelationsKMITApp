# Test Users for KMIT PR App

## Overview

The database has been seeded with test users for development and testing purposes. All users have the initial password **"PR123$"**.

## Login Credentials

### 👨‍🎓 Students (Login with Roll Number + PR123$)

| Name | Roll Number | Password | Role |
|------|-------------|----------|------|
| John Doe | 21A91A0501 | PR123$ | student |
| Jane Smith | 21A91A0502 | PR123$ | student |
| Mike Johnson | 21A91A0503 | PR123$ | student |
| Sarah Wilson | 21A91A0504 | PR123$ | student |
| David Brown | 21A91A0505 | PR123$ | student |

### 👨‍💼 Club Heads (Login with Club Name + PR123$)

| Name | Club Name | Password | Role |
|------|-----------|----------|------|
| SAIL Club Head | SAIL | PR123$ | club_head |
| VAAN Club Head | VAAN | PR123$ | club_head |
| LIFE Club Head | LIFE | PR123$ | club_head |
| KRYPT Club Head | KRYPT | PR123$ | club_head |

### 🏛️ PR Council (Login with "PR COUNCIL" + PR123$)

| Name | Club Name | Password | Role |
|------|-----------|----------|------|
| PR Council Member | PR COUNCIL | PR123$ | pr_council |

## Clubs Created

| Club Name | Description | Category | Club Head |
|-----------|-------------|----------|-----------|
| SAIL | Software and AI Learning Club | technical | SAIL Club Head |
| VAAN | Aerospace and Aviation Club | technical | VAAN Club Head |
| LIFE | Literary and Cultural Club | cultural | LIFE Club Head |
| KRYPT | Cybersecurity and Cryptography Club | technical | KRYPT Club Head |

## Login Examples

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

## Frontend Integration

For frontend development, you can use these credentials to test different user roles:

### Student Dashboard Testing
- Use any student roll number (21A91A0501 to 21A91A0505)
- Password: PR123$
- Should see student-specific features

### Club Management Testing
- Use club names: SAIL, VAAN, LIFE, or KRYPT
- Password: PR123$
- Should see club head management features

### Admin Testing
- Use "PR COUNCIL" as club name
- Password: PR123$
- Should see all administrative features

## Resetting Test Data

To reset the test data, run:
```bash
cd kmit-pr-app/backend
node scripts/seedUsers.js
```

This will:
1. Clear all existing users and clubs
2. Create fresh test data with the same credentials
3. Link club heads to their respective clubs

## Security Notes

- **Initial Password**: All users start with "PR123$"
- **Password Change**: Users can change their password using the `/api/auth/change-password` endpoint
- **Token Expiry**: JWT tokens expire after 45 days
- **Case Insensitive**: Roll numbers and club names are case-insensitive during login

## API Testing

You can test all authentication endpoints with these credentials:

1. **Login** - Use the credentials above
2. **Change Password** - Use the returned JWT token
3. **Verify Token** - Test token validation
4. **Protected Endpoints** - Test role-based access

All backend APIs (events, clubs, messages, hall of fame) can be tested with these user accounts.