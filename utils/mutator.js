var mutatedPatient_1 = require('../schemas/mutatedPatient');
var Mutator = (function () {
    function Mutator() {
    }
    Mutator.prototype.getRamdomCapitalLetter = function () {
        var text;
        var possible;
        var letterNumber;
        text = "";
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        letterNumber = 1;
        for (var i = 0; i < letterNumber; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    Mutator.prototype.getRamdomLetter = function () {
        var text;
        var possible;
        var letterNumber;
        text = "";
        possible = "qwertyuiopasdfghjklñzxcvbnm";
        letterNumber = 1;
        for (var i = 0; i < letterNumber; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    Mutator.prototype.getRamdomNumber = function () {
        var text;
        var possible;
        var letterNumber;
        text = "";
        possible = "0123456789";
        letterNumber = 1;
        for (var i = 0; i < letterNumber; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    Mutator.prototype.getRamdomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };
    Mutator.prototype.mutateString = function (numberOfChar, originalStr) {
        numberOfChar = Number(numberOfChar);
        var mutatedStr = originalStr;
        var lengthStr = originalStr.length;
        for (var i = 0; i < numberOfChar; i++) {
            var j = this.getRamdomInt(0, lengthStr);
            var replaceLetter = this.getRamdomLetter();
            mutatedStr = mutatedStr.replace(mutatedStr.charAt(j), replaceLetter);
        }
        return mutatedStr;
    };
    Mutator.prototype.mutatePatient = function (patient) {
        //Esta parte se puede revisar y mejorar!!
        var returnPatient = JSON.parse(JSON.stringify(patient));
        //Las características que quiero mutar
        var mutatedDocumento = patient.documento.toString();
        var mutateNombre = this.mutateString(this.getRamdomInt(1, 2), patient.nombre);
        var mutateApellido = this.mutateString(this.getRamdomInt(1, 2), patient.apellido);
        //Asigno las características mutadas al paciente
        returnPatient.documento = mutatedDocumento.substring(0, mutatedDocumento.length - 2) + this.getRamdomNumber();
        returnPatient.nombre = mutateNombre;
        returnPatient.apellido = mutateApellido;
        var mutanteToReturn = new mutatedPatient_1.MutatedPatient({
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
            targetid: returnPatient.idPaciente
        });
        return mutanteToReturn;
    };
    return Mutator;
})();
exports.Mutator = Mutator;
