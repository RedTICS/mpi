import * as mongoose from 'mongoose';

export let lugarSchema = new mongoose.Schema({  
    id: mongoose.Schema.Types.ObjectId,
    nombre: String
});