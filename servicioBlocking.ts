import * as config from './config';
import * as mongodb from 'mongodb';
import {
    libString
} from './libString';
import {
    metaphoneES
} from './metaphoneES';
import {
    soundexES
} from './soundexES';


/*Se obtienen las claves de blocking
y se buscan los pacientes que pertenecen a un mismo bloque
se arman los pares de pacientes para aplicar el match

*/
export class servicioBlocking {

    obtenerPacientes(condicion, coleccion, limite ? : number) {
        var url = config.urlMigraSips;
        console.log('URL', url, condicion);
        //var url = 'mongodb://localhost:27017/andes';
        return new Promise((resolve, reject) => {

            if (limite) {
                mongodb.MongoClient.connect(url, function (err, db) {
                    db.collection(coleccion).find(
                        condicion
                    ).limit(limite).toArray(function (err, items) {
                        if (err) {
                            console.log('Error obtenerPacientes', err);
                            reject(err);
                        } else {
                            resolve(items);
                            db.close();
                        }
                    })


                });



            } else {
                mongodb.MongoClient.connect(url, function (err, db) {
                    db.collection(coleccion).find(
                        condicion
                    ).toArray(function (err, items) {
                        if (err) {
                            console.log('Error obtenerPacientes', err);
                            reject(err);
                        } else {
                            resolve(items);
                            db.close();
                        }
                    })


                });


            }

        });

    }

    guardarPaciente(paciente) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function (err, db) {
                db.collection("paciente").insertOne(paciente, function (err, item) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(item);
                        db.close();
                    }

                });


            });

        });
    }

    updatePaciente(paciente, clave) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function (err, db) {
                db.collection("paciente").updateOne({
                    _id: paciente._id
                }, {
                    $set: {
                        clavesBlocking: clave
                    }
                }, function (err, item) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(item);
                        db.close();
                    }

                });


            });

        });
    }

    /*Se crean las claves de blocking claveBlocking: [String],*/
    crearClavesBlocking(paciente) {
        console.log(paciente.fechaNacimiento);
        var claves = [];
        var fecha;
        // var anioNacimiento = "1900";
        // var doc = "";
        // if (paciente["fechaNacimiento"]) {
        //     fecha = paciente["fechaNacimiento"].split("-");
        //     //fecha= paciente["fechaNacimiento"].toISOString().split("-");
        //     anioNacimiento = fecha[0].toString();
        // }
        //
        // if (paciente["documento"]) {
        //     doc = paciente["documento"].substr(0, 4);
        // }
        //
        // var clave = libString.obtenerConsonante(paciente.apellido, 3) + libString.obtenerConsonante(paciente.nombre, 2) +
        //     anioNacimiento + doc;
        //
        // claves.push(clave);

        // Se utiliza el algoritmo metaphone para generar otra clave de Blocking
        // claves.push(paciente.clavesBlocking[0]);
        // claves.push(paciente.clavesBlocking[1]);
        // claves.push(paciente.clavesBlocking[2]);
        var algMetaphone = new metaphoneES();
        var claveApellido = algMetaphone.metaphone(paciente["apellido"]);
        var claveNombre = algMetaphone.metaphone(paciente["nombre"]);
        claves.push(claveApellido.slice(0, 4) + claveNombre.slice(0, 3));
        claves.push(claveApellido);
        claves.push(claveNombre);
        //Se utiliza el algoritmo soundex para generar una nueva clave de Blocking
        var algSoundex = new soundexES();
        claves.push(algSoundex.soundex(paciente["apellido"] + paciente["nombre"]));
        claves.push(algSoundex.soundex(paciente["apellido"]));
        return claves;

    }

    asignarClaveBlocking() {
        /*Se recorren los pacientes en el migrasips para asignarles las claves de blocking*/
        var listaPacientes = [];
        var url = config.urlMigraSips;
        var cant = 0;
        return new Promise((resolve, reject) => {
            this.obtenerPacientes({}, "paciente") //paciente por mutatedPatient
                .then((res => {
                    let lista;
                    lista = res;
                    if (lista) {
                        lista.forEach(paciente => {
                            //for (var i = 0; i < 10000; i++)
                            //Se asignan las claves de blocking
                            //var paciente = lista[i];
                            var claves = this.crearClavesBlocking(paciente);
                            console.log("Claves", claves);
                            //paciente["claveBlocking"] = claves;
                            //Se guarda el paciente
                            // this.updatePaciente(paciente, claves)
                            //     .then((res => {
                            //         console.log('Se guarda el paciente con las claves de blocking');
                            //     }))
                            //     .catch((err => {
                            //         console.log('Error al guardar matcheo', err);
                            //     }));
                            listaPacientes.push([{
                                _id: paciente._id
                            }, claves]);

                        })
                    }
                    if (lista.length == listaPacientes.length) {
                        console.log('Total Pacientes a Actualizar', listaPacientes.length);
                        mongodb.MongoClient.connect(url, function (err, db) {
                            if (listaPacientes) {
                                listaPacientes.forEach(p => {
                                    console.log(p[0], p[1]); //paciente por mutatedPatient
                                    db.collection("paciente").updateOne(p[0], {
                                        $set: {
                                            claveBlocking: p[1]
                                        }
                                    }, function (err, item) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            cant = cant + 1;
                                            if (cant == 500) {
                                                db.close();
                                                resolve(listaPacientes);

                                            }

                                        }

                                    });


                                })
                            }



                        });



                    }


                }))
                .catch((err => {
                    console.log('Error al generar lista de Pacientes', err);
                    reject(err);
                }))

        })

    }



    registrosBlocking(condicion, coleccion) {
        //var servMongo = new servicioMongo();
        //Se obtienen los pacientes por una condición de Blocking
        var listaRegistros = [];
        return new Promise((resolve, reject) => {
            this.obtenerPacientes(condicion, coleccion)
                .then((resultado => {
                    //Se generar los Registros Pares
                    //console.log('registrosBlocking', condicion, resultado);
                    if (resultado) {
                        var lista;
                        lista = resultado;
                        var listaVecinos = lista;
                        if (lista.length > 2) {
                            lista.forEach(paciente => {
                                //Realiza un If para evaluar el grado de coincidencia de la clave de Blocking
                                listaVecinos = listaVecinos.slice(1, listaVecinos.length);
                                if (listaVecinos) {
                                    //Se generar los registros Pares con el listado de Vecinos
                                    listaVecinos.forEach(registro => {
                                        //Realiza un If para evaluar el grado de coincidencia de la clave de Blocking
                                        listaRegistros.push([paciente, registro]);
                                    })
                                }
                            })

                        } else {
                            listaRegistros = [lista];
                        }
                        resolve(listaRegistros);

                    }

                }))
                .catch((err => {
                    console.log('Error al generar lista de Pacientes', err);
                    reject(err);
                }))
        });
        //return listaRegistros;
    }


    generarRegistrosPares(paciente, listaPacientes, listaPares) {
        //En cada grupo se recorre el listado de Pacientes y se generan los registros pares
        //en los que se va a aplicar el algoritmo de Match
        return new Promise((resolve, reject) => {
            listaPacientes.forEach(registro => {
                //Realiza un If para evaluar el grado de coincidencia de la clave de Blocking
                listaPares.push([paciente, registro]);
            })
            if (listaPares)
                resolve(listaPares);
            else {
                reject([]);
            }

        });
    }

    /*
    claveBlocking : Un string que es clave de servicioBlocking.
    coleccion: La colección de mongodb en la que queremos buscar.
    condicion: La query en mongo para filtrar por la clave de servicioBlocking.
    */
    getPacientesPorClaveBlocking(claveBlocking, coleccion) {
            var url = config.urlMigraSips;

            return new Promise((resolve, reject) => {

                mongodb.MongoClient.connect(url, function (err, db) {
                    db.collection(coleccion).find({
                        "claveBlocking": claveBlocking
                    }).toArray(function (err, items) {
                        if (err) {
                            console.log('Error obtenerPacientes', err);
                            reject(err);
                        } else {
                            resolve(items);
                            db.close();
                        }
                    })

                });

            });

        } //Fin getPacientesPorClaveBlocking


    getClavesBlockingVecinas(claveBlocking, cantVecinos, coleccion) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function (err, db) {

                db.collection(coleccion).find({}, {
                        _id: 1
                    }).sort({
                        _id: 1
                    })
                    .toArray(function (err, items) {
                        if (err) {
                            console.log('Error obteniendo claves de blocking vecinas', err);
                            reject(err);
                        } else {
                            //Luego de obtener el array de claves de blocking en memoria y ordenarlos busco los vecinos

                            var indiceBlocking = items.findIndex(function (item) {
                                return item._id == claveBlocking
                            });

                            var cantidadElem = items.length - 1;
                            var posVecinosIzq = indiceBlocking - cantVecinos;
                            var posVecinosDer = indiceBlocking + cantVecinos;

                            if (posVecinosIzq < 0) { //Si se va de rango asigno como max. todos los vecinos a izquierda y el resto lo paso para el vecino de la derecha

                                posVecinosIzq = 0;
                                posVecinosDer = posVecinosDer + (cantVecinos - indiceBlocking);

                                if (posVecinosDer > cantidadElem) {
                                    //Si me paso de la cantidad de vecinos a derecha, tomo todos los posibles a derecha
                                    posVecinosDer = cantidadElem - indiceBlocking
                                }

                            }

                            if (posVecinosDer > cantidadElem) {

                                posVecinosDer = cantidadElem + 1;

                                posVecinosIzq = posVecinosIzq + (cantidadElem - indiceBlocking - cantVecinos) + 1;


                                if (posVecinosIzq < 0) {

                                    //Si me paso de la cantidad de vecinos a izquierda, tomo los posibles de la izquierda
                                    posVecinosIzq = cantVecinos - indiceBlocking
                                }
                            }

                            // console.log ("La clave de blocking a rodear: ", claveBlocking);                            
                            // console.log ("indice del blocking: " ,indiceBlocking);
                            // console.log("posicion a izquierda: ", posVecinosIzq);
                            // console.log("posicion a derecha: ", posVecinosDer);

                            var vecinos = items.slice(posVecinosIzq, posVecinosDer);

                            // console.log("tamaño del array vecinos: ", vecinos.length);
                            // console.log("El array: ", vecinos);
                            resolve(vecinos);

                            db.close();
                        }
                    })
            })
        })

    }


    getPacientBlockingWindow(targetBlocking, coleccion, coleccionBlocking, ventanaBlocking) {
            let pac = [];
            return new Promise((resolve, reject) => {

                    this.getClavesBlockingVecinas(targetBlocking, ventanaBlocking, coleccionBlocking)
                        .then((clavesBlocking => {
                            //Hago la conversión a array con el map 
                            var arrayClavesBlocking = Object.keys(clavesBlocking).map(function (key) {
                                return clavesBlocking[key];
                            });
                            var arrayPromise = [];
                            arrayClavesBlocking.forEach(elem => {
                                var claveBlocking = elem._id;
                                //let pac2 = this.getPacientesPorClaveBlocking (claveBlocking,coleccion);
                                arrayPromise.push(this.getPacientesPorClaveBlocking(claveBlocking, coleccion));                                   
                            })

                             Promise.all(arrayPromise).then((res => {
                                        let pac2
                                        pac2 = res;
                                        pac2 = Object.keys(res).map(function (key) {
                                            return res[key]
                                        });
                                        pac = pac.concat(pac2);
                                        resolve(pac);
                                    }))
                                    .catch((err => {
                                        console.log('Error al obtener la lista de pacienes por clave de blocking', err);
                                        reject(err);
                                    }))
                             
                            //console.log('y por aca');
                           
                            //return pac
                        }))
                })
            }



            //

            // this.getClavesBlockingVecinas(targetBlocking, ventanaBlocking, coleccionBlocking)
            // .then((clavesBlocking => {
            //     //Hago la conversión a array con el map 
            //     var arrayClavesBlocking = Object.keys(clavesBlocking).map(function (key) {
            //         return clavesBlocking[key];
            //     });

            //     arrayClavesBlocking.forEach(elem => {

            //         var claveBlocking = elem._id;
            //         this.getPacientesPorClaveBlocking(claveBlocking, coleccion)
            //             .then((res => {
            //                 pac = Object.keys(res).map(function (key) {
            //                     return res[key]
            //                 });


            //             }))
            //             .catch((err => {
            //                 console.log('Error al obtener la lista de pacienes por clave de blocking', err);
            //             }))
            //     })

            //     return pac
            // }))
}