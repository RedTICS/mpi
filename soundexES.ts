export class soundexES{

soundex(s) {
     var a = s.toLowerCase().split(''),
         //f = a.shift(),
         r = '',
         codes = {
             a: '', e: '', i: '', o: '', u: '',
             p: 0, v: 1,b: 1, f: 2, h:2,
             d: 3, t: 3,
             c: 4, s: 4, x: 4, z: 4,            
             l: 5,y:5,
             m: 6, n: 6, ñ:6,            
             k: 7, q: 7,
             g: 8, j: 8,
             r: 9
         };
 
     r = a
         .map(function (v, i, a) { return codes[v] })
         .filter(function (v, i, a) {
             return v !== a[i - 1];
         })
         .join('');
 
     return r;//(r + '000').slice(0, 4).toUpperCase();
};

}