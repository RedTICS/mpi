import * as mongoose from 'mongoose'
import { Mutator } from './utils/mutator';
import { paciente } from './schemas/patient';
import * as config from './config';

/*Esta parte es para probar lo de mutantes*/


mongoose.connect(config.urlMigraSips);

let patients;
//Cant. de mutantes a generar
let cantidadMutantes = 10;

paciente.find({}, function (err, res) {
        patients = res;
        patients.forEach(
        	function(element, index){
                mutar(element, index, cantidadMutantes);
        	}
        );
        console.log("La mutación se ha realizado correctamente...");
    }).limit(50);


function mutar(item, index,cantMutantes)
{
    let mutator = new Mutator();
	var i=0;
	for(i=0;i<cantMutantes;i++){
		var p = mutator.mutatePatient(item);
        //console.log(p);
        p.save();
	}
}
