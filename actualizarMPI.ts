import {
    postPaciente
} from './postPaciente';
import {
    matching
} from '@andes/match/matching';
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
    // Traigo todos los pacientes que pasaron por la fuente auténtica SISA tanto validados como temporales
    // La idea es insertarlos en andes y luego con un proceso posterior los validados subirlos a MPI con un proceso que sólo suba los validados
    // y deje en esta base los temporales
    var condicion = {
        $or: [{
            "migrado": {
                $exists: false
            }
        }, {
            "migrado": false
        }]
        //"estado":"validado",
        // , migrado: false
    }; //"migrado": { $exists: false }

    // Nos conectamos a la base cruda migrada de los efectores
    mongodb.MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log("Error al conectarse a Base de Datos: ", err);
        }


        var cursorStream = db.collection(coleccion).find(condicion).stream();
        // Se ejecuta una vez que devuelve todos los documentos

        cursorStream.on('data', function (data) {

            if (data != null) {

                //Se buscan los documentos con la misma clave de blocking y se realizan los matcheos
                //En caso de encontrar un documento en el bloque que matchea al 100% la función devuelve vacío
                //En caso contrario devuelve un paciente que se debe insertar

                // let listaContactos = [];
                // if (data.contacto) {
                //     data.contacto.forEach((cto) => {
                //         if ((cto.tipo == "Teléfono Fijo") || (cto.tipo == "")) {
                //             cto.tipo = "fijo";
                //         }
                //         if (cto.tipo == "Teléfono Celular") {
                //             cto.tipo = "celular";
                //         }
                //         cto.tipo = cto.tipo.toLowerCase();
                //         listaContactos.push(cto);
                //     })
                // }
                if (!(data.estadoCivil)) {
                        delete data.estadoCivil;
                }

                //console.log('Lista de contacto: ',listaContactos);
                //data.contacto = listaContactos;

                cursorStream.pause();

                // Restart the stream after 1 miliscecond
                 setTimeout(function () {
                //     buscarBloque(data, "paciente")
                //         .then((res) => {
                //             let paciente = res;
                //             if (!(paciente == {})) {
                //                 //console.log('paciente en array', pacientesInsert.length);
                //                 if (paciente.matchSisa && (paciente.estado == "temporal")) {
                //                   paciente.entidadesValidadoras =  ["Sisa |" + paciente.matchSisa.toString()];
                //                 }
                                let paciente = data;
                                post.cargarUnPacienteAndes(paciente)
                                    .then((rta) => {
                                        db.collection(coleccion).updateOne({
                                            "_id": paciente._id
                                        }, {
                                            $set: {
                                                "migrado": true
                                            }
                                        }, function (err, item) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log('Paciente actualizado: ');
                                            }
                                        });
                                    })

                                    .catch((err) => {
                                        console.error('Error Post**:', paciente);
                                    })
                        //     }
                        // })
                        // .catch((err) => {
                        //     console.log('dio error el buscar bloque');
                        //     console.log('Error al obtener el bloque de pacientes', err)
                        // })
                    cursorStream.resume();
                }, 20);


            }
        })

        cursorStream.on('end', function () {
            console.log('El proceso de actualización ha finalizado');
            // processArray(pacientesInsert, this.insertarPaciente)
            //     .then(function (result) {
            //         console.log(result);
            //     }, function (reason) {
            //         console.log(reason);
            //     })

            db.close();
        });


    })

} catch (err) {
    console.log(err);

}


function buscarBloque(paciente, coleccionPaciente) {
    //bloquePacientes son los pacientes con la misma clave de blocking se buscan en el repositorio MPI
    let url = config.urlMongoAndes;
    var weights = {
        identity: 0.3,
        name: 0.3,
        gender: 0.1,
        birthDate: 0.3
    };
    return new Promise((resolve, reject) => {
        var condicion = {
            "claveBlocking.0": paciente.claveBlocking[0]
        };
        var bloque = [];
        mongodb.MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log("Error de conexión con ", err);
                reject(err)
            } else {
                var stream = db.collection(coleccionPaciente).find(condicion).stream();
                let matchPorcentaje = 0;
                // Execute find on all the documents
                stream.on('end', function () {
                    //Se inserta el paciente validado en el repositorio
                    db.close();
                    resolve(paciente);
                });
                stream.on('data', function (data) {
                    if (data != null) {
                        let pacienteBloque = data;
                        matchPorcentaje = match.matchPersonas(paciente, pacienteBloque, weights, 'Levenshtein');
                        if (matchPorcentaje == 1) {
                            db.close();
                            resolve({}) //Caso en que se encontró un paciente en el bloque que matcheo al 100% y no necesita insertarse
                        }
                    }
                    //console.log('Buscar Bloque', data);
                });
            }
        })
    })
}

function processArray(array, fn) {
    return array.reduce(function (p, item) {
        return p.then(fn);
    }, Promise.resolve());
}

function insertarPaciente(paciente) {
    return new Promise(function (resolve, reject) {
        function delayResolve(data) {
            setTimeout(function () {
                // Se realiza el post de paciente y en el resolve devuelve el paciente
                // Se guarda el paciente a través de la API
                //console.log('hace insert!!!')
                post.cargarUnPacienteAndes(paciente)
                    .then((rta) => {
                        console.log('Paciente Guardado');
                        // Se actualiza el paciente
                        // Se actualiza el paciente como migrado
                        mongodb.MongoClient.connect(url, function (err, db) {
                            if (err) {
                                console.log('Error al conectarse a Base de Datos: ', err)
                                reject(err);
                            }
                            db.collection(coleccion).updateOne(paciente, {
                                $set: {
                                    "migrado": true
                                }
                            }, function (err, item) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    db.close();
                                    resolve(paciente);
                                    console.log('Paciente actualizado');
                                }
                            });
                        })

                    })
                    .catch((err) => {
                        console.error('Error Post**:', err);
                    })
            }, 200);
        }
        delayResolve(paciente);
    })
}
