var mongoose = require('mongoose');
exports.lugarSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    nombre: String
});
