/**
 * Seed Clubs Script
 * 
 * Creates the four main clubs: SAIL, VAAN, LIFE, KRYPT
 * This script should be run once to initialize the club data
 * 
 * Usage: node scripts/seedClubs.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Club = require('../models/Club');
const User = require('../models/User');

// Club data for KMIT
const clubsData = [
  {
    name: 'SAIL',
    description: 'Software and AI Learning club focused on programming, software development, and artificial intelligence technologies.',
    category: 'technical',
    brandColor: '#00ff88',
    establishedYear: 2020,
    logoUrl: null
  },
  {
    name: 'VAAN',
    description: 'Innovation and entrepreneurship club promoting startup culture and business development among students.',
    category: 'entrepreneurship',
    brandColor: '#3b82f6',
    establishedYear: 2019,
    logoUrl: null
  },
  {
    name: 'LIFE',
    description: 'Literary and cultural club organizing events, debates, creative writing, and cultural activities.',
    category: 'cultural',
    brandColor: '#f59e0b',
    establishedYear: 2018,
    logoUrl: null
  },
  {
    name: 'KRYPT',
    description: 'Cybersecurity and cryptography club focusing on information security, ethical hacking, and digital privacy.',
    category: 'security',
    brandColor: '#ef4444',
    establishedYear: 2021,
    logoUrl: null
  }
];

async function seedClubs() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if clubs already exist
    const existingClubs = await Club.find({});
    if (existingClubs.length > 0) {
      console.log('⚠️  Clubs already exist in database:');
      existingClubs.forEach(club => {
        console.log(`   - ${club.name} (ID: ${club._id})`);
      });
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('Do you want to recreate all clubs? This will delete existing clubs. (y/N): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Operation cancelled');
        process.exit(0);
      }
      
      // Delete existing clubs
      await Club.deleteMany({});
      console.log('🗑️  Deleted existing clubs');
    }

    // Create club head users for each club (if they don't exist)
    console.log('👥 Creating club head users...');
    const clubHeads = [];
    
    for (const clubData of clubsData) {
      const clubHeadName = `${clubData.name} Head`;
      const clubName = clubData.name;
      
      // Check if club head already exists
      let clubHead = await User.findOne({ clubName: clubName, role: 'club_head' });
      
      if (!clubHead) {
        clubHead = new User({
          name: clubHeadName,
          rollNumber: null, // Club heads don't have roll numbers
          clubName: clubName,
          password: '$2b$10$rQJ8vQZ9X.ZvQZ9X.ZvQZ9X.ZvQZ9X.ZvQZ9X.ZvQZ9X.ZvQZ9X.ZvQZ', // "Councilkmit25" hashed
          role: 'club_head',
          isPasswordChanged: false,
          joinedClubs: []
        });
        
        await clubHead.save();
        console.log(`   ✅ Created club head: ${clubHeadName}`);
      } else {
        console.log(`   ⚠️  Club head already exists: ${clubHeadName}`);
      }
      
      clubHeads.push(clubHead);
    }

    // Create clubs
    console.log('🏛️  Creating clubs...');
    const createdClubs = [];
    
    for (let i = 0; i < clubsData.length; i++) {
      const clubData = clubsData[i];
      const clubHead = clubHeads[i];
      
      const club = new Club({
        ...clubData,
        clubHead: clubHead._id,
        members: [],
        pendingRequests: [],
        isActive: true
      });
      
      await club.save();
      createdClubs.push(club);
      console.log(`   ✅ Created club: ${club.name} (Head: ${clubHead.name})`);
    }

    // Summary
    console.log('\n🎉 Club seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Created ${createdClubs.length} clubs`);
    console.log(`   - Created ${clubHeads.length} club head users`);
    console.log('\n🏛️  Clubs created:');
    createdClubs.forEach(club => {
      console.log(`   - ${club.name}: ${club.description.substring(0, 50)}...`);
    });
    
    console.log('\n👥 Club heads created:');
    clubHeads.forEach(head => {
      console.log(`   - ${head.name} (Club: ${head.clubName})`);
      console.log(`     Default password: Councilkmit25 (must be changed on first login)`);
    });

    console.log('\n🔗 API Endpoints available:');
    console.log('   - GET /api/clubs - List all clubs');
    console.log('   - GET /api/clubs/:id - Get club details');
    console.log('   - GET /api/clubs/:id/members - Get club members');
    console.log('   - POST /api/clubs/:id/join-request - Submit join request');
    console.log('   - PUT /api/clubs/:id/approve-member - Approve/reject member');

  } catch (error) {
    console.error('❌ Error seeding clubs:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding script
if (require.main === module) {
  seedClubs();
}

module.exports = { seedClubs, clubsData };