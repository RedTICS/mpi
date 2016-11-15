import { MutatedPatient } from '../schemas/mutatedPatient';

export class Mutator {

    private getRamdomCapitalLetter() {
        let text: String;
        let possible: String;
        let letterNumber: Number;

        text = "";
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        letterNumber = 1;

        for (var i = 0; i < letterNumber; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }


    private getRamdomLetter() {
        let text;
        let possible;
        let letterNumber: Number;

        text = "";
        possible = "qwertyuiopasdfghjklñzxcvbnm";
        letterNumber = 1;

        for (var i = 0; i < letterNumber; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }


    private getRamdomNumber() {
        let text: String;
        let possible: String;
        let letterNumber: Number;

        text = "";
        possible = "0123456789";
        letterNumber = 1;

        for (var i = 0; i < letterNumber; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    private getRamdomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }


    private mutateString(numberOfChar:Number, originalStr:string):string {

        numberOfChar = Number(numberOfChar);
        var mutatedStr:string = originalStr;
        let lengthStr = originalStr.length;

        for (var i = 0; i < numberOfChar; i++) {
            var j = this.getRamdomInt(0, lengthStr);
            let replaceLetter = this.getRamdomLetter();
            mutatedStr = mutatedStr.replace(mutatedStr.charAt(j), replaceLetter);
        }
        return mutatedStr;
    }

  
    public mutatePatient(patient):any {
        //Esta parte se puede revisar y mejorar!!
        let returnPatient = JSON.parse(JSON.stringify(patient));
        
        //Las características que quiero mutar
        let mutatedDocumento = patient.documento.toString();
        let mutateNombre:string = this.mutateString(this.getRamdomInt(1,2), patient.nombre);
        let mutateApellido = this.mutateString(this.getRamdomInt(1,2), patient.apellido);
        
        //Asigno las características mutadas al paciente
        returnPatient.documento = mutatedDocumento.substring(0, mutatedDocumento.length - 2) + this.getRamdomNumber();
        returnPatient.nombre = mutateNombre;
        returnPatient.apellido = mutateApellido;
        
         let mutanteToReturn = new MutatedPatient(
		 {
			  documento: returnPatient.documento,
              nombre: returnPatient.nombre,
              apellido: returnPatient.apellido,
              activo: returnPatient.activo,
              alias: returnPatient.alias,
              contacto: returnPatient.contacto,
              direccion: returnPatient.direccion,
              estado: returnPatient.estado,
              sexo: returnPatient.sexo,
              genero: returnPatient.genero,
              fechaNacimiento: returnPatient.fechaNacimiento,
              fechaFallecimiento: returnPatient.fechaFallecimiento,
              estadoCivil: returnPatient.estadoCivil,
              foto: returnPatient.foto,
              relaciones: returnPatient.relaciones,
              financiador: returnPatient.financiador,
              claveSN: returnPatient.claveSN,
              entidadesValidadoras: returnPatient.entidadesValidadoras,
			  targetid:returnPatient.idPaciente
          });

        return mutanteToReturn;
    }


}