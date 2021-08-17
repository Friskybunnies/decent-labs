const mongoose = require('mongoose');

const DataSchema = mongoose.Schema({
    content: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Data', DataSchema);