import {postPaciente} from './postPaciente';
import {servicioMongo} from './servicioMongo';
import {servicioSintys} from './../api/utils/servicioSintys';
import {simulaValidacion} from './simulaValidacion';

import * as mongodb from 'mongodb';
import * as config from './config';


var servicio = new postPaciente();
var servMongo = new servicioMongo();

let coleccion = "pacienteSips";
let coleccionInsert = "pacienteMPI";

var url = config.urlMigracion;
var condicion = {};
var arrayPromesas = [];
var contAValidar = 0;
var contInvalidos = 0;
var contValidados = 0;
var cant = 0;
var cantPacientesAl100 = 0;
var cantPacientesMatcheadosParcial = 0;
var simulador = new simulaValidacion;

try {
   // console.log('first');
    mongodb.MongoClient.connect(url, function (err, db) {
      

        if (err) {
            console.log('Error al conectarse a Base de Datos', err)
        }

        //Creamos el stream 
        var cursorStream = db.collection(coleccion).find(condicion).limit(500).stream();



        cursorStream.on('data', function (data) {

            if (data != null) {
                let paciente = data;
                var sintysService = new servicioSintys;
                //console.log('cantidad de registros procesados', cant);
                cant = cant + 1;
                if (paciente.documento != null) {

                    if (paciente.documento.length >= 6) {
                          
                        if (paciente.estado != "validado") {
                            // console.log('Pacientes enviados a validar: ', contAValidar );
                            contAValidar = contAValidar + 1;
                            var resultado = simulador.simularSintys(paciente);
                            arrayPromesas.push(resultado);

                            //console.log(arrayPromesas);
                            //arrayPromesas.push(setTimeout(sintysService.matchSintys(paciente),1000));
                        } else {
                            //console.log('Pacientes que ya están validados' ,contValidados);
                            contValidados = contValidados + 1;
                        }

                    } else {
                        //console.log('Pacientes que no tienen un documento válido y no fueron enviados a sintys: ', contInvalidos );
                        contInvalidos = contInvalidos + 1;
                    }
                } else {
                    contInvalidos = contInvalidos + 1;
                }
            }

        })

        cursorStream.on('end', function () {
            console.log('El stream ha terminado y se cierra la conexión a la base de datos');
            console.log('cantidad de pacientes enviados a validar: ', contAValidar);
            console.log('cantidad de pacientes rechazados: ', contInvalidos);
            console.log('cantidad de pacientes validados: ', contValidados);

            Promise.all(arrayPromesas).then(valores => {
                cantPacientesAl100 = 0;
                cantPacientesMatcheadosParcial = 0;
                let listado = valores;

                listado.forEach(elem => {

                        var pacUpdate = elem.pac;

                        if (elem.porcentajeValidacion > 99) {

                            //Actualizo mi BD temporal

                            pacUpdate.estado = "validado";
                            
                            //Inserto en la BD de MPI porque hubo match
                            db.collection(coleccionInsert).insert(pacUpdate, function (err, registros) {
                                if (err) {
                                    console.log('error al insertar el registro en la base de datos: ', err)
                                } else {
                                    //console.log('insertado correctamente')
                                }
                            });

                            //incremento el contador
                            cantPacientesAl100 = cantPacientesAl100 + 1
                        } else {
                            
                            cantPacientesMatcheadosParcial = cantPacientesMatcheadosParcial + 1
                        }

                        //Hago el update del paciente comprobado agregando el % de validación
                        try{
                            
                            db.collection(coleccion).updateOne(
                                {"_id": pacUpdate._id},
                                { $set: { "estado" : pacUpdate.estado, "matchSintys": elem.porcentajeValidacion}}
                                );
                            
                        }catch(e){
                            console.log('Error en update', e);
                        }
                        
                      

                        if (cantPacientesAl100 + cantPacientesMatcheadosParcial == arrayPromesas.length) {
                            console.log('cantidad de pacientes 100% matching: ', cantPacientesAl100);
                            console.log('cantidad de pacientes parcial matching: ', cantPacientesMatcheadosParcial);
                        }

                        

                        // var listaPacientes = valores;

                        // listaPacientes.forEach(parPacientes => {

                        //     if (parPacientes["matchSintys"] > 0) {
                        //         console.log(parPacientes);
                        //     } else {

                        //         // console.log('El paciente no matcheo: ', rta["apellido"], rta["matchSintys"]);
                        //     }
                        // });


                });

                 db.close();

            })
            .catch((reason) => {
                        console.error('Error en la promesa:', reason);
                        // servMongo.guardarLogSips({ "idPaciente": paciente['idPaciente'], "migrado": false, "Error": err.toString(), "Fecha": Date.now() })
                        //     .then((respuesta => {
                        //         console.log('Guardar Log', 'Se guarda el paciente');
                        //     }))
                        //     .catch((err => {
                        //         console.log('Error al guardar log de error', paciente['idPaciente'], err);
                        //     }))


                    })
        });
       
    })
} catch (err) {
    console.log('Error', err)
}