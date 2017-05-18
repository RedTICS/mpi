import * as sisaService from './servicioMatchSisa';
import * as autentica from './autenticacion';
import * as config from '../config';

function corregirMpi() {
    autentica.loginApp(config.loginData)
    .then(value => {
        value.token = 'JWT ' + value.token;
        sisaService.validarPacienteEnSisa(value.token)
        .then(rta => {
                console.log('finaliza proceso');
            })
            .catch((err) => {
              console.error('Error**:' + err);
            });
     });
}
/* Inicio de la app */
corregirMpi();