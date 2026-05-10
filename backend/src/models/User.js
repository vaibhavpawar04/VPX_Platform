const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
    trim:      true,
  },
  password: {
    type:      String,
    minlength: 6,
  },
  googleId:  { type: String },
  avatar:    { type: String },
  authType: {
    type:    String,
    enum:    ['local', 'google'],
    default: 'local',
  },
  accountType: {
    type:    String,
    enum:    ['basic', 'pro', 'enterprise'],
    default: 'basic',
  },
  kycStatus: {
    type:    String,
    enum:    ['none', 'level1', 'level2', 'level3'],
    default: 'none',
  },
  isActive: {
    type:    Boolean,
    default: true,
  },
  createdAt: {
    type:    Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (!this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
