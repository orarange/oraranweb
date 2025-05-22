const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserDataSchema = new Schema({
    email: String,
    username: String,
});

module.exports = mongoose.model('UserData', UserDataSchema);