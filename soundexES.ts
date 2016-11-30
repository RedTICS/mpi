export class soundexES {

 digrafo(st) {
        if (st) {
            
            st = st.replace('xa', 'j');
            st = st.replace('xi', 'j');
            st = st.replace('xe', 'c');
            st = st.replace('xo', 'c');
            st = st.replace('xu', 'c');
            st = st.replace('ch', 'y');
            st = st.replace('sh', 'y');
            st = st.replace('ll', 'y');
            st = st.replace('gu', 'w');
            st = st.replace('rr', 'r');
            st = st.replace('cc', 'k');
            st = st.replace('ce', 's');
            st = st.replace('ci', 's');
            st = st.replace('gn', 'n');
        } 
        return st.split('');    
    }


    soundex(s) {
        var a = s.toLowerCase(),
         //La función que simplifica el digrafo
            d = this.digrafo(a),
            r = '',
           
            codes = {
                á: '', a: '', ä: '', à: '',
                é: '', e: '', ë: '', è: '',
                í: '', i: '', ï: '', ì: '',
                ó: '', o: '', ö: '', ò: '',
                ú: '', u: '', ü: '', ù: '',
                p: 0,
                v: 1, b: 1,
                f: 2, h: 2,
                d: 3, t: 3,
                c: 4, s: 4,x: 4, z: 4,
                l: 5, y: 5,
                m: 6, n: 6, ñ: 6,
                k: 7, q: 7,
                g: 8, j: 8,
                r: 9
            };
        r = d
            .map(function (v, i, d) {
                return codes[v]
            })
            .filter(function (v, i, d) {
                return v !== d[i - 1];
            })
            .join('');

        return r;
    };

}