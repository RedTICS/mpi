"use strict";
const mongoose = require('mongoose');
const lugarSchema = require('./lugar');
exports.ubicacionSchema = new mongoose.Schema({
    localidad: lugarSchema,
    provincia: lugarSchema,
    pais: lugarSchema
});
//# sourceMappingURL=ubicacion.js.map