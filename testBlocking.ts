import {
    servicioBlocking
} from './servicioBlocking';
import {
    matching
} from 'andes-match/matching';

import * as mongodb from 'mongodb';

var servicio = new servicioBlocking();
// var listaTargetId;
// var condicion;
// var listaPaciente;
// var listaMatch = [];
// var match = new matching();


// for (let i = 50; i < 51; i++) {
//     console.log('Target ID', i)
//     condicion = { "targetid": i.toString() };
//     servicio.registrosBlocking(condicion, "mutatedPatient")
//         //Se obtienen la lista de Pares de por target Id
//         .then((res) => {
//             listaPares = res;
//             console.log('Lista de Pares para realizar el matching', listaPares.length);
//             //Se realiza el matcheo por cada grupo de pares
//             var weights = {
//                 identity: 0.2,
//                 name: 0.3,
//                 gender: 0.4,
//                 birthDate: 0.1
//             };
//             match.matchPares(listaPares, listaMatch, weights,'Levenshtein');
//         })
//         .catch((err => {
//             console.log('Error al generar lista de Pares', err);
//         }))
//
// }

// servicio.asignarClaveBlocking()
//     .then((res => {
//         let lista;
//         lista = res;
//         if (lista) {
//             console.log('Total Actualizado: ', lista.length)
//             console.log('FIN')
//         }

//     }))
//     .catch((err => {
//         console.log('Error al generar lista de Pacientes', err);
//     }))

// servicio.obtenerPacientes({"clusterId": { "$gte": 0, "$lte": 2000 }},'paciente')
// .then(res => {
//     var listaPac;
//     listaPac = res;
//     var url = 'mongodb://localhost:27017/migracion';
//     //console.log(listaPac)
//     mongodb.MongoClient.connect(url, function (err, db) {
//     listaPac.forEach(pac => {
//         pac.claveBlocking[5] = pac.clusterId.toString();
//             db.collection("paciente").save(pac, function (err, item) {
//                 if (err) {
//                     console.log('Error');
//                 } else {
//                     console.log(item)
//                 }
//             });
//
//         });
//       db.close();
//     })
// })

servicio.asignarClaveBlocking("pacienteSips")
    .then((res => {
        let lista;
        lista = res;
        if (lista) {
            console.log('FIN')
        }

    }))
    .catch((err => {
        console.log('Error al generar lista de Pacientes', err);
    }))


// var targetBlocking = "SRKRN";
//
// var coleccion = "paciente";
// var coleccionBlocking = "clavesAgrupadasPacientes";
// var ventanaBlocking = 5;
//
//
//
//     servicio.getPacientBlockingWindow(targetBlocking,coleccion,coleccionBlocking,ventanaBlocking)
//         .then((pacientes =>{
//
//             console.log(pacientes);
//
//         }))













// servicio.getClavesBlockingVecinas(targetBlocking,ventanaBlocking,coleccionBlocking)
//     .then((clavesBlocking=>{
//             //Hago la conversión a array con el map
//             var arrayClavesBlocking = Object.keys(clavesBlocking).map(function (key) { return clavesBlocking[key]; });

//             arrayClavesBlocking.forEach(elem => {

//             var claveBlocking = elem._id;
//                 servicio.getPacientesPorClaveBlocking(claveBlocking, coleccion)
//                 .then((res => {
//                     console.log(res);
//                     //Insert en la BD
//                     }))
//                 .catch((err => {
//                     console.log('Error al obtener la lista de pacienes por clave de blocking', err);
//                     }))
//         })
//     }))
