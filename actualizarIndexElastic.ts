import * as mongodb from 'mongodb';
import * as config from './config';
import { Client } from 'elasticsearch';

var url = config.urlMongoAndes;
let coleccion = "paciente";
let estadoCivil = null;

mongodb.MongoClient.connect(url, function(err, db) {
    if (err) {
        console.log("Error al conectarse a Base de Datos", err);
    }
    console.log("Conectado a la base, actualizando contactos");
    let cursorStream = db.collection(coleccion).find({}).stream();
    cursorStream.on("end", function() {
        console.log("Close Stream");
        db.close();
    });

    cursorStream.on("data", function(elem) {
        let paciente = elem;
        let connElastic = new Client({
            host: 'http://localhost:9200',
        });
        connElastic.create(paciente);

    });
})
