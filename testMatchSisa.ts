import {
    servicioMatchSisa
} from './servicioMatchSisa';


var servSisa = new servicioMatchSisa();
servSisa.asignarMatchSisa()
    .then((res => {
            console.log('asignarMatchSisa');
        }))
