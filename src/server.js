const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { mongoUri, port } = require('./config');
const { CURRENT_USER_ID } = require('./constants');
const { ConnectionRequest, Post, User } = require('./models');

const app = express();

app.use(cors());
app.use(express.json({ limit: '16kb' }));

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/users', async (request, response, next) => {
  try {
    const currentUserId = request.query.currentUserId ?? CURRENT_USER_ID;
    if (typeof currentUserId !== 'string' || !mongoose.isValidObjectId(currentUserId)) {
      return response.status(400).json({ error: 'A valid currentUserId query parameter is required.' });
    }

    const [users, requests] = await Promise.all([
      User.find().sort({ _id: 1 }).lean(),
      ConnectionRequest.find({ fromUser: currentUserId }).select('toUser -_id').lean(),
    ]);

    return response.json({
      users,
      requestedUserIds: requests.map(({ toUser }) => toUser.toString()),
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/posts', async (_request, response, next) => {
  try {
    const posts = await Post.find()
      .sort({ timestamp: -1, _id: 1 })
      .populate('author', 'name occupation profileImage')
      .lean();

    return response.json({ posts });
  } catch (error) {
    return next(error);
  }
});

app.post('/connect', async (request, response, next) => {
  try {
    const { fromUserId, toUserId } = request.body || {};
    if (
      typeof fromUserId !== 'string' ||
      typeof toUserId !== 'string' ||
      !mongoose.isValidObjectId(fromUserId) ||
      !mongoose.isValidObjectId(toUserId)
    ) {
      return response.status(400).json({ error: 'Valid fromUserId and toUserId values are required.' });
    }
    if (fromUserId === toUserId) {
      return response.status(400).json({ error: 'A user cannot send a connection request to themselves.' });
    }

    const users = await User.find({ _id: { $in: [fromUserId, toUserId] } }).select('_id').lean();
    if (users.length !== 2) {
      return response.status(404).json({ error: 'The sender or recipient user does not exist.' });
    }

    const existingRequest = await ConnectionRequest.findOne({
      fromUser: fromUserId,
      toUser: toUserId,
    }).lean();
    if (existingRequest) {
      return response.status(200).json({
        connectionRequest: {
          fromUserId,
          toUserId,
          timestamp: existingRequest.timestamp,
        },
        alreadyRequested: true,
      });
    }

    let connectionRequest;
    try {
      connectionRequest = await ConnectionRequest.create({ fromUser: fromUserId, toUser: toUserId });
    } catch (error) {
      if (error && error.code === 11000) {
        return response.status(200).json({
          connectionRequest: { fromUserId, toUserId },
          alreadyRequested: true,
        });
      }
      throw error;
    }

    return response.status(200).json({
      connectionRequest: {
        fromUserId: connectionRequest.fromUser.toString(),
        toUserId: connectionRequest.toUser.toString(),
        timestamp: connectionRequest.timestamp,
      },
      alreadyRequested: false,
    });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error('API request failed:', error);
  response.status(500).json({ error: 'An unexpected server error occurred.' });
});

async function startServer() {
  await mongoose.connect(mongoUri);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Thebrandopedia API listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start API:', error);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
