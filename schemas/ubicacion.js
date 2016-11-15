var mongoose = require('mongoose');
var lugarSchema = require('./lugar');
exports.ubicacionSchema = new mongoose.Schema({
    localidad: lugarSchema,
    provincia: lugarSchema,
    pais: lugarSchema
});
