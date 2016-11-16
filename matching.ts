/// <reference path="typings/index.d.ts" />
import * as config from './config';
import * as mongodb from 'mongodb';
import {machingDeterministico} from './machingDeterministico';



export class matching {

    guardarMatch(match) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("matchingMutantes").insertOne(match, function(err, item) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(item);
                    }
                    db.close();
                });


            });

        });
    }


    matchPares(listaPares, listaMatch) {
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
            console.log(par);
            if (par[0]) {
                pacienteA = {
                    identity: par[0].documento,
                    firstname: par[0].nombre,
                    lastname: par[0].apellido,
                    birthDate: par[0].fechaNacimiento.toString(),
                    gender: par[0].sexo
                };
            }
            if (par[1]) {
                pacienteB = {
                    identity: par[1].documento,
                    firstname: par[1].nombre,
                    lastname: par[1].apellido,
                    birthDate: par[1].fechaNacimiento.toString(),
                    gender: par[1].sexo
                };

            }
            var m = new machingDeterministico();
            valor = m.maching(pacienteA, pacienteB, weights);
            //Se guardan los pares de pacientes en la collection matching
            this.guardarMatch({ paciente1: par[0], paciente2: par[1], match: valor })
                .then((res => {
                    console.log('Se guarda matcheo', valor);
                }))
                .catch((err => {
                    console.log('Error al guardar matcheo', err);
                }));
            listaMatch.push({ paciente1: par[0], paciente2: par[1], match: valor });

        })


    }
}
