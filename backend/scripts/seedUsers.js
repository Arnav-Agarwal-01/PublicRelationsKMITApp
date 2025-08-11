/**
 * Seed Users Script
 * 
 * Creates initial users with the default password "PR123$"
 * - Students with roll numbers
 * - Club heads with club names
 * - PR council members
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Club = require('../models/Club');

const INITIAL_PASSWORD = 'PR123$';

// Sample users to create
const sampleUsers = [
  // Students
  {
    name: 'John Doe',
    rollNumber: '21A91A0501',
    role: 'student',
    password: INITIAL_PASSWORD,
    isPasswordChanged: false
  },
  {
    name: 'Jane Smith',
    rollNumber: '21A91A0502',
    role: 'student',
    password: INITIAL_PASSWORD,
    isPasswordChanged: false
  },
  {
    name: 'Mike Johnson',
    rollNumber: '21A91A0503',
    role: 'student',
    password: INITIAL_PASSWORD,
    isPasswordChanged: false
  },
  {
    name: 'Sarah Wilson',
    rollNumber: '21A91A0504',
    role: 'student',
    password: INITIAL_PASSWORD,
    isPasswordChanged: false
  },
  {
    name: 'David Brown',
    rollNumber: '21A91A0505',
    role: 'student',
    password: INITIAL_PASSWORD,
    isPasswordChanged: false
  },

  // Club Heads
  {
    name: 'SAIL Club Head',
    clubName: 'SAIL',
    role: 'club_head',
    password: INITIAL_PASSWORD,
    isPasswordChanged: false
  },
  {
    name: 'VAAN Club Head',
    clubName: 'VAAN',
    role: 'club_head',
    password: INITIAL_PASSWORD,
    isPasswordChanged: false
  },
  {
    name: 'LIFE Club Head',
    clubName: 'LIFE',
    role: 'club_head',
    password: INITIAL_PASSWORD,
    isPasswordChanged: false
  },
  {
    name: 'KRYPT Club Head',
    clubName: 'KRYPT',
    role: 'club_head',
    password: INITIAL_PASSWORD,
    isPasswordChanged: false
  },

  // PR Council
  {
    name: 'PR Council Member',
    clubName: 'PR COUNCIL',
    role: 'pr_council',
    password: INITIAL_PASSWORD,
    isPasswordChanged: false
  }
];

// Sample clubs to create (will be created after users)
const sampleClubs = [
  {
    name: 'SAIL',
    description: 'Software and AI Learning Club - Focused on programming, AI, and software development',
    category: 'technical',
    brandColor: '#00ff88',
    establishedYear: 2020,
    isActive: true
  },
  {
    name: 'VAAN',
    description: 'Aerospace and Aviation Club - Dedicated to aerospace engineering and aviation',
    category: 'technical',
    brandColor: '#0088ff',
    establishedYear: 2019,
    isActive: true
  },
  {
    name: 'LIFE',
    description: 'Literary and Cultural Club - Promoting literature, arts, and cultural activities',
    category: 'cultural',
    brandColor: '#ff8800',
    establishedYear: 2018,
    isActive: true
  },
  {
    name: 'KRYPT',
    description: 'Cybersecurity and Cryptography Club - Focused on security and cryptographic research',
    category: 'technical',
    brandColor: '#ff0088',
    establishedYear: 2021,
    isActive: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing users and clubs...');
    await User.deleteMany({});
    await Club.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users first
    console.log('👥 Creating users...');
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create clubs with their respective club heads
    console.log('🏢 Creating clubs...');
    const createdClubs = [];
    
    for (const clubData of sampleClubs) {
      // Find the club head for this club
      const clubHead = createdUsers.find(user => 
        user.role === 'club_head' && user.clubName === clubData.name
      );
      
      if (clubHead) {
        const club = await Club.create({
          ...clubData,
          clubHead: clubHead._id
        });
        createdClubs.push(club);
        console.log(`✅ Created ${clubData.name} club with head ${clubHead.name}`);
      } else {
        console.log(`⚠️  No club head found for ${clubData.name}`);
      }
    }

    // Display created users for reference
    console.log('\n📋 Created Users:');
    console.log('================');
    
    console.log('\n👨‍🎓 STUDENTS (Login with Roll Number + PR123$):');
    createdUsers.filter(u => u.role === 'student').forEach(user => {
      console.log(`  • ${user.name} - Roll: ${user.rollNumber}`);
    });

    console.log('\n👨‍💼 CLUB HEADS (Login with Club Name + PR123$):');
    createdUsers.filter(u => u.role === 'club_head').forEach(user => {
      console.log(`  • ${user.name} - Club: ${user.clubName}`);
    });

    console.log('\n🏛️ PR COUNCIL (Login with "PR COUNCIL" + PR123$):');
    createdUsers.filter(u => u.role === 'pr_council').forEach(user => {
      console.log(`  • ${user.name} - Club: ${user.clubName}`);
    });

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login Instructions:');
    console.log('  Students: Use roll number (e.g., "21A91A0501") + password "PR123$"');
    console.log('  Club Heads: Use club name (e.g., "SAIL") + password "PR123$"');
    console.log('  PR Council: Use "PR COUNCIL" + password "PR123$"');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleUsers, sampleClubs, INITIAL_PASSWORD };