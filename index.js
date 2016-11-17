var mongoose = require('mongoose');
var mutator_1 = require('./utils/mutator');
var patient_1 = require('./schemas/patient');
var config = require('./config');
/*Esta parte es para probar lo de mutantes*/
mongoose.connect(config.urlMigraSips);
var patients;
//Cant. de mutantes a generar
var cantidadMutantes = 10;
patient_1.paciente.find({}, function (err, res) {
    patients = res;
    patients.forEach(function (element, index) {
        mutar(element, index, cantidadMutantes);
    });
    console.log("La mutación se ha realizado correctamente...");
}).limit(50);
function mutar(item, index, cantMutantes) {
    var mutator = new mutator_1.Mutator();
    var i = 0;
    for (i = 0; i < cantMutantes; i++) {
        var p = mutator.mutatePatient(item);
        //console.log(p);
        p.save();
    }
}
