const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    todo: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    creationDate: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('todos', todoSchema);