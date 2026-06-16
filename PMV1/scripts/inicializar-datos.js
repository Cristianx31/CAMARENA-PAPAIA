// Script para inicializar datos básicos en MongoDB Atlas
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Importar modelos
const Usuario = require('../modelo/Usuario');
const VariedadPapa = require('../modelo/VariedadPapa');

// Datos iniciales
const usuariosIniciales = [
    {
        nombre: 'Administrador',
        correo: 'admin@papaclick.com',
        contraseña: 'admin123456', // Se encriptará automáticamente
        rol: 'administrador',
        activo: true
    },
    {
        nombre: 'Operador Demo',
        correo: 'demo@papaclick.com',
        contraseña: 'demo123456',
        rol: 'operador',
        activo: true
    },
    {
        nombre: 'Consultor',
        correo: 'consultor@papaclick.com',
        contraseña: 'consultor123456',
        rol: 'consultor',
        activo: true
    }
];

const variedadesIniciales = [
    {
        nombreComun: 'Amarilla',
        nombreCientifico: 'Solanum tuberosum var. amarilla',
        descripcion: 'Papa de pulpa amarilla, textura cremosa y sabor suave. Ideal para puré y papas fritas.',
        caracteristicas: {
            fisicas: [
                'Piel lisa y amarillenta',
                'Pulpa de color amarillo intenso',
                'Forma ovalada regular',
                'Tamaño mediano a grande'
            ],
            culinarias: ['Textura cremosa', 'Sabor suave', 'Absorbe bien condimentos']
        },
        usosCulinarios: ['Puré', 'Papas fritas', 'Guisos', 'Al horno'],
        origen: {
            pais: 'Perú',
            region: 'Costa y Sierra',
            altitud: '0-3500 msnm'
        },
        activo: true
    },
    {
        nombreComun: 'Blanca',
        nombreCientifico: 'Solanum tuberosum var. blanca',
        descripcion: 'Papa nativa de pulpa blanca y textura suave. Ideal para preparación en guisos y potajes.',
        caracteristicas: {
            fisicas: [
                'Piel blanca o crema',
                'Pulpa blanca suave',
                'Forma redonda o ligeramente ovalada',
                'Tamaño mediano'
            ],
            culinarias: ['Textura cremosa', 'Sabor suave', 'Absorbe bien condimentos']
        },
        usosCulinarios: ['Sopas', 'Guisos', 'Papa rellena', 'Causa'],
        origen: {
            pais: 'Perú',
            region: 'Sierra',
            altitud: '2000-3600 msnm'
        },
        activo: true
    },
    {
        nombreComun: 'Única',
        nombreCientifico: 'Solanum tuberosum var. unica',
        descripcion: 'Variedad nativa única del distrito de Acolla con características morfológicas distintivas.',
        caracteristicas: {
            fisicas: [
                'Tamaño pequeño',
                'Piel rojiza o rosada',
                'Pulpa amarilla clara',
                'Forma redonda'
            ],
            culinarias: ['Textura firme', 'Sabor pronunciado', 'Rica en nutrientes']
        },
        usosCulinarios: ['Papa sancochada', 'Ensaladas', 'Anticuchos de papa', 'Guarniciones'],
        origen: {
            pais: 'Perú',
            region: 'Sierra central',
            altitud: '2800-3800 msnm'
        },
        activo: true
    }
];

async function inicializarDatos() {
    try {
        console.log('🥔 Inicializando datos en MongoDB Atlas...');

        // Conectar a la base de datos
        const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL;

        if (!mongoURI) {
            throw new Error('No se encontró URI de MongoDB en variables de entorno');
        }

        await mongoose.connect(mongoURI);
        console.log('✅ Conectado a MongoDB');

        // Limpiar datos existentes (opcional - comentar si no quieres limpiar)
        console.log('🧹 Limpiando datos existentes...');

        // Eliminar índices únicos problemáticos si existen
        try {
            await Usuario.collection.dropIndex('idUsuario_1');
        } catch (e) {
            // Ignorar si el índice no existe
        }

        try {
            await VariedadPapa.collection.dropIndex('idVariedad_1');
        } catch (e) {
            // Ignorar si el índice no existe
        }

        await Usuario.deleteMany({});
        await VariedadPapa.deleteMany({});

        // Insertar usuarios iniciales
        console.log('👥 Creando usuarios iniciales...');
        const usuariosCreados = await Usuario.insertMany(usuariosIniciales);
        console.log(`✅ ${usuariosCreados.length} usuarios creados`);

        // Insertar variedades de papa iniciales
        console.log('🥔 Creando variedades de papa...');
        const variedadesCreadas = await VariedadPapa.insertMany(variedadesIniciales);
        console.log(`✅ ${variedadesCreadas.length} variedades creadas`);

        console.log('');
        console.log('🎉 DATOS INICIALES CREADOS EXITOSAMENTE!');
        console.log('');
        console.log('�� USUARIOS CREADOS:');
        usuariosCreados.forEach(user => {
            console.log(`   📧 ${user.correo} (${user.rol})`);
        });

        console.log('');
        console.log('🥔 VARIEDADES CREADAS:');
        variedadesCreadas.forEach(variedad => {
            console.log(`   🌱 ${variedad.nombreComun} - ${variedad.nombreCientifico}`);
        });

        console.log('');
        console.log('🚀 Credenciales de acceso:');
        console.log('   Admin: admin@papaclick.com / admin123');
        console.log('   Demo:  demo@papaclick.com / demo123');

    } catch (error) {
        console.error('❌ Error inicializando datos:', error.message);

        if (error.message.includes('ENOTFOUND')) {
            console.log('');
            console.log('💡 Sugerencias:');
            console.log('1. Verifica tu URI de MongoDB Atlas en .env');
            console.log('2. Ejecuta: npm run config:atlas');
            console.log('3. Asegúrate de tener conexión a internet');
        }

    } finally {
        await mongoose.connection.close();
        console.log('');
        console.log('🔌 Conexión cerrada');
    }
}

// Ejecutar inicialización
inicializarDatos();
