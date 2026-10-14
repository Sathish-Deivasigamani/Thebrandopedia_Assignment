const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const { ConnectionRequest, Post, User } = require('../src/models');

process.env.MONGODB_URI ||= 'mongodb://127.0.0.1:27017/thebrandopedia-test';

const { app } = require('../src/server');

let server;
let apiUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  apiUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('health endpoint reports the API as available', async () => {
  const response = await fetch(`${apiUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('users endpoint rejects an invalid current user ID', async () => {
  const invalidIdResponse = await fetch(`${apiUrl}/users?currentUserId=not-an-id`);

  assert.equal(invalidIdResponse.status, 400);
});

test('connect endpoint rejects invalid IDs and self requests', async () => {
  const invalidResponse = await fetch(`${apiUrl}/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromUserId: 'bad', toUserId: 'also-bad' }),
  });
  const selfRequestResponse = await fetch(`${apiUrl}/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromUserId: '64a000000000000000000001',
      toUserId: '64a000000000000000000001',
    }),
  });

  assert.equal(invalidResponse.status, 400);
  assert.equal(selfRequestResponse.status, 400);
});

test('users and posts include persisted request state and populated authors', async () => {
  const originalUserFind = User.find;
  const originalRequestFind = ConnectionRequest.find;
  const originalPostFind = Post.find;
  try {
    User.find = () => ({
      sort: () => ({
        lean: async () => [
          {
            _id: '64a000000000000000000001',
            name: 'Dr. Arjun Mehta',
            occupation: 'Cardiology',
            profileImage: 'Image-3.png',
          },
        ],
      }),
    });
    ConnectionRequest.find = () => ({
      select: () => ({
        lean: async () => [{ toUser: { toString: () => '64a000000000000000000002' } }],
      }),
    });

    const usersResponse = await fetch(`${apiUrl}/users`);
    assert.equal(usersResponse.status, 200);
    assert.deepEqual(await usersResponse.json(), {
      users: [
        {
          _id: '64a000000000000000000001',
          name: 'Dr. Arjun Mehta',
          occupation: 'Cardiology',
          profileImage: 'Image-3.png',
        },
      ],
      requestedUserIds: ['64a000000000000000000002'],
    });

    Post.find = () => ({
      sort() {
        return this;
      },
      populate() {
        return this;
      },
      lean: async () => [
        {
          _id: '64b000000000000000000001',
          content: 'Test post',
          timestamp: '2026-10-14T07:30:00.000Z',
          author: { name: 'Docconnect', occupation: 'Healthcare Technology' },
        },
      ],
    });

    const postsResponse = await fetch(`${apiUrl}/posts`);
    const postsBody = await postsResponse.json();
    assert.equal(postsResponse.status, 200);
    assert.equal(postsBody.posts[0].content, 'Test post');
    assert.equal(postsBody.posts[0].author.name, 'Docconnect');
  } finally {
    User.find = originalUserFind;
    ConnectionRequest.find = originalRequestFind;
    Post.find = originalPostFind;
  }
});

test('connect endpoint creates a request once and reports repeats', async () => {
  const originalUserFind = User.find;
  const originalRequestFindOne = ConnectionRequest.findOne;
  const originalRequestCreate = ConnectionRequest.create;
  const fromUserId = '64a000000000000000000001';
  const toUserId = '64a000000000000000000002';
  let requestCreated = false;

  try {
    User.find = () => ({
      select: () => ({
        lean: async () => [{ _id: fromUserId }, { _id: toUserId }],
      }),
    });
    ConnectionRequest.findOne = () => ({
      lean: async () =>
        requestCreated ? { timestamp: '2026-10-14T07:30:00.000Z' } : null,
    });
    ConnectionRequest.create = async ({ fromUser, toUser }) => {
      requestCreated = true;
      return { fromUser, toUser, timestamp: '2026-10-14T07:30:00.000Z' };
    };

    const postRequest = () =>
      fetch(`${apiUrl}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId, toUserId }),
      });

    const firstResponse = await postRequest();
    const firstBody = await firstResponse.json();
    const repeatedResponse = await postRequest();
    const repeatedBody = await repeatedResponse.json();

    assert.equal(firstResponse.status, 200);
    assert.equal(firstBody.alreadyRequested, false);
    assert.equal(repeatedResponse.status, 200);
    assert.equal(repeatedBody.alreadyRequested, true);
  } finally {
    User.find = originalUserFind;
    ConnectionRequest.findOne = originalRequestFindOne;
    ConnectionRequest.create = originalRequestCreate;
  }
});
