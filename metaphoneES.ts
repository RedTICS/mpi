/*
    The Spanish Metaphone Algorithm (Algoritmo del Metáfono para el Español)
	This script implements the Metaphone algorithm (c) 1990 by Lawrence Philips.
	It was inspired by the English double metaphone algorithm implementation by
	Andrew Collins - January 12, 2007 who claims no rights to this work
	(http://www.atomodo.com/code/double-metaphone)

	The metaphone port adapted to the Spanish Language is authored
	by Alejandro Mosquera <amosquera@dlsi.ua.es> November, 2011
	and is covered under this copyright:
	Copyright 2011, Alejandro Mosquera <amosquera@dlsi.ua.es>.  All rights reserved.
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:

	1. Redistributions of source code must retain the above copyright notice, this
	list of conditions and the following disclaimer.
	2. Redistributions in binary form must reproduce the above copyright notice, this
	list of conditions and the following disclaimer in the documentation and/or
	other materials provided with the distribution.


	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
export class metaphoneES {

    string_at(data, start, string_length, lista) {
        if ((start < 0) || (start >= data.length)) {
            return false;
        }

        for (let i = 0; i < lista.length; i++) {
            let subdata = data.substr(start, string_length);
            if (subdata.indexOf(lista[i]) > -1) {
                return true;
            }
        }
        return false;
    }


    is_vowel(data, pos) {
        if (['A', 'E', 'I', 'O', 'U'].indexOf(data[pos]) > -1)
            return true;
        return false;
    }

    strtr(st) {
        if (st) {
            st = st.replace('á', 'A');
            st = st.replace('ch', 'X');
            st = st.replace('ç', 'S');
            st = st.replace('é', 'E');
            st = st.replace('í', 'I');
            st = st.replace('ó', 'O');
            st = st.replace('ú', 'U');
            st = st.replace('ñ', 'NY');
            st = st.replace('gü', 'W');
            st = st.replace('ü', 'U');
            st = st.replace('b', 'V');
            st = st.replace('z', 'S');
            st = st.replace('ll', 'Y');
            return st;
        } else
            return '';

    }

    metaphone(data) {

        //initialize metaphone key string
        var meta_key: string = "";
        //set maximum metaphone key size
        var key_length: number = 6;
        //set current position to the beginning
        var current_pos: number = 0;
        //get string  length
        var string_length: number = data.lentgth;
        //set to  the end of the string
        var end_of_string_pos: number = string_length - 1;
        var original_string: string = data + " ";
        //Let's replace some spanish characters  easily confused
        original_string = this.strtr(original_string.toLowerCase())
        //convert string to uppercase
        original_string = original_string.toUpperCase()

        // main loop
        while ((meta_key.length < key_length) && (current_pos <= original_string.length)) {
            //get character from the string
            var current_char: string = original_string[current_pos];

            //if it is a vowel, and it is at the begining of the string,
            //set it as part of the meta key
            if (this.is_vowel(original_string, current_pos) && (current_pos == 0)) {
                meta_key += current_char;
                current_pos += 1;
            }
            //Let's check for consonants  that have a single sound
            //or already have been replaced  because they share the same
            //sound like 'B' for 'V' and 'S' for 'Z'
            else {
                if (this.string_at(original_string, current_pos, 1, ['D', 'F', 'J', 'K', 'M', 'N', 'P', 'T', 'V', 'L', 'Y'])) {
                    meta_key += current_char

                    //increment by two if a repeated letter is found
                    if (original_string.substr(current_pos + 1, 1) == current_char) {
                        current_pos += 2
                    }
                    else { // increment only by one
                        current_pos += 1
                    }
                }
                else {  //check consonants with similar confusing sounds
                    switch (current_char) {
                        case 'C':
                            if (original_string.substr(current_pos + 1, 1) == 'H') {
                                current_pos += 2
                            }
                            else {
                                //special case 'acción', 'reacción',etc.
                                if (original_string.substr(current_pos + 1, 1) == 'C') {
                                    meta_key += 'X'
                                    current_pos += 2
                                }
                                else {// special case 'cesar', 'cien', 'cid', 'conciencia'
                                    if (this.string_at(original_string, current_pos, 2, ['CE', 'CI'])) {
                                        meta_key += 'Z'
                                        current_pos += 2
                                    }
                                    else {
                                        meta_key += 'K';
                                        current_pos += 1;
                                    }
                                }
                            }
                            break;
                        case 'G':
                            //special case 'gente', 'ecologia',etc
                            if (this.string_at(original_string, current_pos, 2, ['GE', 'GI'])) {
                                meta_key += 'J';
                                current_pos += 2
                            }
                            else {
                                meta_key += 'G';
                                current_pos += 1;
                            }
                            break;
                        case 'H':	//since the letter 'h' is silent in spanish,  let's set the meta key to the vowel after the letter 'h'
                            if (this.is_vowel(original_string, current_pos + 1)) {
                                meta_key += original_string[current_pos + 1];
                                current_pos += 2;
                            }
                            else {
                                meta_key += 'H';
                                current_pos += 1;
                            }
                            break;
                        case 'Q':
                            if (original_string.substr(current_pos + 1, 1) == 'U')
                                current_pos += 2;
                            else
                                current_pos += 1;
                            meta_key += 'K';
                            break;
                        case 'W':
                            meta_key += 'U';
                            current_pos += 1;
                            break;
                        case 'R': //perro, arrebato, cara
                            current_pos += 1;
                            meta_key += 'R';
                            break;
                        case 'S':
                            if ((!this.is_vowel(original_string, current_pos + 1)) && (current_pos == 0)) {
                                meta_key += 'ES';
                                current_pos += 1;
                            }
                            else {
                                current_pos += 1;
                                meta_key += 'S';
                            }
                            break;
                        case 'Z':
                            current_pos += 1;
                            meta_key += 'Z';
                            break;
                        case 'X':
                            if ((!this.is_vowel(original_string, current_pos + 1)) && (data.length > 1) && (current_pos == 0)) {
                                meta_key += 'EX';
                                current_pos += 1;
                            }
                            else {
                                meta_key += 'X';
                                current_pos += 1;
                            }
                            break;
                        default:
                            current_pos += 1;
                    }//switch
                }//else -- check consonants with similar confusing sounds
            }//sound like 'B' for 'V' and 'S' for 'Z' else
        }//while
        //trim any blank characters
        meta_key = meta_key.trim();

        //return the final meta key string
        return meta_key;

    }//metafhone
}
