import { libString } from './libString';
import * as distance from 'jaro-winkler';
import { IPerson } from './IPerson';
import { IWeight } from './IWeight';



export class matchingJaroWinkler {

    //  console.log(distance('30643636', '30643633', { caseSensitive: false }));
    private sexMatching(sexA, sexB) {
        if (sexA == sexB)
            return 1
        else
            return 0
    }

    public machingJaroWinkler(identidadA: IPerson, identidadB: IPerson, weights: IWeight): number {
        var completeNameA = identidadA.firstname + identidadA.lastname;
        var completeNameB = identidadB.firstname + identidadB.lastname;
        var v1 = weights.name * distance(completeNameA, completeNameB);  //Se utiliza el algoritmo JaroWinkler
        var v2 = weights.gender * this.sexMatching(identidadA.gender, identidadB.gender);
        var v3 = weights.birthDate * distance(identidadA.birthDate, identidadB.birthDate);
        var v4 = weights.identity * distance(identidadA.identity, identidadB.identity);
        var value = Math.round((v1 + v2 + v3 + v4) * 100) / 100;

        return value;
    }

}
