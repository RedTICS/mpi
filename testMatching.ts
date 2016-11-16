import {servicioBlocking} from './servicioBlocking';
import {matching} from './matching';


var listaTargetId;
var condicion;

var listaMatch = [];
var match = new matching();
var servicio = new servicioBlocking();
var paciente;
var pares;


for (var i = 1; i < 50; i++) {
    servicio.obtenerPacientes({ "idPaciente": i }, "paciente")
        .then((resultado) => {
            paciente = resultado[0];
            console.log(paciente, i);
            generarPares(paciente, i)
                .then((resultado) => {
                  pares = resultado;
                  console.log('Pares Encontrados',pares.length);
                  //match.matchPares(pares, listaMatch);

                })
                .catch((err => {
                    console.log('Error al generar lista de Pares', err);
                }))


        })
}


function generarPares(paciente, targetId) {
    return new Promise((resolve, reject) => {
        var listaPares = [];
        console.log('Target ID', targetId)
        var condicion = { "targetid": targetId.toString() };
        servicio.obtenerPacientes(condicion, "mutatedPatient")
            //Se obtienen la lista de Pares de por target Id
            .then((res) => {
                let listaMutantes;
                listaMutantes = res;
                console.log('Total de mutantes', listaMutantes.length)
                listaMutantes.forEach(mutante => {
                    console.log("Par de mutantes",paciente.idPaciente,mutante.targetid);
                    listaPares.push([paciente, mutante]);
                    //Se realiza el matcheo por cada grupo de pares

                });
                console.log('Lista de Pares para realizar el matching', listaPares.length);
                if (listaPares && (listaPares.length = 10)) {
                    //match.matchPares(listaPares, listaMatch);
                    console.log('Target ID', targetId)
                    resolve(listaPares);
                }

            })
            .catch((err => {
                console.log('Error al generar lista de Pares Original Mutante', err);
                reject(err);
            }))


    });

}
