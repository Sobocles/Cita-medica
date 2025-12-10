

export const getMenuFrontEnd = (rol = 'USER_ROLE') => {
  const adminMenu = [
    { label: 'Inicio', url: '/inicio-instrucciones' },
    { label: 'Gestionar Pacientes', url: '/gestionar-pacientes' },
    { label: 'Gestionar Tipo de Cita', url: '/gestionar-tipo-cita' },
    { label: 'Gestionar Médicos', url: '/gestionar-medicos' },  
    { label: 'Gestionar Horarios de Médicos', url: '/gestionar-horarios-medicos' },
    { label: 'Gestionar Citas', url: '/gestionar-cita' }, 
    { label: 'Datos clinica', url: '/info-clinica' },
    { label: 'Ver facturas', url: '/factura' },
  ];

  const pacienteMenu = [
    { label: 'Inicio', url: '/inicio-paciente' },
    { label: 'Agendar Cita', url: '/Agendar-cita' },
    { label: 'Revisar citas medicas', url: '/ver-cita-paciente' },
    { label: 'Revisar historial medico', url: '/historial' },
    { label: 'Cambiar contraseña', url: '/cambiar-password' }
  ];

  const medicoMenu = [
    { label: 'Redactar hitorial medico', url: '/agregar-historial' },
    { label: 'Gestinar hitoriales medicos', url: '/gestionar-historiales' },
    { label: 'Citas medicas del medico', url: '/ver-citas' },
    { label: 'Mi Perfil Profesional', url: '/mi-perfil-profesional' },
    { label: 'Cambiar contraseña', url: '/cambiar-password-medicos' },
  ];

  let menuItems: { label: string, url: string }[] = [];

  if (rol === 'ADMIN_ROLE') {
    menuItems = adminMenu;
  } else if (rol === 'USER_ROLE') {
    menuItems = pacienteMenu;
  } else if (rol === 'MEDICO_ROLE') { // Agregada condición para el rol de médico
    menuItems = medicoMenu;
  } else {
    // Manejar otros roles si es necesario
    menuItems = [];
  }

  return menuItems; // Devuelve el menú como resultado en lugar de enviarlo como respuesta JSON
};

  