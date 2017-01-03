
import {matching} from './matching';
import {servicioBlocking} from './servicioBlocking';



var match = new matching();
var servicio = new servicioBlocking();
var listaMatch =[];

var weights = {
    identity: 0.3, //0.2
    name: 0.3,    //0.3
    gender: 0.1,  //0.4
    birthDate: 0.3 //0.1
};


//servicio.obtenerPacientes({"match":{$gt:0.4}}, "matchMutantesL1E2")
servicio.obtenerPacientes({"match":{$gt:1.96}}, "matchMutantesVeciL1E2")
    .then((resultado) => {
      console.log(resultado);
      var lista;
      lista = resultado[0];
      match.matchPares([[lista.paciente1, lista.paciente2]], listaMatch, weights, 'Levensthein', "matchMutantesVeciL1E2");

    })
