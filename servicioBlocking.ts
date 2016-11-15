import { servicioMongo } from './servicioMongo';
import * as config from './config';
import * as mongodb from 'mongodb';
import { libString } from './libString';


/*Se obtienen las claves de blocking
y se buscan los pacientes que pertenecen a un mismo bloque
se arman los pares de pacientes para aplicar el match

*/
export class servicioBlocking {

    obtenerPacientes(condicion) {
        var url = config.urlMigraSips;
        console.log('URL', url, condicion);
        //var url = 'mongodb://localhost:27017/andes';
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("paciente").find(
                    condicion
                ).toArray(function(err, items) {
                    if (err) {
                        console.log('Error obtenerPacientes', err);
                        reject(err);
                    }

                    else {
                        resolve(items);
                        db.close();
                    }
                })


            });
        });

    }

    guardarPaciente(paciente) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("paciente").insertOne(paciente, function(err, item) {
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
        var claves = [];
        var fecha;
        var anioNacimiento = "1900";
        var doc = "";
        if (paciente["fechaNacimiento"]) {
            fecha = paciente["fechaNacimiento"].split("-");
            anioNacimiento = fecha[0].toString();
        }

        if (paciente["documento"]) {
            doc = paciente["documento"].substr(0, 4);
        }

        var clave = libString.obtenerConsonante(paciente.apellido, 3) + libString.obtenerConsonante(paciente.nombre, 2) +
            anioNacimiento + doc;

        claves.push(clave);



        return claves;

    }

    asignarClaveBlocking() {
        /*Se recorren los pacientes en el migrasips para asignarles las claves de blocking*/
        this.obtenerPacientes({})
            .then((res => {
                let lista;
                lista = res;
                if (lista) {
                    lista.forEach(paciente => {
                        //Se asignan las claves de blocking
                        var claves = this.crearClavesBlocking(paciente);
                        paciente.claveBlocking = claves;
                        //Se guarda el paciente
                        this.guardarPaciente(paciente)
                            .then((res => {
                                console.log('Se guarda el paciente con las claves de blocking');
                            }))
                            .catch((err => {
                                console.log('Error al guardar matcheo', err);
                            }));



                    })
                }


            }))
            .catch((err => {
                console.log('Error al generar lista de Pacientes', err);
            }))



    }



    registrosBlocking(condicion) {
        var servMongo = new servicioMongo();
        //Se obtienen los pacientes por una condición de Blocking
        var listaRegistros = [];
        return new Promise((resolve, reject) => {
            servMongo.obtenerPacientes(condicion)
                .then((resultado => {
                    //Se generar los Registros Pares
                    console.log('registrosBlocking', condicion, resultado);
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

                        }
                        else {
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
                console.log('PARES', listaPares);
            })
            if (listaPares)
                resolve(listaPares);
            else {
                reject([]);
            }

        });
    }


}
