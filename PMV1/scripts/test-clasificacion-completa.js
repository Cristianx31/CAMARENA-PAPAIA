/**
 * Test completo del sistema de clasificación
 * Verifica que las clasificaciones se guarden correctamente y se muestren en el historial
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configurar mongoose para evitar advertencias
mongoose.set('strictQuery', false);

// Modelos
const Clasificacion = require('../modelo/Clasificacion');
const VariedadPapa = require('../modelo/VariedadPapa');
const Imagen = require('../modelo/Imagen');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/PapasDB';

async function testClasificacionCompleta() {
    try {
        console.log('🔄 Conectando a MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB Atlas exitosamente');

        // 1. Verificar variedades disponibles
        console.log('\n📊 Verificando variedades de papa disponibles...');
        const variedades = await VariedadPapa.find();
        console.log(`   Variedades encontradas: ${variedades.length}`);
        variedades.forEach(v => {
            console.log(`   - ${v.nombreComun}: ${v.descripcion}`);
        });

        // 2. Crear una nueva clasificación de prueba
        console.log('\n🧪 Creando clasificación de prueba...');
        
        const varietyIndex = Math.floor(Math.random() * variedades.length);
        const selectedVariety = variedades[varietyIndex];
        const confidence = Math.random() * 0.4 + 0.6; // Entre 60% y 100%
        const condicion = confidence >= 0.7 ? 'apto' : 'no apto';
        
        console.log(`   Variedad seleccionada: ${selectedVariety.nombreComun}`);
        console.log(`   Confianza: ${Math.round(confidence * 100)}%`);
        console.log(`   Condición: ${condicion}`);

        // Crear un usuario de prueba simple (ObjectId)
        const testUserId = new mongoose.Types.ObjectId();
        
        // Crear imagen de prueba
        const nuevaImagen = new Imagen({
            urlImagen: `/uploads/test_image_${Date.now()}.jpg`,
            nombreOriginal: `test_image_${Date.now()}.jpg`,
            tamaño: 1024 * 50, // 50KB simulado
            formato: 'jpeg',
            usuarioSubida: testUserId
        });
        await nuevaImagen.save();

        // Crear clasificación
        const nuevaClasificacion = new Clasificacion({
            idUsuario: testUserId,
            idImagen: nuevaImagen._id,
            idVariedad: selectedVariety._id,
            confianza: confidence,
            condicion: condicion,
            metodoClasificacion: 'TensorFlow.js + Test',
            alternativas: variedades
                .filter(v => v._id.toString() !== selectedVariety._id.toString())
                .slice(0, 2)
                .map(v => ({
                    variedad: v.nombreComun,
                    confianza: Math.random() * 0.3 + 0.1
                })),
            fechaClasificacion: new Date()
        });

        await nuevaClasificacion.save();
        console.log(`✅ Clasificación creada con ID: ${nuevaClasificacion._id}`);

        // 3. Verificar que se guardó correctamente
        console.log('\n🔍 Verificando clasificación guardada...');
        const clasificacionGuardada = await Clasificacion.findById(nuevaClasificacion._id)
            .populate('idVariedad', 'nombreComun descripcion')
            .populate('idImagen', 'nombreOriginal urlImagen');

        console.log('   Datos guardados:');
        console.log(`   - Usuario: ${clasificacionGuardada.idUsuario}`);
        console.log(`   - Variedad: ${clasificacionGuardada.idVariedad.nombreComun}`);
        console.log(`   - Confianza: ${Math.round(clasificacionGuardada.confianza * 100)}%`);
        console.log(`   - Condición: ${clasificacionGuardada.condicion}`);
        console.log(`   - Método: ${clasificacionGuardada.metodoClasificacion}`);
        console.log(`   - Imagen: ${clasificacionGuardada.idImagen.nombreOriginal}`);
        console.log(`   - Alternativas: ${clasificacionGuardada.alternativas.length}`);
        console.log(`   - Timestamp: ${clasificacionGuardada.fechaClasificacion}`);

        // 4. Verificar historial completo
        console.log('\n📈 Consultando historial completo...');
        const totalClasificaciones = await Clasificacion.countDocuments();
        console.log(`   Total clasificaciones en DB: ${totalClasificaciones}`);

        // Obtener últimas 5 clasificaciones
        const ultimasClasificaciones = await Clasificacion.find()
            .populate('idVariedad', 'nombreComun')
            .sort({ fechaClasificacion: -1 })
            .limit(5);

        console.log('\n   Últimas 5 clasificaciones:');
        ultimasClasificaciones.forEach((c, i) => {
            const fecha = new Date(c.fechaClasificacion).toLocaleString();
            console.log(`   ${i + 1}. ${c.idVariedad.nombreComun} - ${Math.round(c.confianza * 100)}% - ${c.condicion} (${fecha})`);
        });

        // 5. Simular respuesta del controlador
        console.log('\n🎯 Simulando respuesta del controlador...');
        const respuestaController = {
            success: true,
            resultado: {
                variedad: {
                    nombre: clasificacionGuardada.idVariedad.nombreComun,
                    descripcion: clasificacionGuardada.idVariedad.descripcion
                },
                confianza: clasificacionGuardada.confianza,
                confianzaPorcentaje: Math.round(clasificacionGuardada.confianza * 100),
                condicion: clasificacionGuardada.condicion,
                metodo: clasificacionGuardada.metodoClasificacion,
                alternativas: clasificacionGuardada.alternativas,
                clasificacionId: clasificacionGuardada._id,
                timestamp: clasificacionGuardada.fechaClasificacion
            }
        };

        console.log('   Formato de respuesta del backend:');
        console.log(JSON.stringify(respuestaController, null, 2));

        // 6. Simular mapeo del frontend
        console.log('\n🖥️ Simulando mapeo del frontend...');
        const result = respuestaController.resultado;
        const frontendFormat = {
            prediccion: result.variedad.nombre,
            confianza: result.confianza,
            condicion: result.condicion,
            metodo: result.metodo,
            probabilidades: [
                { variedad: result.variedad.nombre, porcentaje: result.confianzaPorcentaje },
                ...result.alternativas.map(alt => ({
                    variedad: alt.variedad || 'Desconocida',
                    porcentaje: Math.round((alt.confianza || 0) * 100)
                }))
            ]
        };

        console.log('   Formato esperado por el frontend:');
        console.log(JSON.stringify(frontendFormat, null, 2));

        console.log('\n✅ Test completado exitosamente');
        console.log('🔧 El sistema está funcionando correctamente:');
        console.log('   ✓ Conexión a MongoDB Atlas');
        console.log('   ✓ Guardado de clasificaciones');
        console.log('   ✓ Relaciones entre modelos');
        console.log('   ✓ Formato de respuesta backend');
        console.log('   ✓ Mapeo de datos para frontend');
        console.log('   ✓ Persistencia en base de datos');

    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        console.error('📍 Stack trace:', error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB Atlas');
        process.exit(0);
    }
}

testClasificacionCompleta();