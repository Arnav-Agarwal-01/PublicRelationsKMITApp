/**
 * New Authentication API Tests
 * 
 * Tests for the updated authentication system:
 * - Students: rollNumber + password (PR123$)
 * - Clubs: clubName + password (PR123$)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Club = require('../models/Club');

describe('New Authentication API', () => {
  let testStudent, testClubHead, testPRCouncil, testClub;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kmit-pr-test');
    }
  });

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await Club.deleteMany({});

    // Create test users with initial password PR123$
    testStudent = await User.create({
      name: 'Test Student',
      rollNumber: '21A91A0501',
      password: 'PR123$',
      role: 'student',
      isPasswordChanged: false
    });

    testClubHead = await User.create({
      name: 'SAIL Club Head',
      clubName: 'SAIL',
      password: 'PR123$',
      role: 'club_head',
      isPasswordChanged: false
    });

    testPRCouncil = await User.create({
      name: 'PR Council Member',
      clubName: 'PR COUNCIL',
      password: 'PR123$',
      role: 'pr_council',
      isPasswordChanged: false
    });

    // Create test club with club head
    testClub = await Club.create({
      name: 'SAIL',
      description: 'Software and AI Learning Club',
      clubHead: testClubHead._id,
      isActive: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/login', () => {
    describe('Student Login', () => {
      it('should login student with roll number and correct password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            rollNumber: '21A91A0501',
            password: 'PR123$',
            userType: 'student'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.user.rollNumber).toBe('21A91A0501');
        expect(response.body.data.user.role).toBe('student');
        expect(response.body.data.user.name).toBe('Test Student');
      });

      it('should handle case-insensitive roll number', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            rollNumber: '21a91a0501', // lowercase
            password: 'PR123$',
            userType: 'student'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.rollNumber).toBe('21A91A0501');
      });

      it('should reject student login with wrong password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            rollNumber: '21A91A0501',
            password: 'wrongpassword',
            userType: 'student'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      });

      it('should reject student login with non-existent roll number', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            rollNumber: '99X99X9999',
            password: 'PR123$',
            userType: 'student'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      });

      it('should require roll number for student login', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            password: 'PR123$',
            userType: 'student'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('MISSING_ROLL_NUMBER');
      });
    });

    describe('Club Head Login', () => {
      it('should login club head with club name and correct password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            clubName: 'SAIL',
            password: 'PR123$',
            userType: 'council'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.user.clubName).toBe('SAIL');
        expect(response.body.data.user.role).toBe('club_head');
        expect(response.body.data.user.name).toBe('SAIL Club Head');
      });

      it('should handle case-insensitive club name', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            clubName: 'sail', // lowercase
            password: 'PR123$',
            userType: 'council'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.clubName).toBe('SAIL');
      });

      it('should reject club head login with wrong password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            clubName: 'SAIL',
            password: 'wrongpassword',
            userType: 'council'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      });

      it('should reject club head login with non-existent club', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            clubName: 'NONEXISTENT',
            password: 'PR123$',
            userType: 'council'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      });

      it('should require club name for council login', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            password: 'PR123$',
            userType: 'council'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('MISSING_CLUB_NAME');
      });
    });

    describe('PR Council Login', () => {
      it('should login PR council member with "PR COUNCIL" and correct password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            clubName: 'PR COUNCIL',
            password: 'PR123$',
            userType: 'council'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.clubName).toBe('PR COUNCIL');
        expect(response.body.data.user.role).toBe('pr_council');
        expect(response.body.data.user.name).toBe('PR Council Member');
      });

      it('should handle case-insensitive PR council login', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            clubName: 'pr council', // lowercase
            password: 'PR123$',
            userType: 'council'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.clubName).toBe('PR COUNCIL');
      });
    });

    describe('General Validation', () => {
      it('should require password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            rollNumber: '21A91A0501',
            userType: 'student'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('MISSING_FIELDS');
      });

      it('should require userType', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            rollNumber: '21A91A0501',
            password: 'PR123$'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('MISSING_FIELDS');
      });

      it('should validate userType values', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            rollNumber: '21A91A0501',
            password: 'PR123$',
            userType: 'invalid'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      });
    });

    describe('JWT Token', () => {
      it('should generate valid JWT token with correct payload', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            rollNumber: '21A91A0501',
            password: 'PR123$',
            userType: 'student'
          })
          .expect(200);

        const token = response.body.data.token;
        expect(token).toBeDefined();

        // Verify token can be used for authenticated requests
        const verifyResponse = await request(app)
          .get('/api/auth/verify-token')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(verifyResponse.body.success).toBe(true);
        expect(verifyResponse.body.data.user.userId).toBe(testStudent._id.toString());
      });
    });
  });

  describe('POST /api/auth/change-password', () => {
    let studentToken;

    beforeEach(async () => {
      // Get token for authenticated requests
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          rollNumber: '21A91A0501',
          password: 'PR123$',
          userType: 'student'
        });
      
      studentToken = loginResponse.body.data.token;
    });

    it('should change password successfully', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          currentPassword: 'PR123$',
          newPassword: 'NewPassword123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');

      // Verify old password no longer works
      await request(app)
        .post('/api/auth/login')
        .send({
          rollNumber: '21A91A0501',
          password: 'PR123$',
          userType: 'student'
        })
        .expect(401);

      // Verify new password works
      await request(app)
        .post('/api/auth/login')
        .send({
          rollNumber: '21A91A0501',
          password: 'NewPassword123!',
          userType: 'student'
        })
        .expect(200);
    });

    it('should reject change with wrong current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CURRENT_PASSWORD');
    });

    it('should validate new password requirements', async () => {
      // Test short password
      const shortPasswordResponse = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          currentPassword: 'PR123$',
          newPassword: 'short'
        })
        .expect(400);

      expect(shortPasswordResponse.body.error.code).toBe('WEAK_PASSWORD');

      // Test password without special character
      const noSpecialResponse = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          currentPassword: 'PR123$',
          newPassword: 'longpassword123'
        })
        .expect(400);

      expect(noSpecialResponse.body.error.code).toBe('WEAK_PASSWORD');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'PR123$',
          newPassword: 'NewPassword123!'
        })
        .expect(401);

      expect(response.body.error.code).toBe('NO_TOKEN');
    });
  });

  describe('GET /api/auth/verify-token', () => {
    it('should verify valid token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          rollNumber: '21A91A0501',
          password: 'PR123$',
          userType: 'student'
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.userId).toBe(testStudent._id.toString());
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should require token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .expect(401);

      expect(response.body.error.code).toBe('NO_TOKEN');
    });
  });
});