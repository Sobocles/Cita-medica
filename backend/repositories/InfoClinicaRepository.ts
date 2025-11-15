import InfoClinica from '../models/info-clinica';

/**
 * Repositorio para manejar el acceso a datos de información de la clínica
 */
export class InfoClinicaRepository {
    /**
     * Obtiene la información de la clínica (normalmente solo hay un registro)
     */
    async findOne() {
        return InfoClinica.findOne();
    }

    /**
     * Busca información de clínica por ID
     */
    async findByPk(id: number) {
        return InfoClinica.findByPk(id);
    }

    /**
     * Crea un nuevo registro de información de clínica
     */
    async create(clinicaData: any) {
        return InfoClinica.create(clinicaData);
    }

    /**
     * Actualiza la información de la clínica
     */
    async update(clinica: InfoClinica, clinicaData: any) {
        return clinica.update(clinicaData);
    }
}

export default new InfoClinicaRepository();
