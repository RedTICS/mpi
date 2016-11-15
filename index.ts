import * as mongoose from 'mongoose'
import { Mutator } from './utils/mutator';
import { paciente } from './schemas/patient';



mongoose.connect('mongodb://10.1.62.17/migrasips');

let patients;
let cantidadMutantes = 10;

paciente.find({}, function (err, res) {
        patients = res;
        patients.forEach(
        	function(element, index){
                //El valor de 30 mutantes a generar podría cambiarse. Por el momento mantengo el valor propuesto.
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
        p.save();
	}
}



