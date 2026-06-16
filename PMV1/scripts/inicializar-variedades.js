// Script de inicialización - Variedades de Papa
const mongoose = require('mongoose');
const VariedadPapa = require('../modelo/VariedadPapa');
const connectDB = require('../basedatos/db');

// Datos de las variedades nativas del Perú
const variedadesIniciales = [
    {
        nombreCientifico: 'Solanum tuberosum var. amarilla',
        nombreComun: 'amarilla',
        descripcion: 'Papa criolla tradicional del Perú, caracterizada por su color amarillo intenso y sabor dulce. Es una de las variedades más consumidas en la gastronomía peruana.',
        origen: {
            pais: 'Perú',
            region: 'Sierra Central y Norte',
            altitud: '2800-4000 msnm'
        },
        caracteristicas: {
            color: 'Amarillo intenso',
            forma: 'Ovalada a redonda',
            tamaño: 'Mediano (5-8 cm)',
            textura: 'Harinosa y cremosa'
        },
        usosCulinarios: [
            'Papa rellena',
            'Puré de papas',
            'Papas a la huancaína',
            'Causa limeña',
            'Guisos tradicionales'
        ],
        valorNutricional: {
            carbohidratos: 20.1,
            proteinas: 2.0,
            vitaminas: ['Vitamina C', 'Vitamina B6', 'Potasio', 'Hierro']
        },
        temporadaCultivo: {
            siembra: 'Octubre - Diciembre',
            cosecha: 'Abril - Junio'
        },
        activa: true
    },
    {
        nombreCientifico: 'Solanum tuberosum var. blanca',
        nombreComun: 'blanca',
        descripcion: 'Variedad de pulpa blanca y textura suave, recomendada para guisos y preparaciones tradicionales. Muy apreciada por su sabor equilibrado.',
        origen: {
            pais: 'Perú',
            region: 'Sierra Central y Norte',
            altitud: '2000-3600 msnm'
        },
        caracteristicas: {
            color: 'Blanco-crema',
            forma: 'Redonda o ligeramente ovalada',
            tamaño: 'Mediano (5-8 cm)',
            textura: 'Suave y cremosa'
        },
        usosCulinarios: [
            'Sopas',
            'Guisos',
            'Papa rellena',
            'Causa',
            'Platos horneados'
        ],
        valorNutricional: {
            carbohidratos: 19.5,
            proteinas: 2.2,
            vitaminas: ['Vitamina C', 'Vitamina B6', 'Potasio', 'Magnesio']
        },
        temporadaCultivo: {
            siembra: 'Octubre - Diciembre',
            cosecha: 'Abril - Junio'
        },
        activa: true
    },
    {
        nombreCientifico: 'Solanum tuberosum var. unica',
        nombreComun: 'unica',
        descripcion: 'Variedad autóctona de alto valor genético, con pulpa firme y sabor distintivo. Se usa en platos tradicionales de la región por su carácter único.',
        origen: {
            pais: 'Perú',
            region: 'Junín, Huánuco, Pasco',
            altitud: '2800-3800 msnm'
        },
        caracteristicas: {
            color: 'Piel rojiza o rosada',
            forma: 'Redonda y compacta',
            tamaño: 'Pequeño (3-5 cm)',
            textura: 'Firme y sabrosa'
        },
        usosCulinarios: [
            'Papa sancochada',
            'Ensaladas',
            'Anticuchos de papa',
            'Guarniciones',
            'Platos nativos'
        ],
        valorNutricional: {
            carbohidratos: 19.8,
            proteinas: 2.1,
            vitaminas: ['Vitamina C', 'Antocianinas', 'Potasio', 'Magnesio']
        },
        temporadaCultivo: {
            siembra: 'Octubre - Diciembre',
            cosecha: 'Abril - Junio'
        },
        activa: true
    }
];

async function inicializarVariedades() {
    try {
        console.log('🌱 Iniciando inserción de variedades de papa...');
        
        // Conectar a la base de datos
        await connectDB();
        
        // Verificar si ya existen variedades
        const variedadesExistentes = await VariedadPapa.countDocuments();
        
        if (variedadesExistentes > 0) {
            console.log(`⚠️  Ya existen ${variedadesExistentes} variedades en la base de datos.`);
            console.log('🔄 Actualizando variedades existentes...');
            
            // Actualizar o crear cada variedad
            for (const variedad of variedadesIniciales) {
                await VariedadPapa.findOneAndUpdate(
                    { nombreComun: variedad.nombreComun },
                    variedad,
                    { upsert: true, new: true }
                );
                console.log(`✅ Variedad "${variedad.nombreComun}" actualizada/creada`);
            }
        } else {
            // Insertar nuevas variedades
            await VariedadPapa.insertMany(variedadesIniciales);
            console.log('✅ Variedades insertadas exitosamente');
        }
        
        // Mostrar resumen
        const totalVariedades = await VariedadPapa.countDocuments({ activa: true });
        const nombreVariedades = await VariedadPapa.find({ activa: true }, 'nombreComun');
        
        console.log('\n📊 Resumen de variedades disponibles:');
        console.log(`📍 Total de variedades activas: ${totalVariedades}`);
        console.log('🥔 Variedades disponibles:');
        nombreVariedades.forEach((v, index) => {
            console.log(`   ${index + 1}. ${v.nombreComun}`);
        });
        
        console.log('\n🎉 Inicialización completada exitosamente!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error durante la inicialización:', error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    inicializarVariedades();
}

module.exports = { inicializarVariedades, variedadesIniciales };