import {
    paciente
} from './../schemas/patient';
import * as config from '../config';
import * as mongodb from 'mongodb';
import {
    servicioSisa
} from '../../api/utils/servicioSisa';
import {
    matching
} from '@andes/match/matching';
import {
    servicioBlocking
} from '../servicioBlocking';
import {
    PacienteMpi
} from './pacienteMpi';

let servicio = new servicioBlocking();
let servSisa = new servicioSisa();
let match = new matching();

// servicioMatchSisa era el nombre de la clase
export function validarPacienteEnSisa(token) {
    let url = config.urlMongoMpi;
    let urlSisaRejected = config.urlMongoSisaRejected;
    let coleccion = "paciente";
    let coleccionRejected = "sisaRejected";
    // Esta condición es para obtener todos los pacientes que no tengan la entidadValidadora "Sisa" o bien el campo no exista.
    let condicion = {
        "entidadesValidadoras": {
            $nin: ["Sisa"]
        }
    }
    return new Promise((resolve, reject) => {
        mongodb.MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Error al conectarse a Base de Datos: ', err);
                reject(err);
            } else {
                let cursorStream = db.collection(coleccion).find(condicion).stream();
                cursorStream.on('end', function () {
                    console.log("El proceso de actualización ha finalizado");
                    db.close();
                    resolve();
                });
                cursorStream.on('data', function (data) {
                    if (data != null) {
                        // Se realiza una pausa para realizar la consulta a Sisa
                        cursorStream.pause();
                        let paciente: any = data;
                        servSisa.matchSisa(paciente).then(res => {
                            if (res) {
                                let operationsMpi = new PacienteMpi();
                                let match = res["matcheos"].matcheo // Valor del matcheo de sisa
                                let pacienteSisa = res["paciente"]; //paciente con los datos de Sisa
                                if (match >= 95) {
                                    //Si el matcheo es mayor a 95% tengo que actualizar los datos en MPI
                                    paciente.nombre = pacienteSisa.nombre;
                                    paciente.apellido = pacienteSisa.apellido;
                                } else {
                                    // insertar en una collection sisaRejected para análisis posterior
                                    mongodb.MongoClient.connect(url, function (err, db) {
                                        //Verificamos que el paciente no exista en la collection de rejected!
                                        db.collection(coleccionRejected).findOne(paciente._id, function (err, patientRejected) {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                console.log('el pacienet rejectado: ', patientRejected);
                                                if (!patientRejected) {
                                                    db.collection(coleccionRejected).insert(paciente);
                                                }
                                            }
                                            db.close();
                                        });
                                    })
                                }
                                //Siempre marco que paso por sisa
                                paciente.entidadesValidadoras.push('Sisa');
                                //Hacemos el update en el repositorio MPI
                                operationsMpi.actualizaUnPacienteMpi(paciente, token)
                                    .then((rta) => {
                                        console.log('El paciente de MPI ha sido corregido por SISA: ', paciente);
                                    });
                            }
                        })
                        resolve();
                        cursorStream.resume(); //Reanudamos el proceso
                    }
                })
            }

        });
    })

}
// Función de algoritmo de matcheo para servicio de sisa
function matchSisa(paciente) {
    //Verifica si el paciente tiene un documento valido y realiza la búsqueda a través de Sisa
    var matchPorcentaje = 0;
    var pacienteSisa = {};
    var weights = config.pesos;

    //Se buscan los datos en sisa y se obtiene el paciente
    return new Promise((resolve, reject) => {

        if (paciente.documento) {
            if (paciente.documento.length >= 6) {
                servSisa.getSisaCiudadano(paciente.documento, config.usuarioSisa, config.passwordSisa)
                    .then((resultado) => {
                        if (resultado) {
                            //Verifico el resultado devuelto por el rest de Sisa
                            if (resultado[0] == 200) {
                                switch (resultado[1].Ciudadano.resultado) {
                                    case 'OK':
                                        if (resultado[1].Ciudadano.identificadoRenaper && resultado[1].Ciudadano.identificadoRenaper != "NULL") {
                                            pacienteSisa = servSisa.formatearDatosSisa(resultado[1].Ciudadano);
                                            matchPorcentaje = match.matchPersonas(paciente, pacienteSisa, weights, config.tipoAlgoritmoMatcheo);
                                            resolve([{
                                                _id: paciente._id
                                            }, matchPorcentaje, pacienteSisa]);
                                        } else {
                                            resolve([{
                                                _id: paciente._id
                                            }, 0, {}]);
                                        }
                                        break;
                                    case 'MULTIPLE_RESULTADO':
                                        var sexo = "F";
                                        if (paciente.sexo == "femenino") {
                                            sexo = "F";
                                        }
                                        if (paciente.sexo == "masculino") {
                                            sexo = "M";
                                        }
                                        servSisa.getSisaCiudadano(paciente.documento, config.usuarioSisa, config.passwordSisa, sexo)
                                            .then((res) => {
                                                if (res[1].Ciudadano.resultado == 'OK') {
                                                    pacienteSisa = servSisa.formatearDatosSisa(res[1].Ciudadano);
                                                    matchPorcentaje = match.matchPersonas(paciente, pacienteSisa, weights, 'Levenshtein');
                                                    resolve([{
                                                        _id: paciente._id
                                                    }, matchPorcentaje, pacienteSisa]);
                                                }

                                            })
                                            .catch((err) => {
                                                reject(err);
                                            })

                                    default:
                                        resolve([{
                                            _id: paciente._id
                                        }, 0]);
                                        break;
                                }
                            }
                        }
                        resolve([{
                            _id: paciente._id
                        }, 0, {}]);
                    })
                    .catch((err) => {
                        console.error('Error consulta rest Sisa:' + err)
                        reject(err);
                    });
                // setInterval(consultaSisa,100);
            } else {
                resolve([{
                    _id: paciente._id
                }, matchPorcentaje, {}]);
            }
        } else {
            resolve([{
                _id: paciente._id
            }, matchPorcentaje, {}]);
        }
    })
}