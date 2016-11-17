import * as mongoose from 'mongoose';
import * as ubicacionSchema from './ubicacion';

var mutatedPatientSchema = new mongoose.Schema({
   documento: String,
    activo: Boolean,
    estado: {
        type: String,
        required: true,
        enum: ["temporal", "identificado", "validado", "recienNacido", "extranjero"]
    },
    nombre: String,
    apellido: String,
    alias: String,
    contacto: [{
        tipo: {
            type: String,
            enum: ["Teléfono Fijo", "Teléfono Celular", "Email", ""]
        },
        valor: String,
        ranking: Number, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
        ultimaActualizacion: Date,
        activo: Boolean
    }],
    direccion: [{
        valor: String,
        codigoPostal: String,
        ubicacion: ubicacionSchema,
        ranking: Number,
        geoReferencia: {
            type: [Number], // [<longitude>, <latitude>]
            index: '2d' // create the geospatial index
        },
        ultimaActualizacion: Date,
        activo: Boolean
    }],
    sexo: {
        type: String,
        enum: ["femenino", "masculino", "otro", ""]
    },
    genero: {
        type: String,
        enum: ["femenino", "masculino", "otro", ""]
    }, // identidad autopercibida
    fechaNacimiento: Date, // Fecha Nacimiento
    fechaFallecimiento: Date,
    estadoCivil: {
        type: String,
        enum: ["casado", "separado", "divorciado", "viudo", "soltero", "otro", ""]
    },
    foto: String,
    relaciones: [{
        relacion: {
            type: String,
            enum: ["padre", "madre", "hijo","hermano", "tutor",""]
        },
        referencia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'paciente'
        },
        nombre: String,
        apellido: String,
        documento: String
    }],
    financiador: [{ //obrasocial, plan sumar 
        entidad: {
            id: mongoose.Schema.Types.ObjectId,
            nombre: String
        },
        codigo: String,
        activo: Boolean,
        fechaAlta: Date,
        fechaBaja: Date,
        ranking: Number,
    }],
    claveBlocking: [String],
    entidadesValidadoras: [String],
    targetid:String
});

export let MutatedPatient = mongoose.model('MutatedPatient',mutatedPatientSchema, 'mutatedPatientVecinos');
