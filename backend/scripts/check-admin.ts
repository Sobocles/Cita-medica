import dotenv from 'dotenv';
import Usuario from '../models/usuario';
import Rol from '../models/rol';
import db from '../db/connection';
import bcrypt from 'bcrypt';
import { UserRole } from '../types/enums';

dotenv.config();

require('../models/associations');

async function checkAndRecreateAdmin() {
  try {
    await db.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Buscar usuario admin
    const adminRole = await Rol.findOne({ where: { codigo: UserRole.ADMIN } });

    if (!adminRole) {
      console.log('❌ Rol ADMIN_ROLE no encontrado');
      process.exit(1);
    }

    console.log(`✅ Rol ADMIN encontrado con ID: ${adminRole.id}`);

    const existingAdmin = await Usuario.findOne({
      where: { email: 'admin@sistema.com' },
      include: [{
        model: Rol,
        as: 'rol'
      }]
    });

    if (existingAdmin) {
      console.log('\n📋 Usuario admin encontrado:');
      console.log('   RUT:', existingAdmin.rut);
      console.log('   Email:', existingAdmin.email);
      console.log('   Nombre:', existingAdmin.nombre, existingAdmin.apellidos);
      console.log('   Rol:', (existingAdmin as any).rol?.codigo);
      console.log('   Estado:', existingAdmin.estado);

      // Verificar password
      const passwordMatches = bcrypt.compareSync('admin123', existingAdmin.password);
      console.log('   Password "admin123" es correcta:', passwordMatches ? '✅' : '❌');

      if (!passwordMatches) {
        console.log('\n⚠️ La contraseña NO coincide. ¿Desea actualizarla?');
        console.log('   Ejecutando actualización...');

        const salt = bcrypt.genSaltSync();
        await existingAdmin.update({
          password: bcrypt.hashSync('admin123', salt)
        });

        console.log('✅ Contraseña actualizada a: admin123');
      }
    } else {
      console.log('\n❌ Usuario admin NO encontrado');
      console.log('   Creando usuario admin...');

      const salt = bcrypt.genSaltSync();
      const newAdmin = await Usuario.create({
        rut: 'ADMIN-001',
        nombre: 'Admin',
        apellidos: 'Sistema',
        email: 'admin@sistema.com',
        password: bcrypt.hashSync('admin123', salt),
        fecha_nacimiento: new Date('1990-01-01'),
        telefono: '123456789',
        direccion: 'Dirección de Administración',
        rolId: adminRole.id,
        estado: 'activo'
      });

      console.log('✅ Usuario admin creado exitosamente');
      console.log('   Email: admin@sistema.com');
      console.log('   Password: admin123');
    }

    console.log('\n✅ Verificación completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndRecreateAdmin();
