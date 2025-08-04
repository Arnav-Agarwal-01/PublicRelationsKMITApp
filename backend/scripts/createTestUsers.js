/**
 * Script to create test users for authentication testing
 * 
 * This creates:
 * - A test student with initial password "Kmit123$"
 * - A test club head with initial password "Councilkmit25"
 * - A test PR council member with initial password "Councilkmit25"
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createTestUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing test users
        await User.deleteMany({
            $or: [
                { rollNumber: 'TEST001' },
                { clubName: 'Test Club' },
                { clubName: 'PR Council' }
            ]
        });
        console.log('🧹 Cleared existing test users');

        // Create test student
        const testStudent = new User({
            name: 'Test Student',
            rollNumber: 'TEST001',
            password: 'Kmit123$',
            role: 'student',
            isPasswordChanged: false
        });
        await testStudent.save();
        console.log('👨‍🎓 Created test student:', {
            name: testStudent.name,
            rollNumber: testStudent.rollNumber,
            role: testStudent.role
        });

        // Create test club head
        const testClubHead = new User({
            name: 'Test Club Head',
            clubName: 'Test Club',
            password: 'Councilkmit25',
            role: 'club_head',
            isPasswordChanged: false
        });
        await testClubHead.save();
        console.log('👨‍💼 Created test club head:', {
            name: testClubHead.name,
            clubName: testClubHead.clubName,
            role: testClubHead.role
        });

        // Create test PR council member
        const testPRCouncil = new User({
            name: 'Test PR Council',
            clubName: 'PR Council',
            password: 'Councilkmit25',
            role: 'pr_council',
            isPasswordChanged: false
        });
        await testPRCouncil.save();
        console.log('👨‍💻 Created test PR council member:', {
            name: testPRCouncil.name,
            clubName: testPRCouncil.clubName,
            role: testPRCouncil.role
        });

        console.log('\n🎉 Test users created successfully!');
        console.log('\nTest credentials:');
        console.log('Student Login:');
        console.log('  Name: Test Student');
        console.log('  Roll Number: TEST001');
        console.log('  Password: Kmit123$');
        console.log('\nClub Head Login:');
        console.log('  Name: Test Club Head');
        console.log('  Club Name: Test Club');
        console.log('  Password: Councilkmit25');
        console.log('\nPR Council Login:');
        console.log('  Name: Test PR Council');
        console.log('  Club Name: PR Council');
        console.log('  Password: Councilkmit25');

    } catch (error) {
        console.error('❌ Error creating test users:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    }
};

// Run the script
createTestUsers();