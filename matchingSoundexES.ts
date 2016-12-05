import { libString } from './libString';
import { IPerson } from './IPerson';
import { IWeight } from './IWeight';
import { soundexES } from './soundexES';
import * as distance from 'jaro-winkler';



export class matchingSoundexES {

    //  console.log(distance('30643636', '30643633', { caseSensitive: false }));
    private sexMatching(sexA, sexB) {
        if (sexA == sexB)
            return 1
        else
            return 0
    }

    private stringMatching(stringA, stringB) {
        var stringAMin = stringA.toLowerCase();
        var stringBMin = stringB.toLowerCase();

        var maxLen = libString.maxLargo(stringAMin, stringBMin);
        var minLen = libString.minLargo(stringAMin, stringBMin);
        var coincidencias = 0;


        for (var i = 0; i < minLen; i++) {
            if (stringAMin.charAt(i) == stringBMin.charAt(i))
                coincidencias++
        }

        return coincidencias / maxLen;
    }


public matchingSoundex(identidadA: IPerson, identidadB: IPerson, weights: IWeight): number {

        var algSoundex = new soundexES();
        //Se obtiene la clave según el algoritmo metaphoneES
        var claveFirstNameA = algSoundex.soundex(identidadA.firstname);
        var claveFirstNameB = algSoundex.soundex(identidadB.firstname);
        var claveLastNameA = algSoundex.soundex(identidadA.lastname);
        var claveLastNameB = algSoundex.soundex(identidadB.lastname);

        var completeNameA = claveFirstNameA + claveLastNameA;
        var completeNameB = claveFirstNameB + claveLastNameB;

        var v1 = weights.name * distance(completeNameA, completeNameB);  //Se utiliza el algoritmo JaroWinkler sobre las claves foneticas
        var v2 = weights.gender * this.sexMatching(identidadA.gender, identidadB.gender);
        var v3 = weights.birthDate * this.stringMatching(identidadA.birthDate, identidadB.birthDate);
        var v4 = weights.identity * this.stringMatching(identidadA.identity, identidadB.identity);
        var value = Math.round((v1 + v2 + v3 + v4) * 100) / 100;

        return value;
    }
}

    
