import * as mongodb from 'mongodb';
import * as config from './config';


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
        let contactosActualizar = [];
        let listaContactos = [];
        if (paciente.contacto) {
          paciente.contacto.forEach((cto) => {
              if ((cto.tipo == "Teléfono Fijo") || (cto.tipo == "")) {
                  cto.tipo = "fijo";
              }
              if (cto.tipo == "Teléfono Celular") {
                  cto.tipo = "celular";
              }
              cto.tipo = cto.tipo.toLowerCase();
              let telefono = cto.valor.match(/\d/g);
              //Se verifica el número de teléfono que se obtiene después de aplicar el matcheo
              if (telefono) {
                  let nroTel = telefono.join('').toString();
                  if (nroTel.length > 4) {
                      if (/^15/.test(nroTel)) {
                          cto.tipo = 'celular';
                      }
                      cto.valor = nroTel;
                      listaContactos.push(cto);
                  }
              }
          });
          paciente.contacto = listaContactos;

        }


        if ((paciente.estadoCivil == "")) {
            estadoCivil = null;
        } else {
            estadoCivil = paciente.estadoCivil;
        }
        db.collection(coleccion).updateOne({ _id: paciente._id }, { $set: { contacto: listaContactos, estadoCivil: estadoCivil } },
            function(err, item) {
                if (err) {
                    console.log(err);
                }
                console.log("paciente actualizado", paciente.documento);
            });
    });
})
