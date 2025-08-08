/**
 * Hall of Fame Integration Tests
 * 
 * Tests the Hall of Fame API endpoints with proper authentication
 * Requirements: 12.1, 12.2, 12.4, 12.5
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const HallOfFame = require('../models/HallOfFame');
const jwt = require('jsonwebtoken');

describe('Hall of Fame API Integration Tests', () => {
  let prCouncilToken;
  let studentToken;
  let prCouncilUser;
  let studentUser;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kmit-pr-test');
    }

    // Clean up ALL existing test data
    await User.deleteMany({});
    await HallOfFame.deleteMany({});

    // Create test users
    prCouncilUser = await User.create({
      name: 'Test PR Council',
      clubName: 'PR',
      password: 'hashedpassword',
      role: 'pr_council',
      isPasswordChanged: true
    });

    studentUser = await User.create({
      name: 'Test Student',
      rollNumber: 'TEST001',
      password: 'hashedpassword',
      role: 'student',
      isPasswordChanged: true
    });

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
    // Clean up ALL test data
    await User.deleteMany({});
    await HallOfFame.deleteMany({});
    
    // Close database connection
    await mongoose.connection.close();
  });

  describe('GET /api/hall-of-fame/categories', () => {
    it('should return achievement categories for authenticated users', async () => {
      const response = await request(app)
        .get('/api/hall-of-fame/categories')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.categories).toHaveLength(5);
      expect(response.body.categories[0]).toEqual({
        value: 'academic',
        label: 'Academic'
      });
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/hall-of-fame/categories')
        .expect(401);
    });
  });

  describe('GET /api/hall-of-fame', () => {
    beforeEach(async () => {
      // Clean up any existing achievements
      await HallOfFame.deleteMany({});
      
      // Create test achievement
      await HallOfFame.create({
        title: 'Test Achievement',
        description: 'Test description',
        category: 'academic',
        achiever: {
          name: 'Test Student',
          rollNumber: 'TEST001',
          type: 'student'
        },
        date: new Date('2024-01-01'),
        isPublic: true,
        addedBy: prCouncilUser._id
      });
    });

    afterEach(async () => {
      await HallOfFame.deleteMany({});
    });

    it('should return achievements for authenticated users', async () => {
      const response = await request(app)
        .get('/api/hall-of-fame')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.achievements).toHaveLength(1);
      expect(response.body.achievements[0].title).toBe('Test Achievement');
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/hall-of-fame?category=academic')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.achievements).toHaveLength(1);
      expect(response.body.achievements[0].category).toBe('academic');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/hall-of-fame')
        .expect(401);
    });
  });

  describe('POST /api/hall-of-fame', () => {
    const validAchievement = {
      title: 'Test New Achievement',
      description: 'Test new description',
      category: 'sports',
      achiever: {
        name: 'Test Achiever',
        rollNumber: 'TEST002',
        type: 'student'
      },
      date: '2024-02-01'
    };

    afterEach(async () => {
      await HallOfFame.deleteMany({});
    });

    it('should create achievement for PR council', async () => {
      const response = await request(app)
        .post('/api/hall-of-fame')
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .send(validAchievement)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Achievement created');
      expect(response.body.achievement.title).toBe(validAchievement.title);
    });

    it('should reject creation for students', async () => {
      await request(app)
        .post('/api/hall-of-fame')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(validAchievement)
        .expect(403);
    });

    it('should validate required fields', async () => {
      const invalidAchievement = { title: 'Test' };
      
      const response = await request(app)
        .post('/api/hall-of-fame')
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .send(invalidAchievement)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });

    it('should validate category', async () => {
      const invalidCategory = { ...validAchievement, category: 'invalid' };
      
      const response = await request(app)
        .post('/api/hall-of-fame')
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .send(invalidCategory)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid category');
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/hall-of-fame')
        .send(validAchievement)
        .expect(401);
    });
  });

  describe('PUT /api/hall-of-fame/:id', () => {
    let achievementId;

    beforeEach(async () => {
      // Clean up any existing achievements
      await HallOfFame.deleteMany({});
      
      const achievement = await HallOfFame.create({
        title: 'Test Update Achievement',
        description: 'Test description',
        category: 'academic',
        achiever: {
          name: 'Test Student',
          rollNumber: 'TEST001',
          type: 'student'
        },
        date: new Date('2024-01-01'),
        isPublic: true,
        addedBy: prCouncilUser._id
      });
      achievementId = achievement._id;
    });

    afterEach(async () => {
      await HallOfFame.deleteMany({});
    });

    it('should update achievement for PR council', async () => {
      const updateData = { title: 'Updated Title' };
      
      const response = await request(app)
        .put(`/api/hall-of-fame/${achievementId}`)
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Achievement updated');
      expect(response.body.achievement.title).toBe('Updated Title');
    });

    it('should reject update for students', async () => {
      await request(app)
        .put(`/api/hall-of-fame/${achievementId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated' })
        .expect(403);
    });

    it('should return 404 for non-existent achievement', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/hall-of-fame/${fakeId}`)
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/hall-of-fame/:id', () => {
    let achievementId;

    beforeEach(async () => {
      // Clean up any existing achievements
      await HallOfFame.deleteMany({});
      
      const achievement = await HallOfFame.create({
        title: 'Test Delete Achievement',
        description: 'Test description',
        category: 'academic',
        achiever: {
          name: 'Test Student',
          rollNumber: 'TEST001',
          type: 'student'
        },
        date: new Date('2024-01-01'),
        isPublic: true,
        addedBy: prCouncilUser._id
      });
      achievementId = achievement._id;
    });

    afterEach(async () => {
      await HallOfFame.deleteMany({});
    });

    it('should delete achievement for PR council', async () => {
      const response = await request(app)
        .delete(`/api/hall-of-fame/${achievementId}`)
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Achievement deleted');

      // Verify deletion
      const deletedAchievement = await HallOfFame.findById(achievementId);
      expect(deletedAchievement).toBeNull();
    });

    it('should reject deletion for students', async () => {
      await request(app)
        .delete(`/api/hall-of-fame/${achievementId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent achievement', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .delete(`/api/hall-of-fame/${fakeId}`)
        .set('Authorization', `Bearer ${prCouncilToken}`)
        .expect(404);
    });
  });
});