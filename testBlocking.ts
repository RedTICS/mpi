import {servicioBlocking} from './servicioBlocking';
import { servicioMongo } from './servicioMongo';
import {machingDeterministico} from './machingDeterministico';


var servicio = new servicioBlocking();
var servMongo = new servicioMongo();
var listaClaves;
var condicion = "";
var listaPares;
var listaMatch = [];

servMongo.obtenerClaveSN()
    .then((resultado) => {
        if (resultado == null) {
            console.log('No se encontraron claves SN');
        }
        else {
            listaClaves = resultado;
            listaClaves.forEach(clave => {
                if (clave.count > 1) {
                    condicion = clave._id;
                    servicio.registrosBlocking(condicion)
                        //Se obtienen la lista de Pares de por clave de Blocking
                        .then((res) => {
                            listaPares = res;
                            console.log('Lista de Pares para realizar el matching', listaPares.length);
                            //Se realiza el matcheo por cada grupo de pares
                            matchPares(listaPares, listaMatch);
                        })
                        .catch((err => {
                            console.log('Error al generar lista de Pares', err);
                        }))
                }

            })
        }
    })
    .catch((err => {
        console.log('Error al generar lista de Pacientes', err);
    }))


function matchPares(listaPares, listaMatch) {
    /*Se aplica el algoritmo de matcheo por cada par
    Se guarda en la collección matching el par de Paciente y el valor devuelto
    por el algoritmo de match*/

    var weights = {
        identity: 0.2,
        name: 0.3,
        gender: 0.4,
        birthDate: 0.1
    };
    var pacienteA;
    var pacienteB;
    var valor: number;
    listaPares.forEach(par => {
        if (par[0]) {
            pacienteA = {
                identity: par[0].documento,
                firstname: par[0].nombre,
                lastname: par[0].apellido,
                birthDate: par[0].fechaNacimiento,
                gender: par[0].sexo
            };
        }
        if (par[1]) {
            pacienteB = {
                identity: par[1].documento,
                firstname: par[1].nombre,
                lastname: par[1].apellido,
                birthDate: par[1].fechaNacimiento,
                gender: par[1].sexo
            };

        }
        var m = new machingDeterministico();
        valor = m.maching(pacienteA, pacienteB, weights);
        //Se guardan los pares de pacientes en la collection matching
        servMongo.guardarMatch({ paciente1: par[0], paciente2: par[1], match: valor })
            .then((res => {
                console.log('Se guarda matcheo', valor);
            }))
            .catch((err => {
                console.log('Error al guardar matcheo', err);
            }));
        listaMatch.push({ paciente1: par[0], paciente2: par[1], match: valor })

    })


}
