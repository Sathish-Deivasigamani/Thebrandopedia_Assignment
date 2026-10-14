const mongoose = require('mongoose');

const { mongoUri } = require('./config');
const { CURRENT_USER_ID } = require('./constants');
const { ConnectionRequest, Post, User } = require('./models');

const users = [
  {
    _id: CURRENT_USER_ID,
    name: 'Dr. Arjun Mehta',
    occupation: 'Cardiology',
    profileImage: 'Image-3.png',
  },
  {
    _id: '64a000000000000000000002',
    name: 'Dr. Priya Sharma',
    occupation: 'Healthcare Technology',
    profileImage: 'Image-1.png',
  },
  {
    _id: '64a000000000000000000003',
    name: 'Dr. Rohan Kapoor',
    occupation: 'General Medicine',
    profileImage: 'Image-4.png',
  },
  {
    _id: '64a000000000000000000004',
    name: 'Dr. Ananya Rao',
    occupation: 'Pediatrics',
    profileImage: 'Image-2.png',
  },
  {
    _id: '64a000000000000000000005',
    name: 'Docconnect',
    occupation: 'Healthcare Technology',
    profileImage: 'Image-1.png',
  },
];

const posts = [
  {
    _id: '64b000000000000000000001',
    content:
      "Welcome to Docconnect! We're building India's largest healthcare professional network. Connect with doctors, nurses, pharmacists, and medical students across the country. Let's transform healthcare collaboration together. 🇮🇳",
    author: users[4]._id,
    timestamp: new Date('2026-10-14T07:30:00.000Z'),
    image: 'create-post-image-5@2x.png',
  },
  {
    _id: '64b000000000000000000002',
    content:
      'Care is at the heart of every great healthcare team. We make sure that your loved ones get all the support they need and feel at home.',
    author: users[1]._id,
    timestamp: new Date('2026-10-13T12:00:00.000Z'),
    image: 'create-post-image-1@2x.png',
  },
  {
    _id: '64b000000000000000000003',
    content: 'Take a moment to focus on your wellbeing. Small steps toward mental health matter.',
    author: users[2]._id,
    timestamp: new Date('2026-10-12T12:00:00.000Z'),
    image: 'create-post-image-2@2x.png',
  },
  {
    _id: '64b000000000000000000004',
    content: 'Not all heroes wear capes. Thank you to the healthcare professionals who show up every day.',
    author: users[3]._id,
    timestamp: new Date('2026-10-11T12:00:00.000Z'),
    image: 'create-post-image-3@2x.png',
  },
  {
    _id: '64b000000000000000000005',
    content: 'Celebrating the skill, care, and compassion of medical professionals everywhere.',
    author: users[0]._id,
    timestamp: new Date('2026-10-10T12:00:00.000Z'),
    image: 'create-post-image-5@2x.png',
  },
];

async function seed() {
  await mongoose.connect(mongoUri);

  await Promise.all(
    users.map(({ _id, ...user }) =>
      User.updateOne({ _id }, { $set: user }, { upsert: true, runValidators: true }),
    ),
  );
  await Promise.all(
    posts.map(({ _id, ...post }) =>
      Post.updateOne({ _id }, { $set: post }, { upsert: true, runValidators: true }),
    ),
  );
  await ConnectionRequest.init();

  console.log(`Seeded ${users.length} users and ${posts.length} posts.`);
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
