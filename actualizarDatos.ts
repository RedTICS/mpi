import { servicioMongo } from '../extraccionDatos/servicioMongo';
import {libString} from './libString';
import * as mongodb from 'mongodb';
import * as config from './config';
import {machingDeterministico} from './machingDeterministico';


export class actualizarDatos {


    actualizarUbicaciones(condicion, coleccion) {
        var servMongo = new servicioMongo();
        var arrayPromise = [];
        var paciente;
        var url = config.urlMigracion;
        var PromPais = servMongo.obtenerPaises();
        var PromProvincia = servMongo.obtenerProvincias();
        var PromLocalidad = servMongo.obtenerLocalidades();
        var m1 = new machingDeterministico();

        Promise.all([PromPais, PromProvincia, PromLocalidad]).then(values => {
            let paises;
            paises = values[0]; //[{id:1, nombre:"Argentina" },{id:2, nombre:"Chile"},{id:3, nombre:"Brasil"}];
            let provincias;
            provincias = values[1];
            let localidades;
            localidades = values[2];

            //Se abre la conexión a mongo para realizar las actualizaciones de los registros
            mongodb.MongoClient.connect(url, function(err, db) {
                if (err) {
                    console.log('Error al conectarse a Base de Datos', err);
                }
                var cursorStream = db.collection(coleccion).find(condicion).stream();
                cursorStream.on('end', function() {
                    console.log('Close Stream');
                    db.close();
                });
                // Execute find on all the documents
                cursorStream.on('close', function() {
                    console.log('Close Stream');
                    db.close();
                });
                cursorStream.on('data', function(elem) {
                    paciente = elem;
                    let actualizar = false;
                    //Se actualizan las ubicaciones de las direcciones de los pacientes
                    let direcciones = paciente.direccion;
                    let dirActualizadas = [];
                    let paisBuscar;
                    if (direcciones) {
                        direcciones.forEach(dir => {
                            //Se actualiza el pais
                            if (!(dir.ubicacion.pais._id)) {
                                if ((typeof dir.ubicacion.pais) == 'string') {
                                    paisBuscar = dir.ubicacion.pais;
                                }
                                else {
                                    if (dir.ubicacion.pais.nombre) {
                                        paisBuscar = dir.ubicacion.pais.nombre;
                                    }
                                }
                                if (paisBuscar) {
                                    let pais = paises.find((p) => { return (m1.levenshtein(p.nombre, paisBuscar) >= 0.8) });
                                    if (pais) {
                                        dir.ubicacion.pais = { _id: pais._id, nombre: pais.nombre };
                                        actualizar = true;
                                    }
                                    else {
                                        dir.ubicacion.pais = { nombre: paisBuscar };
                                        actualizar = true;
                                    }
                                }
                                else {
                                    dir.ubicacion.pais = {};
                                    actualizar = true;
                                }
                            }
                            //Se actualiza la provincia
                            if (!(dir.ubicacion.provincia._id)) {
                                let provinciaBuscar;
                                if ((typeof dir.ubicacion.provincia) == 'string') {
                                    provinciaBuscar = dir.ubicacion.provincia;
                                }
                                else {
                                    if (dir.ubicacion.provincia.nombre) {
                                        provinciaBuscar = dir.ubicacion.provincia.nombre;
                                    }
                                }
                                if (provinciaBuscar) {
                                    let provincia = provincias.find((p) => { return (m1.levenshtein(p.nombre, provinciaBuscar) >= 0.8) });
                                    if (provincia) {
                                        dir.ubicacion.provincia = { _id: provincia._id, nombre: provincia.nombre };
                                        actualizar = true;
                                    }
                                    else {
                                        dir.ubicacion.provincia = { nombre: provinciaBuscar };
                                        actualizar = true;
                                    }

                                }
                                else {
                                    dir.ubicacion.provincia = {};
                                    actualizar = true;
                                }

                            }

                            //Se actualiza la localidad
                            if (!(dir.ubicacion.localidad._id)) {
                                let localidadBuscar;
                                if ((typeof dir.ubicacion.localidad) == 'string') {
                                    localidadBuscar = dir.ubicacion.localidad;
                                }
                                else {
                                    if (dir.ubicacion.localidad.nombre) {
                                        localidadBuscar = dir.ubicacion.localidad.nombre;
                                    }
                                }

                                if (localidadBuscar) {
                                    let localidad = localidades.find((p) => { return (m1.levenshtein(p.nombre, localidadBuscar) >= 0.8) });
                                    if (localidad) {
                                        dir.ubicacion.localidad = { _id: localidad._id, nombre: localidad.nombre };
                                        actualizar = true;
                                    }
                                    else {
                                        dir.ubicacion.localidad = { nombre: paisBuscar };
                                        actualizar = true;
                                    }
                                }
                                else {
                                    dir.ubicacion.localidad = {};
                                    actualizar = true;
                                }

                            }
                            dirActualizadas.push(dir);
                        })

                        if (actualizar) {
                            paciente.direccion = dirActualizadas;
                            //Se actualiza el paciente
                            db.collection(coleccion).findOneAndUpdate(
                                { "_id": paciente._id },
                                { $set: { "direccion": dirActualizadas } }, function(err, result) {
                                    if (err) {
                                        console.log('Error', err)
                                    }
                                    else {
                                        console.log('Actualizado');
                                    }
                                }
                            )
                        }

                    }



                })   //Fin ForEach
            })

        })


    }






}
