/**
 * Messages API Tests
 * 
 * Tests for messaging system functionality including:
 * - Sending college-wide and club-specific messages
 * - Message retrieval with filtering and pagination
 * - Role-based permissions
 * - Message read tracking
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Club = require('../models/Club');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

describe('Messages API', () => {
  let prCouncilUser, prCouncilToken;
  let clubHeadUser, clubHeadToken;
  let studentUser, studentToken;
  let testClub;

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
    await Message.deleteMany({});

    // Create test users
    prCouncilUser = await User.create({
      name: 'PR Council Member',
      clubName: 'PR Council',
      password: 'hashedpassword',
      role: 'pr_council',
      isPasswordChanged: true
    });

    clubHeadUser = await User.create({
      name: 'Club Head',
      clubName: 'SAIL',
      password: 'hashedpassword',
      role: 'club_head',
      isPasswordChanged: true
    });

    studentUser = await User.create({
      name: 'Test Student',
      rollNumber: 'ST001',
      password: 'hashedpassword',
      role: 'student',
      isPasswordChanged: true
    });

    // Create test club
    testClub = await Club.create({
      name: 'SAIL',
      description: 'Software and AI Learning Club',
      clubHead: clubHeadUser._id,
      members: [studentUser._id],
      isActive: true
    });

    // Add club to student's joinedClubs
    studentUser.joinedClubs = [testClub._id];
    await studentUser.save();

    // Generate tokens
    prCouncilToken = jwt.sign(
      {
        userId: prCouncilUser._id,
        name: prCouncilUser.name,
        role: prCouncilUser.role,
        clubName: prCouncilUser.clubName
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    clubHeadToken = jwt.sign(
      {
        userId: clubHeadUser._id,
        name: clubHeadUser.name,
        role: clubHeadUser.role,
        clubName: clubHeadUser.clubName
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    studentToken = jwt.sign(
      {
        userId: studentUser._id,
        name: studentUser.name,
        role: studentUser.role,
        rollNumber: studentUser.rollNumber
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/messages', () => {
    it('should allow PR council to send college-wide message', async () => {
      const messageData = {
        content: 'Important college announcement',
        targetType: 'college_wide',
        isUrgent: true
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message.content).toBe(messageData.content);
      expect(response.body.data.message.targetType).toBe('college_wide');
      expect(response.body.data.message.isUrgent).toBe(true);
    });

    it('should allow club head to send club-specific message', async () => {
      const messageData = {
        content: 'Club meeting tomorrow',
        targetType: 'club_specific',
        targetId: testClub._id.toString(),
        isUrgent: false
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${clubHeadToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message.content).toBe(messageData.content);
      expect(response.body.data.message.targetType).toBe('club_specific');
    });

    it('should allow PR council to send club-specific message', async () => {
      const messageData = {
        content: 'PR message to club',
        targetType: 'club_specific',
        targetId: testClub._id.toString()
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message.targetType).toBe('club_specific');
    });

    it('should reject student trying to send college-wide message', async () => {
      const messageData = {
        content: 'Student trying to send college message',
        targetType: 'college_wide'
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(messageData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should reject club head trying to send to another club', async () => {
      // Create another club
      const anotherClub = await Club.create({
        name: 'VAAN',
        description: 'Another club',
        clubHead: prCouncilUser._id,
        isActive: true
      });

      const messageData = {
        content: 'Trying to send to another club',
        targetType: 'club_specific',
        targetId: anotherClub._id.toString()
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${clubHeadToken}`)
        .send(messageData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_FIELDS');
    });

    it('should validate targetType', async () => {
      const messageData = {
        content: 'Test message',
        targetType: 'invalid_type'
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .send(messageData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TARGET_TYPE');
    });

    it('should require targetId for club-specific messages', async () => {
      const messageData = {
        content: 'Club message without target',
        targetType: 'club_specific'
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${clubHeadToken}`)
        .send(messageData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TARGET_ID');
    });
  });

  describe('GET /api/messages', () => {
    beforeEach(async () => {
      // Create test messages
      await Message.create({
        content: 'College-wide message 1',
        sender: prCouncilUser._id,
        targetType: 'college_wide',
        isUrgent: true
      });

      await Message.create({
        content: 'College-wide message 2',
        sender: prCouncilUser._id,
        targetType: 'college_wide',
        isUrgent: false
      });

      await Message.create({
        content: 'Club message 1',
        sender: clubHeadUser._id,
        targetType: 'club_specific',
        targetId: testClub._id,
        isUrgent: false
      });
    });

    it('should retrieve messages for student', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(3); // 2 college-wide + 1 club message
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should retrieve messages for club head', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${clubHeadToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(3); // 2 college-wide + 1 own club message
    });

    it('should retrieve all messages for PR council', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(3);
    });

    it('should filter by message type', async () => {
      const response = await request(app)
        .get('/api/messages?type=college_wide')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(2);
      expect(response.body.data.messages.every(msg => msg.targetType === 'college_wide')).toBe(true);
    });

    it('should filter urgent messages', async () => {
      const response = await request(app)
        .get('/api/messages?urgent=true')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
      expect(response.body.data.messages[0].isUrgent).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/messages?page=1&limit=2')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalMessages).toBe(3);
    });
  });

  describe('GET /api/messages/college-wide', () => {
    beforeEach(async () => {
      await Message.create({
        content: 'College announcement',
        sender: prCouncilUser._id,
        targetType: 'college_wide',
        isUrgent: true
      });
    });

    it('should retrieve college-wide messages', async () => {
      const response = await request(app)
        .get('/api/messages/college-wide')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
      expect(response.body.data.messages[0].content).toBe('College announcement');
    });
  });

  describe('GET /api/messages/club/:clubId', () => {
    beforeEach(async () => {
      await Message.create({
        content: 'Club specific message',
        sender: clubHeadUser._id,
        targetType: 'club_specific',
        targetId: testClub._id
      });
    });

    it('should allow club member to view club messages', async () => {
      const response = await request(app)
        .get(`/api/messages/club/${testClub._id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
      expect(response.body.data.club.name).toBe('SAIL');
    });

    it('should allow club head to view own club messages', async () => {
      const response = await request(app)
        .get(`/api/messages/club/${testClub._id}`)
        .set('Authorization', `Bearer ${clubHeadToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
    });

    it('should allow PR council to view any club messages', async () => {
      const response = await request(app)
        .get(`/api/messages/club/${testClub._id}`)
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
    });

    it('should reject non-member access', async () => {
      // Create another student not in the club
      const nonMemberUser = await User.create({
        name: 'Non Member',
        rollNumber: 'ST002',
        password: 'hashedpassword',
        role: 'student',
        isPasswordChanged: true
      });

      const nonMemberToken = jwt.sign(
        {
          userId: nonMemberUser._id,
          name: nonMemberUser.name,
          role: nonMemberUser.role,
          rollNumber: nonMemberUser.rollNumber
        },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get(`/api/messages/club/${testClub._id}`)
        .set('Authorization', `Bearer ${nonMemberToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });
  });

  describe('PUT /api/messages/:id/mark-read', () => {
    let testMessage;

    beforeEach(async () => {
      testMessage = await Message.create({
        content: 'Test message for reading',
        sender: prCouncilUser._id,
        targetType: 'college_wide'
      });
    });

    it('should mark message as read', async () => {
      const response = await request(app)
        .put(`/api/messages/${testMessage._id}/mark-read`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messageId).toBe(testMessage._id.toString());

      // Verify in database
      const updatedMessage = await Message.findById(testMessage._id);
      expect(updatedMessage.readBy).toHaveLength(1);
      expect(updatedMessage.readBy[0].userId.toString()).toBe(studentUser._id.toString());
    });

    it('should handle already read message', async () => {
      // Mark as read first
      await request(app)
        .put(`/api/messages/${testMessage._id}/mark-read`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      // Try to mark as read again
      const response = await request(app)
        .put(`/api/messages/${testMessage._id}/mark-read`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('already marked as read');
    });

    it('should handle non-existent message', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/messages/${fakeId}/mark-read`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MESSAGE_NOT_FOUND');
    });
  });

  describe('GET /api/messages/my-clubs', () => {
    beforeEach(async () => {
      await Message.create({
        content: 'Message to my club',
        sender: clubHeadUser._id,
        targetType: 'club_specific',
        targetId: testClub._id
      });
    });

    it('should retrieve messages from user\'s clubs', async () => {
      const response = await request(app)
        .get('/api/messages/my-clubs')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
      expect(response.body.data.messages[0].targetClub.name).toBe('SAIL');
    });

    it('should return empty for user with no clubs', async () => {
      // Create user with no clubs
      const noClubUser = await User.create({
        name: 'No Club User',
        rollNumber: 'ST003',
        password: 'hashedpassword',
        role: 'student',
        isPasswordChanged: true
      });

      const noClubToken = jwt.sign(
        {
          userId: noClubUser._id,
          name: noClubUser.name,
          role: noClubUser.role,
          rollNumber: noClubUser.rollNumber
        },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/messages/my-clubs')
        .set('Authorization', `Bearer ${noClubToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(0);
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        { method: 'post', path: '/api/messages' },
        { method: 'get', path: '/api/messages' },
        { method: 'get', path: '/api/messages/college-wide' },
        { method: 'get', path: `/api/messages/club/${testClub._id}` },
        { method: 'get', path: '/api/messages/my-clubs' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path)
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NO_TOKEN');
      }
    });
  });
});