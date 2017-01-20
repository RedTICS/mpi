"use strict";
const mutatedPatient_1 = require('../schemas/mutatedPatient');
class Mutator {
    getRamdomCapitalLetter() {
        let text;
        let possible;
        let letterNumber;
        text = "";
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        letterNumber = 1;
        for (var i = 0; i < letterNumber; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    getRamdomLetter() {
        let text;
        let possible;
        let letterNumber;
        text = "";
        possible = "qwertyuiopasdfghjklñzxcvbnm";
        letterNumber = 1;
        for (var i = 0; i < letterNumber; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    getRamdomNumber() {
        let text;
        let possible;
        let letterNumber;
        text = "";
        possible = "0123456789";
        letterNumber = 1;
        for (var i = 0; i < letterNumber; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    getRamdomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    getInfoVecina(originalStr) {
        let dataChange;
        let text;
        text = "";
        dataChange = {
            caracter: "",
            posicionVecina: "",
            posicionTarget: ""
        };
        let cantCaracteres = originalStr.length;
        //Seleccino una posición al azar del string (menos la primera y la última)
        let posicionObjetivo = this.getRamdomInt(1, cantCaracteres - 1);
        //Seleccino una letra al azar entre esa posición y sus vecinos
        let posicionVecina = this.getRamdomInt(posicionObjetivo - 1, posicionObjetivo + 1);
        text += originalStr.charAt(posicionVecina);
        //Armo el objeto
        dataChange.caracter = text;
        dataChange.posicionVecina = posicionVecina;
        dataChange.posicionTarget = posicionObjetivo;
        return dataChange;
    }
    mutateString(numberOfChar, originalStr) {
        numberOfChar = Number(numberOfChar);
        var mutatedStr = originalStr;
        let lengthStr = originalStr.length;
        for (var i = 0; i < numberOfChar; i++) {
            var j = this.getRamdomInt(0, lengthStr);
            //let replaceLetter = this.getLetraVecina(originalStr);
            //let replaceLetter = this.getRamdomCapitalLetter();
            let replaceData = this.getInfoVecina(originalStr);
            let originalCaracter = originalStr.charAt(replaceData.posicionTarget);
            //Doy vuelta los caracteres
            mutatedStr = mutatedStr.replace(mutatedStr.charAt(replaceData.posicionTarget), replaceData.caracter);
            mutatedStr = mutatedStr.replace(mutatedStr.charAt(replaceData.posicionVecina), originalCaracter);
        }
        return mutatedStr;
    }
    mutatePatient(patient) {
        //Esta parte se puede revisar y mejorar!!
        let returnPatient = JSON.parse(JSON.stringify(patient));
        //Las características que quiero mutar
        let mutatedDocumento = patient.documento.toString();
        let mutateNombre = this.mutateString(this.getRamdomInt(1, 2), patient.nombre);
        let mutateApellido = this.mutateString(this.getRamdomInt(1, 2), patient.apellido);
        //Asigno las características mutadas al paciente
        returnPatient.documento = mutatedDocumento.substring(0, mutatedDocumento.length - 2) + this.getRamdomNumber();
        returnPatient.nombre = mutateNombre;
        returnPatient.apellido = mutateApellido;
        let mutanteToReturn = new mutatedPatient_1.MutatedPatient({
            documento: returnPatient.documento,
            nombre: returnPatient.nombre,
            apellido: returnPatient.apellido,
            //activo: returnPatient.activo,
            alias: returnPatient.alias,
            contacto: returnPatient.contacto,
            direccion: returnPatient.direccion,
            estado: returnPatient.estado,
            sexo: returnPatient.sexo,
            genero: returnPatient.genero,
            fechaNacimiento: returnPatient.fechaNacimiento,
            fechaFallecimiento: returnPatient.fechaFallecimiento,
            estadoCivil: returnPatient.estadoCivil,
            //foto: returnPatient.foto,
            //relaciones: returnPatient.relaciones,
            //financiador: returnPatient.financiador,
            claveBlocking: returnPatient.claveBlocking,
            //entidadesValidadoras: returnPatient.entidadesValidadoras,
            targetid: returnPatient.idPaciente
        });
        return mutanteToReturn;
    }
}
exports.Mutator = Mutator;
//# sourceMappingURL=mutator.js.map