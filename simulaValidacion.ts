export class simulaValidacion {

    simularSintys(paciente: any) {
       
        return ({
            pac:paciente,
        porcentajeValidacion: Math.random() * 100
        })
    }

}