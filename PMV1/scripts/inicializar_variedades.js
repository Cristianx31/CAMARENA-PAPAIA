// Script para inicializar datos de variedades de papas nativas
const mongoose = require('mongoose');
require('dotenv').config();

// Reutilizar la función de conexión centralizada (incluye fallback no-SRV y local)
const connectDB = require('../basedatos/db');

// Importar modelo
const VariedadPapa = require('../modelo/VariedadPapa');

// Datos de las variedades nativas del Perú
const variedadesNativas = [
    {
        nombreCientifico: 'Solanum tuberosum var. amarilla',
        nombreComun: 'amarilla',
        descripcion: 'Papa criolla tradicional peruana de color amarillo dorado, muy popular en la gastronomía nacional. Conocida por su sabor suave y textura cremosa.',
        origen: {
            pais: 'Perú',
            region: 'Andes Centrales',
            altitud: '2800-3800 msnm'
        },
        caracteristicas: {
            color: 'Amarillo dorado',
            forma: 'Ovalada a redonda',
            tamaño: 'Mediano (60-90g)',
            textura: 'Cremosa y harinosa'
        },
        usosCulinarios: [
            'Papa sancochada',
            'Papas rellenas',
            'Puré de papa',
            'Guisos tradicionales',
            'Causa limeña'
        ],
        valorNutricional: {
            carbohidratos: 20.1,
            proteinas: 2.0,
            vitaminas: ['Vitamina C', 'Vitamina B6', 'Potasio', 'Magnesio']
        },
        temporadaCultivo: {
            siembra: 'Octubre - Diciembre',
            cosecha: 'Abril - Junio'
        },
        activa: true,
        fechaRegistro: new Date()
    },
    {
        nombreCientifico: 'Solanum tuberosum var. blanca',
        nombreComun: 'blanca',
        descripcion: 'Papa de pulpa blanca y textura suave, ideal para guisos y preparaciones tradicionales. Muy valorada por su sabor delicado y su versatilidad culinaria.',
        origen: {
            pais: 'Perú',
            region: 'Sierra',
            altitud: '2000-3600 msnm'
        },
        caracteristicas: {
            color: 'Blanco-crema',
            forma: 'Redonda o ligeramente ovalada',
            tamaño: 'Mediano (55-85g)',
            textura: 'Suave y cremosa'
        },
        usosCulinarios: [
            'Sopas',
            'Guisos',
            'Causa',
            'Papas rellenas',
            'Al horno'
        ],
        valorNutricional: {
            carbohidratos: 19.5,
            proteinas: 2.2,
            vitaminas: ['Vitamina C', 'Vitamina B6', 'Potasio', 'Magnesio']
        },
        temporadaCultivo: {
            siembra: 'Octubre - Enero',
            cosecha: 'Abril - Julio'
        },
        activa: true,
        fechaRegistro: new Date()
    },
    {
        nombreCientifico: 'Solanum tuberosum var. unica',
        nombreComun: 'unica',
        descripcion: 'Variedad autóctona de alto valor genético, de forma compacta y sabor distintivo. Es apreciada por su calidad en platos tradicionales y su resistencia en cultivo.',
        origen: {
            pais: 'Perú',
            region: 'Sierra Central',
            altitud: '2800-3800 msnm'
        },
        caracteristicas: {
            color: 'Piel rojiza o rosada',
            forma: 'Redonda y compacta',
            tamaño: 'Pequeño a mediano (40-60g)',
            textura: 'Firme y sabrosa'
        },
        usosCulinarios: [
            'Papa sancochada',
            'Ensaladas',
            'Anticuchos de papa',
            'Guarniciones',
            'Platos de celebración'
        ],
        valorNutricional: {
            carbohidratos: 18.9,
            proteinas: 2.0,
            vitaminas: ['Vitamina C', 'Potasio', 'Hierro', 'Fibras']
        },
        temporadaCultivo: {
            siembra: 'Octubre - Enero',
            cosecha: 'Abril - Julio'
        },
        activa: true,
        fechaRegistro: new Date()
    }
];

// Función para insertar variedades
const insertarVariedades = async () => {
    try {
        console.log('🌱 Iniciando inserción de variedades nativas...');
        
        // Limpiar colección existente
        await VariedadPapa.deleteMany({});
        console.log('🗑️ Datos anteriores eliminados');
        
        // Insertar nuevas variedades
        const resultado = await VariedadPapa.insertMany(variedadesNativas);
        console.log(`✅ ${resultado.length} variedades nativas insertadas exitosamente:`);
        
        resultado.forEach(variedad => {
            console.log(`   🥔 ${variedad.nombreComun.toUpperCase()} - ${variedad.nombreCientifico}`);
        });
        
        return resultado;
        
    } catch (error) {
        console.error('❌ Error insertando variedades:', error.message);
        throw error;
    }
};

// Función principal
const main = async () => {
    try {
        console.log('🚀 Inicializando base de datos de variedades nativas...\n');
        
        // Conectar a base de datos (connectDB devuelve la conexión o null)
        const conn = await connectDB();
        if (!conn) {
            process.exit(1);
        }
        
        // Insertar variedades
        await insertarVariedades();
        
        console.log('\n🎉 Base de datos inicializada exitosamente!');
        console.log('📊 Variedades disponibles para clasificación:');
        console.log('   • Amarilla (Papa criolla tradicional)');
        console.log('   • Blanca (Papa de pulpa blanca y textura suave)');
        console.log('   • Única (Variedad autóctona de alto valor genético)');
        
    } catch (error) {
        console.error('\n💥 Error en la inicialización:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión a MongoDB cerrada');
        process.exit(0);
    }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { insertarVariedades, variedadesNativas };