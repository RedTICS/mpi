import {servicioBlocking} from './servicioBlocking';
import {machingDeterministico} from './machingDeterministico';
import {matching} from './matching';
import * as config from './config';
import * as mongodb from 'mongodb';

var servicio = new servicioBlocking();

var listaPaciente;
var listaMatch = [];
var match = new matching();
let coleccion = "pacienteSips";


try {
    var arrayPromise = [];
    var url = config.urlMigracion;
    var condicion = { estado: "validado" };
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
                //En caso de encontrar un documento en el bloque que matchea al 100% el documento no se inserta
                //En caso contrario se inserta siempre
                buscarBloque(data, "paciente")
                    .then((paciente) => {
                        if (paciente) {
                            console.log('Paciente', paciente);
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
                            resolve({})  //Caso en que se econtró un paciente en el bloque que matcheo al 100% y no necesita insertarse
                        }
                    }
                });
            }
        })
    })
}
