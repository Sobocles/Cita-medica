
import { Router } from 'express';
import validarCampos from '../middlewares/validar-campos';
import Medicos from '../controllers/medico';
import { check } from 'express-validator';
import Medico from '../models/medico';
import ValidarJwt from '../middlewares/validar-jwt';
import { uploadMedicoImage, uploadMedicoDocument } from '../config/s3.config';

const router = Router();

router.get('/',[

    
    validarCampos.instance.validarCampos
], Medicos.instance.getMedicos);

router.get('/Especialidades',[


  validarCampos.instance.validarCampos
], Medicos.instance.getMedicosEspecialidad);

router.get('/all',[

  validarCampos.instance.validarCampos
], Medicos.instance.getAllMedicos);


router.get('/:id', [
  
    validarCampos.instance.validarCampos
], Medicos.instance.getMedico );


router.post(
    '/',
    [
      // Agrega las validaciones para cada campo del médico aquí
      check('nombre', 'El nombre es obligatorio').not().isEmpty(),
      check('apellidos', 'Los apellidos son obligatorios').not().isEmpty(),
      check('email', 'El email es obligatorio').isEmail(),
      check('direccion', 'La dirección es obligatoria').not().isEmpty(),
      // Agrega más validaciones según tus necesidades
      
    ],
    Medicos.instance.crearMedico
  );

  router.post(
    '/cambiarPassword',
    [
      
    ],
    Medicos.instance.cambiarPasswordMedico
  );

router.put('/:rut',
    [
     
    
    ], 
Medicos.instance.putMedico
 );

 router.delete('/:rut',

 [

    validarCampos.instance.validarCampos
  ],
Medicos.instance.deleteMedico,
);

/**
 * Rutas para manejo de imágenes de médicos (AWS S3)
 */

// Subir imagen de perfil del médico
router.post('/:rut/imagen',
  [
    ValidarJwt.instance.validarJwt,
    uploadMedicoImage.single('imagen'), // Multer middleware - sube a S3
    validarCampos.instance.validarCampos
  ],
  Medicos.instance.subirImagenMedico
);

// Obtener URL firmada de la imagen del médico
router.get('/:rut/imagen',
  [
    validarCampos.instance.validarCampos
  ],
  Medicos.instance.obtenerUrlImagen
);

// Eliminar imagen del médico
router.delete('/:rut/imagen',
  [
    ValidarJwt.instance.validarJwt,
    validarCampos.instance.validarCampos
  ],
  Medicos.instance.eliminarImagenMedico
);

/**
 * Rutas para información profesional del médico
 */

// Obtener perfil completo del médico (público para pacientes)
router.get('/:rut/perfil',
  [
    validarCampos.instance.validarCampos
  ],
  Medicos.instance.getMedicoPerfil
);

// Actualizar información profesional del médico (requiere autenticación)
router.put('/:rut/info-profesional',
  [
    ValidarJwt.instance.validarJwt,
    validarCampos.instance.validarCampos
  ],
  Medicos.instance.actualizarInfoProfesional
);

/**
 * Rutas para gestión de documentos del médico (títulos, certificados, etc.)
 */

// Subir documento PDF del médico
router.post('/:rut/documento',
  [
    ValidarJwt.instance.validarJwt,
    uploadMedicoDocument.single('documento'), // Multer middleware - sube a S3
    validarCampos.instance.validarCampos
  ],
  Medicos.instance.subirDocumentoMedico
);

// Listar documentos del médico (público para pacientes)
router.get('/:rut/documentos',
  [
    validarCampos.instance.validarCampos
  ],
  Medicos.instance.listarDocumentosMedico
);

// Eliminar documento del médico
router.delete('/:rut/documento',
  [
    ValidarJwt.instance.validarJwt,
    validarCampos.instance.validarCampos
  ],
  Medicos.instance.eliminarDocumentoMedico
);

export default router;
