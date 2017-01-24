import {postPaciente} from './postPaciente';
import {machingDeterministico} from './machingDeterministico';
import {matching} from './matching';
import * as config from './config';
import * as mongodb from 'mongodb';


var listaPaciente;
var listaMatch = [];
var match = new matching();
var post = new postPaciente();
let coleccion = "pacienteSips";



try {
    var arrayPromise = [];
    var url = config.urlMigracion;
    var condicion = { estado: "validado", "migrado": { $exists: false } };
    mongodb.MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('Error al conectarse a Base de Datos: ', err)
        }
        var cursorStream = db.collection(coleccion).find(condicion).stream();
        // Se ejecuta una vez que devuelve todos los documentos
        cursorStream.on('end', function() {
            console.log('El proceso de actualización ha finalizado');
            db.close();
        });
        cursorStream.on('data', function(data) {
            if (data != null) {

                //Se buscan los documentos con la misma clave de blocking y se realizan los matcheos
                //En caso de encontrar un documento en el bloque que matchea al 100% la función devuelve vacío
                //En caso contrario devuelve un paciente que se debe insertar
                buscarBloque(data, "paciente")
                    .then((paciente) => {
                        if (paciente) {
                            //Devuelve un paciente válido que debe insertarse
                            console.log('Paciente', paciente);
                            //Se guarda el paciente a través de la API
                            post.cargarUnPacienteAndes(paciente)
                                .then((rta) => {
                                    console.log('Paciente Guardado', rta);
                                    //Se actualiza el paciente
                                })
                                .catch((err) => {
                                    console.error('Error Post**:', err);
                                })
                            //Se actualiza el paciente como migrado
                            db.collection(coleccion).updateOne(data, {
                                $set: {
                                     "migrado": true
                                }
                            }, function (err, item) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log('Paciente actualizado');
                                }
                            });

                        }

                    })
                    .catch((err) => {
                        console.log('Error al obtener el bloque de pacientes', err)
                    })
            }
        })

    })

}
catch (err) {
    console.log(err);

}


function buscarBloque(paciente, coleccion) {
    //bloquePacientes son los pacientes con la misma clave de blocking se buscan en el repositorio MPI
    let url = config.urlMongoAndes;
    var weights = {
        identity: 0.3,
        name: 0.3,
        gender: 0.1,
        birthDate: 0.3
    };
    return new Promise((resolve, reject) => {
        var condicion = { "claveBlocking.0": paciente.claveBlocking[0] };
        var bloque = [];
        mongodb.MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log("Error de conexión con ", err);
                reject(err)
            }
            else {
                var stream = db.collection(coleccion).find(condicion).stream();
                let matchPorcentaje = 0;
                // Execute find on all the documents
                stream.on('end', function() {

                    //Se inserta el paciente validado en el repositorio
                    db.collection(coleccion).insertOne(paciente, function(err, item) {
                        if (err) {
                            console.log('Error al guardar Pacientes');
                            db.close();
                            reject(err);
                        }
                        else {
                            resolve(item);
                            db.close();
                        }
                    });

                });
                stream.on('data', function(data) {
                    if (data != null) {
                        let pacienteBloque = data;
                        matchPorcentaje = match.matchPersonas(paciente, pacienteBloque, weights, 'Levenshtein');
                        if (matchPorcentaje == 1) {
                            db.close();
                            resolve({})  //Caso en que se encontró un paciente en el bloque que matcheo al 100% y no necesita insertarse
                        }
                    }
                });
            }
        })
    })
}
