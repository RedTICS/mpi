import * as mongodb from 'mongodb';
import * as config from './config';


var url = config.urlMongoAndes;


  mongodb.MongoClient.connect(url, function(err, db) {
      if (err) {
          console.log("Error al conectarse a Base de Datos", err);
      }
      let cursorStream = db.collection("paciente").find({}).stream();

      cursorStream.on("data", function(elem) {
          let paciente = elem;
          let contactosActualizar = [];
          paciente.contacto.forEach((cto) => {
                 let telefono = cto.valor.match(/\d/g);
                 // console.log(telefono);
                 if (telefono) {
                   let nroTel = telefono.join('').toString();
                   if (nroTel.length > 4) {
                       if (/^15/.test(nroTel)) {
                           cto.tipo = 'celular';
                       }
                       console.log(cto.tipo, nroTel);

                   }
                 }
                 else {
                   // console.log(cto.valor);
                   // No se inserta el contacto
                 }


          });
        });

        cursorStream.on("end", function() {
            console.log("Close Stream");
            db.close();
        });


    })
