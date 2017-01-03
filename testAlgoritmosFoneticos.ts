import * as distance from 'jaro-winkler';
import { IPerson } from './IPerson';
import { IWeight } from './IWeight';
import { metaphoneES } from './metaphoneES';
import { soundexES} from './soundexES';


  console.log(distance('Natalia', 'Carina', { caseSensitive: false }));

var algSoundex = new soundexES();
console.log(algSoundex.soundex('Abadia'));
