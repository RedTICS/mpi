import * as mongoose from 'mongoose';
import * as lugarSchema from './lugar';

export let ubicacionSchema = new mongoose.Schema({  
    localidad:lugarSchema,
    provincia:lugarSchema,
    pais: lugarSchema
});
