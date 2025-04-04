const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' } 
});

module.exports = mongoose.model('User', userSchema);
