const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    occupation: { type: String, required: true, trim: true },
    profileImage: { type: String, required: true, trim: true },
  },
  { timestamps: false },
);

const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, required: true },
    image: { type: String, required: true, trim: true },
  },
  { timestamps: false },
);

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } },
);

connectionRequestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

module.exports = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
  Post: mongoose.models.Post || mongoose.model('Post', postSchema),
  ConnectionRequest:
    mongoose.models.ConnectionRequest ||
    mongoose.model('ConnectionRequest', connectionRequestSchema),
};
