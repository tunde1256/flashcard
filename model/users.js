const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'User'], default: 'User' },
    category: { type: String },
    lastLogin: { type: Date }  // Add lastLogin field
});

module.exports = mongoose.model('User', UserSchema);
