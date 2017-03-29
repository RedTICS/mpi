
import * as config from './config';
import * as mongodb from 'mongodb';
import {matching} from '@andes/match/matching';
import {
    postPaciente
} from './postPaciente';
let post = new postPaciente();

let limite = 50;
var listaPacientes;

let weights = {
    identity: 0.3, //0.2
    name: 0.3,    //0.3
    gender: 0.1,  //0.4
    birthDate: 0.3 //0.1
};

var match = new matching();

console.log('Se realiza la validación de Pacientes');

let url = config.urlMongoAndes;
let coleccion = "paciente";
let matchPorcentaje = 0;
let pacienteSisa = {};
console.log('Se ingresa a validarPacienteEnSisa');
let condicion = { $or: [{ "entidadesValidadoras": { $size: 0 } }, { "estado": "temporal" }] };

mongodb.MongoClient.connect(url, function(err, db) {
    if (err) {
        console.log('Error al conectarse a Base de Datos: ', err);
    }
    var cursorStream = db.collection(coleccion).find(condicion).stream().limit(limite);
    console.log('Conectado a url', url);

    cursorStream.on('data', function(paciente) {
        if (paciente != null) {
            cursorStream.pause();

            // Se realiza una pausa para realizar la consulta a Sisa
            setTimeout(function() {
                post.obtenerPacienteSisa(paciente).then(res => {
                    if (res) {
                        listaPacientes = res;
                    }
                    if (listaPacientes.length > 0) {
                        listaPacientes = JSON.parse(listaPacientes);
                        console.log(listaPacientes);
                        pacienteSisa = listaPacientes[0];
                        pacienteSisa.fechaNacimiento = new Date(pacienteSisa.fechaNacimiento);
                        console.log(pacienteSisa);
                        matchPorcentaje = match.matchPersonas(paciente, pacienteSisa, weights, 'Levenshtein');
                        if (matchPorcentaje >= 0.99) {
                            console.log("Match", matchPorcentaje);
                            db.collection(coleccion).updateOne(paciente, {
                                $addToSet: { "entidadesValidadoras": "Sisa" },
                                $set: {
                                    estado: "validado"
                                }
                            }, function(err, item) {
                                if (err) {
                                    console.log("Error al actualizar Paciente", err);
                                }
                            });
                        } else {
                            db.collection(coleccion).updateOne(paciente, {
                                $set: {
                                    "entidadesValidadoras": ["Sisa | " + matchPorcentaje.toString()]
                                }
                            }, function(err, item) {
                                if (err) {
                                    console.log("Error al actualizar Paciente", err);
                                }
                            });
                        }

                    }

                })
                cursorStream.resume();
            }, 20);

        }
    })

    cursorStream.on('end', function() {
        console.log("El proceso de actualización ha finalizado");
        //db.close();
    });
});
