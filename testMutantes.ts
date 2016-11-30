import {servicioBlocking} from './servicioBlocking';
import {matching} from './matching';


var listaTargetId;
var condicion;
var listaMutantes;
var match = new matching();
var servicio = new servicioBlocking();
var listaMatch = [];
var listaPares = [];
var paciente;
var pares;

/*Experimento 2 : Se Recorre la colección mutantes, y se busca los primeros 50
  Luego se generan los pares entre el mutante y cada paciente en la colección paciente
  Por último  se aplica el matcheo a cada par (paciente, mutante) y se guarda en otra collección
  que es el último parámetro de matchPares*/


servicio.obtenerPacientes({}, "mutatedPatient")
    .then((resultado) => {
        listaMutantes = resultado;
        console.log(listaMutantes.length);

        var index = Math.floor(Math.random() * (500 - 1)) + 1;
        var mutante = listaMutantes[index];
        console.log('Mutante Elegido', mutante)
        servicio.obtenerPacientes({}, "paciente", 10000)
            //Se obtienen la lista de Pares de por target Id
            .then((res) => {
                let listaPacientes;
                listaPacientes = res;
                console.log('Total de Pacientes', listaPacientes.length)
                listaPacientes.forEach(paciente => {
                    //Se listan los pares de pacientes y mutantes
                    //console.log([mutante, paciente]);
                    listaPares.push([mutante, paciente]);
                });
                var weights = {
                    identity: 0.3, //0.2
                    name: 0.3,    //0.3
                    gender: 0.1,  //0.4
                    birthDate: 0.3 //0.1
                };
                //  match.matchPares([mutante,paciente], listaMatch, weights, 'Jaro Winkler',"matchingMutantesL1E2");
                console.log("Total Pares", listaPares.length);
                match.matchPares(listaPares, listaMatch, weights, 'Levensthein', "matchMutantesL1E2");
                console.log("Total Match", listaMatch.length);

                match.guardarListaMatch(listaMatch, "matchMutantesL1E2")
                .then((res) => {
                      console.log('Se guardó la lista de match');
                })
                .catch((err=>{
                     console.log('Error al guardar la lista de Match', err);
                }))

            })
            .catch((err => {
                console.log('Error al generar lista de Pares Original Mutante', err);
            }))

    })

/*
servicio.obtenerPacientes({"targetid" : "4"}, "mutatedPatient")
    .then((resultado) => {
        listaMutantes = resultado;
        console.log(listaMutantes.length);

        //var index = Math.floor(Math.random() * (500 - 1)) + 1;
        //var mutante = listaMutantes[index];
            servicio.obtenerPacientes({}, "paciente", 10000)
            //Se obtienen la lista de Pares de por target Id
            .then((res) => {
                let listaPacientes;
                listaPacientes = res;
                console.log('Total de Pacientes', listaPacientes.length)
                listaPacientes.forEach(paciente => {
                    //Se listan los pares de pacientes y mutantes
                    //console.log([mutante, paciente]);
                    listaPares.push([listaMutantes[0], paciente]);
                    listaPares.push([listaMutantes[1], paciente]);
                    listaPares.push([listaMutantes[2], paciente]);
                    listaPares.push([listaMutantes[3], paciente]);
                    listaPares.push([listaMutantes[4], paciente]);
                    listaPares.push([listaMutantes[5], paciente]);
                    listaPares.push([listaMutantes[6], paciente]);
                    listaPares.push([listaMutantes[7], paciente]);
                    listaPares.push([listaMutantes[8], paciente]);
                    listaPares.push([listaMutantes[9], paciente]);
                });
                var weights = {
                    identity: 0.3, //0.2
                    name: 0.3,    //0.3
                    gender: 0.1,  //0.4
                    birthDate: 0.3 //0.1
                };
                //  match.matchPares([mutante,paciente], listaMatch, weights, 'Jaro Winkler',"matchingMutantesL1E2");
                console.log("Total Pares", listaPares.length);
                match.matchPares(listaPares, listaMatch, weights, 'Levensthein', "matchMutantesL1E2M4");
                console.log("Total Match", listaMatch.length);

                match.guardarListaMatch(listaMatch, "matchMutantesL1E2M4")
                .then((res) => {
                      console.log('Se guardó la lista de match');
                })
                .catch((err=>{
                     console.log('Error al guardar la lista de Match', err);
                }))

            })
            .catch((err => {
                console.log('Error al generar lista de Pares Original Mutante', err);
            }))
    })*/

