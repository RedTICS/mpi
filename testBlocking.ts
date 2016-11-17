import {servicioBlocking} from './servicioBlocking';
//import { servicioMongo } from './servicioMongo';
import {machingDeterministico} from './machingDeterministico';
import {matching} from './matching';


var servicio = new servicioBlocking();
//var servMongo = new servicioMongo();
var listaTargetId;
var condicion;
var listaPares;
var listaMatch = [];
var match = new matching();


for (let i = 50; i < 51; i++) {
    console.log('Target ID', i)
    condicion = { "targetid": i.toString() };
    servicio.registrosBlocking(condicion, "mutatedPatient")
        //Se obtienen la lista de Pares de por target Id
        .then((res) => {
            listaPares = res;
            console.log('Lista de Pares para realizar el matching', listaPares.length);
            //Se realiza el matcheo por cada grupo de pares
            var weights = {
                identity: 0.2,
                name: 0.3,
                gender: 0.4,
                birthDate: 0.1
            };
            match.matchPares(listaPares, listaMatch, weights,'Levenshtein');
        })
        .catch((err => {
            console.log('Error al generar lista de Pares', err);
        }))

}
