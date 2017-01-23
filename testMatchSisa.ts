import {
    servicioMatchSisa
} from './servicioMatchSisa';


var servSisa = new servicioMatchSisa();
servSisa.asignarMatchSisa()
    .then((res) => {
        if (res) {
            console.log('Se asignan los matcheos de Sisa correspondientes');
        }
    })
    .catch((err) => {
        console.log('Error al asignar el matcheo de Sisa', err)
    })
