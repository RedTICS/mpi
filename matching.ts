/// <reference path="typings/index.d.ts" />
import * as config from './config';
import * as mongodb from 'mongodb';
import {machingDeterministico} from './machingDeterministico';
import {matchingJaroWinkler} from './matchingJaroWinkler';



export class matching {

    guardarMatch(match, collection) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection(collection).insertOne(match, function(err, item) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(item);
                        db.close();
                    }

                });


            });

        });
    }

    guardarListaMatch(listaMatch, coleccion: string) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                console.log('Total Match', listaMatch.length);
                listaMatch.forEach(match => {
                    db.collection(coleccion).insertOne(match, function(err, item) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(item);
                        }

                    });
                });
                db.close();
            });

        });
    }


    convertirFecha(fecha){
      //console.log(fecha,typeof(fecha));
      if (typeof(fecha) != "string"){
        var fecha1 =  new Date(fecha);
        return((fecha1.toISOString()).substring(0,10));
      }
      else
         return ((fecha.toString()).substring(0,10));
    }


    matchPares(listaPares, listaMatch, weights, algoritmo, collection) {
        /*Se aplica el algoritmo de matcheo por cada par
        Se guarda en la collección listaMatch el par de Paciente y el valor devuelto
        por el algoritmo de match y se persiste la información en collection*/

        var pacienteA;
        var pacienteB;
        var valor: number;
        console.log('Pares',listaPares);
        listaPares.forEach(par => {

            if (par[0]) {
                pacienteA = {
                    identity: par[0].documento,
                    firstname: par[0].nombre,
                    lastname: par[0].apellido,
                    birthDate: this.convertirFecha(par[0].fechaNacimiento),
                    gender: par[0].sexo
                };
            }
            if (par[1]) {
                pacienteB = {
                    identity: par[1].documento,
                    firstname: par[1].nombre,
                    lastname: par[1].apellido,
                    birthDate: this.convertirFecha(par[1].fechaNacimiento),
                    gender: par[1].sexo
                };

            }
            var m;
            if (algoritmo == 'Jaro Winkler') {
                m = new matchingJaroWinkler();
                valor = m.machingJaroWinkler(pacienteA, pacienteB, weights);

            }
            else {
                m = new machingDeterministico();  //'Levenshtein'
                valor = m.maching(pacienteA, pacienteB, weights);

            }

            //Se guardan los pares de pacientes en la collection matching

            // this.guardarMatch({ paciente1: par[0], paciente2: par[1], match: valor },collection)
            //     .then((res => {
            //         console.log('Se guarda matcheo', valor);
            //     }))
            //     .catch((err => {
            //         console.log('Error al guardar matcheo', err);
            //     }));
            listaMatch.push({ paciente1: par[0], paciente2: par[1], match: valor });

        })


    }
}
