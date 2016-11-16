"use strict";
const mongoose = require('mongoose');
const mutator_1 = require('./utils/mutator');
const patient_1 = require('./schemas/patient');
const config = require('./config');
/*Esta parte es para probar lo de mutantes*/
mongoose.connect(config.urlMigraSips);
let patients;
let cantidadMutantes = 10;
patient_1.paciente.find({}, function (err, res) {
    patients = res;
    patients.forEach(function (element, index) {
        //El valor de 30 mutantes a generar podría cambiarse. Por el momento mantengo el valor propuesto.
        mutar(element, index, cantidadMutantes);
    });
    console.log("La mutación se ha realizado correctamente...");
}).limit(50);
function mutar(item, index, cantMutantes) {
    let mutator = new mutator_1.Mutator();
    var i = 0;
    for (i = 0; i < cantMutantes; i++) {
        var p = mutator.mutatePatient(item);
        p.save();
    }
}
//# sourceMappingURL=index.js.map