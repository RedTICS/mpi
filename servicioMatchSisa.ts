import * as config from './config';
import * as mongodb from 'mongodb';
import {servicioSisa} from '../api/utils/servicioSisa';
import {machingDeterministico} from './machingDeterministico';
import {matching} from './matching';

import {
    servicioBlocking
} from './servicioBlocking';

var servicio = new servicioBlocking();
var servSisa = new servicioSisa();
var match = new matching();


export class servicioMatchSisa {

    asignarMatchSisa() {
        /*Se recorren los pacientes en migracioa para asignarles el matcheo con Sisa*/
        var arrayPromise = [];
        var url = config.urlMigracion;
        var cant = 0;
        var matchPorcentaje;
        var pacienteSisa;
        var coleccion = "pacienteSips";


        return new Promise((resolve, reject) => {
            servicio.obtenerPacientes({ "estado": "temporal", "matchSisa": { $exists: false } }, coleccion, 200)
                .then((res => {
                    let lista = res;
                    if (lista) {
                        lista.forEach(paciente => {
                            arrayPromise.push(this.matchSisa(paciente));
                        })
                    }
                    Promise.all(arrayPromise).then(values => {
                        var listaPacientes = values;
                        console.log('Total Pacientes a Actualizar', listaPacientes.length);
                        mongodb.MongoClient.connect(url, function(err, db) {
                            if (listaPacientes) {
                                listaPacientes.forEach(p => {
                                    console.log(p[0], p[1]);
                                    let match = p[1];
                                    let pacienteSisa = p[2];
                                    if (pacienteSisa) {
                                        console.log(pacienteSisa);
                                    }
                                    if (match >= 0.99) {
                                        console.log('Dir', "Match", match);
                                        db.collection(coleccion).updateOne(p[0], {
                                            $addToSet: { "entidadesValidadoras": "Sisa" },
                                            $set: {
                                                estado: "validado"
                                            }
                                        }, function(err, item) {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                db.close();
                                                resolve(item);
                                            }

                                        });
                                    }
                                    else {
                                        db.collection(coleccion).updateOne(p[0], {
                                            $set: {
                                                matchSisa: match
                                            }
                                        }, function(err, item) {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                resolve(item);
                                                db.close();
                                            }
                                        });
                                    }



                                })
                            }

                        });

                    })


                }))
                .catch((err => {
                    console.log('Error al obtener los pacientes', err);
                    reject(err);
                }))
        })
    }


    matchSisa(paciente) {
        //Verifica si el paciente tiene un documento valido y realiza la búsqueda a través de Sisa
        var matchPorcentaje = 0;
        var pacienteSisa = {};
        var weights = {
            identity: 0.3, //0.2
            name: 0.3,    //0.3
            gender: 0.1,  //0.4
            birthDate: 0.3 //0.1
        };

        //Se buscan los datos en sisa y se obtiene el paciente
        return new Promise((resolve, reject) => {

            if (paciente.documento) {
                if (paciente.documento.length >= 7) {

                    servSisa.getSisaCiudadano(paciente.documento, config.usuarioSisa, config.passwordSisa)
                        .then((resultado) => {
                            if (resultado) {
                                //Verifico el resultado devuelto por el rest de Sisa
                                if (resultado[0] == 200) {

                                    switch (resultado[1].Ciudadano.resultado) {
                                        case 'OK':
                                            if (resultado[1].Ciudadano.identificadoRenaper && resultado[1].Ciudadano.identificadoRenaper != "NULL") {

                                                pacienteSisa = servSisa.formatearDatosSisa(resultado[1].Ciudadano);
                                                matchPorcentaje = match.matchPersonas(paciente, pacienteSisa, weights, 'Levenshtein');
                                                resolve([{
                                                    _id: paciente._id
                                                }, matchPorcentaje, pacienteSisa]);
                                            }
                                            else {
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

                }
                else {
                    resolve([{
                        _id: paciente._id
                    }, matchPorcentaje, {}]);
                }
            }
            else {
                resolve([{
                    _id: paciente._id
                }, matchPorcentaje, {}]);
            }


        })

    }


}
