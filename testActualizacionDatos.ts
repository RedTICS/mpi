import {actualizarDatos} from './actualizarDatos';
import {libString} from './libString';


var actualizarDir = new actualizarDatos();

//Paso2: Se actualizan las ubicaciones
let coleccion = "pacienteSips";
let condicion= {};

  actualizarDir.actualizarUbicaciones(condicion,coleccion);
            //actualizarRelacionesSips();


            // // Paso 3: Se actualizan las relaciones
            // function actualizarRelacionesSips() {
            //     var servicioSql = new servicioMssql();
            //     var usuario = config.user;
            //     var pass = config.password;
            //     var server = config.serverSql;
            //     var db = config.databaseSql;
            //     var consulta = config.consultaRelaciones;
            //     console.log(server, db, usuario, pass);
            //     servicioSql.obtenerDatosSql2(usuario, pass, server, db, consulta)
            //         .then((resultado) => {
            //             if (resultado == null) {
            //                 console.log('No encontrado');
            //             } else {
            //                 let listaRelaciones = resultado;
            //                 let servSips = new servicioSips();
            //                 let lista = servSips.actualizarRelaciones(listaRelaciones);
            //                 servMongo.actualizarDatos("pacienteSips", lista)
            //                     .then((res) => {
            //                         console.log('Datos Actualizados');
            //                     })
            //                     .catch((err) => {
            //                         console.error('Error*:' + err);
            //                     });
            //             }
            //         })
            //         .catch((err) => {
            //             console.error('Error**:' + err);
            //         });
            // }
