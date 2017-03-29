import * as config from './config';
import * as http from 'http';



export class postPaciente {

    cargarUnPacienteAndes(paciente: any) {

        return new Promise((resolve, reject) => {

            var options = {
                host: 'localhost',
                port: 3002,
                path: '/api/core/mpi/pacientes',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            var jsonData = '';
            var req = http.request(options, function(res) {
                console.log("statusCode: ", res.statusCode, 'y el mensaje es', res.statusMessage);
                res.on('data', function(body) {
                    resolve(body);
                });
            });
            req.on('error', function(e) {
                console.log('Problemas API : ' + e.message + " ----- ", e);
                reject(e.message);
            });
            // write data to request body
            req.write(JSON.stringify(paciente));
            req.end();
        })

    }

    actualizarPaciente(paciente: any) {

        return new Promise((resolve, reject) => {

            var options = {
                host: 'localhost',
                //host:'10.1.62.17',
                port: 3002,
                path: '/api/core/mpi/pacientes/' + paciente._id,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            var jsonData = '';
            var req = http.request(options, function(res) {
                console.log("statusCode: ", res.statusCode, 'y el mensaje es', res.statusMessage);
                res.on('data', function(body) {
                    resolve(body);
                });
            });
            req.on('error', function(e) {
                console.log('Problemas API : ' + e.message + " ----- ", e);
                reject(e.message);
            });
            // write data to request body
            req.write(JSON.stringify(paciente));
            req.end();
        })

    }


    obtenerPacienteSisa(paciente: any) {

        var lista = '';
        var options = {
            host: 'localhost',
            port: 3002,
            path: '/api/core/mpi/auditoria/matching/' + paciente._id,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        };
        return new Promise((resolve, reject) => {
            var req = http.request(options, function(res) {
                res.on('data', function(d) {
                    //console.info('GET de Sisa ' + nroDocumento + ':\n');
                    if (d.toString())
                        lista = lista + d.toString();
                });

                res.on('end', function() {
                    let listaPacientes = [];
                    if (lista) {
                        resolve(lista)
                    } else {
                      resolve([]);
                    }

                });

            });
            req.write(JSON.stringify({ "op": "validarSisa" }));
            req.end();

        })

    }

}



// if (paciente.fechaNacimiento) {
            //     var fecha = paciente.fechaNacimiento.split("-");
            //     paciente.fechaNacimiento = fecha[2].substr(0, 2) + "/" + fecha[1].toString() + "/" + fecha[0].toString();
            // }


    // cargarPacienteAndes() {
    //   var servMongo = new servicioMongo();
    //     servMongo.getPacientes().then((pacientes) => {
    //         var listaPacientes;
    //         listaPacientes = pacientes;
    //         // console.log("pacientes", listaPacientes);
    //         var options = {
    //             host: 'localhost',
    //             port: 3002,
    //             path: '/api/paciente',
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             }
    //
    //         };
    //         var jsonData = '';
    //         listaPacientes.forEach(pac => {
    //             var req = http.request(options, function(res) {
    //                 console.log("statusCode: ", res.statusCode);
    //                 res.on('data', function(body) {
    //                     console.log('Body: ' + body);
    //                 });
    //             });
    //             req.on('error', function(e) {
    //                 console.log('problem with request: ' + e.message + " ----- ");
    //             });
    //             // write data to request body
    //             req.write(JSON.stringify(pac));
    //             req.end();
    //
    //         });
    //     })
    //         .catch((err) => {
    //             console.log('Error**:' + err)
    //         });
    // }
