"use strict";
const mongoose = require('mongoose');
exports.lugarSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    nombre: String
});
//# sourceMappingURL=lugar.js.map