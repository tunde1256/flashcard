const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }, // Added email field
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'user'], default: 'Admin' }, // Enforce allowed values
    createdAt: { type: Date, default: Date.now },
    name: { type: String, required: true }
});

AdminSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Admin', AdminSchema);
