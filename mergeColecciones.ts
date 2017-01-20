import {servicioBlocking} from './servicioBlocking';
import {machingDeterministico} from './machingDeterministico';
import {matching} from './matching';
import * as config from './config';
import * as mongodb from 'mongodb';

var servicio = new servicioBlocking();
var condicion;
var listaPaciente;
var listaMatch = [];
var match = new matching();
let coleccion = "pacienteSips";
var coleccionAnexar = "pacienteHeller";
var url = config.urlMigracion;

try {
    var arrayPromise = [];
    mongodb.MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('Error al conectarse a Base de Datos', err)
        }
        var cursorStream = db.collection(coleccionAnexar).find(condicion).stream();
        // Execute find on all the documents
        cursorStream.on('close', function() {
            console.log('Close Stream');
            db.close();
        });
        cursorStream.on('data', function(data) {
            if (data != null) {
                let condicion = { "claveBlocking.0": data.claveBlocking[0] };
                console.log(data.idPacienteHeller, condicion);
                var promise = new Promise((resolve, reject) => {
                    try {
                        let bloque = [];
                        db.collection(coleccion).find(condicion).toArray(function(err, items) {
                            if (err) {
                                console.log('Error obtenerPacientes', err);
                                reject(err);
                            } else {
                                console.log('Obtener Pacientes', data.idPacienteHeller);
                                resolve([data, items]);
                            }
                        })
                    }
                    catch (err) {
                        reject(err);
                    }
                });

                promise.then(res => {
                    console.log('Total Bloque', res[1].length);
                    matcheoBloque(res[0], res[1], coleccion)
                        .then((pacientes) => {
                            let pacienteFusionar = pacientes[0];
                            let pacienteOriginal = pacientes[1];
                            if (pacientes[1] == {}) {
                                //Se guarda el nuevo paciente
                                db.collection(coleccion).insertOne(pacientes[0], function(err, item) {
                                    if (err) {
                                        console.log('Error al guardar Pacientes');
                                    }
                                    else {
                                        console.log('Paciente guardado');
                                    }
                                });
                            }
                            else {
                                //Se fusionan los pacientes
                                console.log(pacienteFusionar, pacienteOriginal);
                                let idPacFusionar = new mongodb.ObjectID(pacienteFusionar._id);
                                console.log('Fusionar',idPacFusionar);
                                var query = { "_id": idPacFusionar };
                                db.collection(coleccionAnexar).findOne(query, function(err, data) {
                                    if (err) {
                                        console.log('Error busqueda', err)
                                    }
                                    else {
                                        let pacAux;
                                        console.log('DATA ',data);
                                        pacAux = data;
                                        let arrayIds = pacAux.identificadores;
                                        let idPacOriginal= new mongodb.ObjectID(pacienteOriginal._id);
                                        db.collection(coleccion).update({ "_id": idPacOriginal }, { $addToSet: { "identificadores": { $each: arrayIds } } }, { upsert: true },
                                            function(err) {
                                                if (err) {
                                                    console.log('Error update', err);
                                                }
                                            });
                                    }

                                });
                            }

                        })
                        .catch((err) => {
                            console.log('Error al obtener el match del bloque', err);
                        })

                })
                    .catch(err => {
                        console.log('Error en la promesa', err)
                    })
            }
            else {
                console.log('Fin cursor');
                db.close();
            }

        })

    })

}
catch (err) {
    console.log(err);

}

function buscarBloque(paciente, coleccion) {
    //bloquePacientes son los pacientes con la misma clave de blocking de paciente
    return new Promise((resolve, reject) => {
        var condicion = { "claveBlocking.0": paciente.claveBlocking[0] };
        var bloque = [];
        mongodb.MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log("Error de conexión con ", err);
                reject(err)
            }
            else {
                //var cursorBloque = db.collection(coleccion).find(condicion);
                var stream = db.collection(coleccion).find(condicion).stream();
                // Execute find on all the documents
                stream.on('close', function() {
                    db.close();
                    resolve(bloque);
                });
                stream.on('data', function(data) {
                    if (data != null) {
                        bloque.push(data);
                    }
                    else {
                        console.log('Fin Data')
                        resolve(bloque);
                    }
                });
            }
        })
    })
}


function matcheoBloque(paciente, bloquePacientes, coleccion) {
    return new Promise((resolve, reject) => {
        try {
            var weights = {
                identity: 0.3,
                name: 0.3,
                gender: 0.1,
                birthDate: 0.3
            };
            let i = 0;
            let matchPorcentaje = 0;
            while ((i < bloquePacientes.length) && (matchPorcentaje < 0.9)) {
                matchPorcentaje = match.matchPersonas(paciente, bloquePacientes[i], weights, 'Levenshtein');
                i = i + 1;
            }
            if (matchPorcentaje > 0.85) {
                //Se fusionan los paciente
                //pac con bloquePacientes[0] y se actualiza bloquePacientes[0]
                //console.log('Paciente A Fusionar', paciente, 'Original', bloquePacientes[i - 1]);
                resolve([paciente, bloquePacientes[i - 1]])
            }
            else {
                console.log('Paciente Nuevo a guardar', paciente);
                //arrayPromise.push(servicio.guardarPaciente(pac,coleccion))
                resolve([paciente, {}])
            }
        }
        catch (err) {
            reject(err);
        }

    })
}
