/**
 * Script para monitorear la base de datos en tiempo real
 * Ejecuta este script mientras pruebas la interfaz web
 */

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

const Clasificacion = require('../modelo/Clasificacion');
const Imagen = require('../modelo/Imagen');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/PapasDB';

let ultimoConteoClasificaciones = 0;
let ultimoConteoImagenes = 0;

async function monitorearDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('🔍 Monitor de MongoDB Atlas iniciado...');
        console.log('📱 Ahora usa la interfaz web para hacer una clasificación');
        console.log('👀 Este script mostrará los cambios en tiempo real\n');

        // Obtener conteos iniciales
        ultimoConteoClasificaciones = await Clasificacion.countDocuments();
        ultimoConteoImagenes = await Imagen.countDocuments();
        
        console.log(`📊 Estado inicial:`);
        console.log(`   Clasificaciones: ${ultimoConteoClasificaciones}`);
        console.log(`   Imágenes: ${ultimoConteoImagenes}\n`);

        // Monitorear cada 2 segundos
        setInterval(async () => {
            try {
                const conteoClasificaciones = await Clasificacion.countDocuments();
                const conteoImagenes = await Imagen.countDocuments();

                if (conteoClasificaciones > ultimoConteoClasificaciones) {
                    console.log('🆕 NUEVA CLASIFICACIÓN DETECTADA!');
                    
                    // Obtener la clasificación más reciente
                    const ultimaClasificacion = await Clasificacion.findOne()
                        .populate('idVariedad', 'nombreComun')
                        .populate('idImagen', 'nombreOriginal')
                        .sort({ fechaClasificacion: -1 });

                    if (ultimaClasificacion) {
                        console.log(`   ✅ ID: ${ultimaClasificacion._id}`);
                        console.log(`   🥔 Variedad: ${ultimaClasificacion.idVariedad.nombreComun}`);
                        console.log(`   📊 Confianza: ${Math.round(ultimaClasificacion.confianza * 100)}%`);
                        console.log(`   ⚡ Condición: ${ultimaClasificacion.condicion}`);
                        console.log(`   🖼️ Imagen: ${ultimaClasificacion.idImagen.nombreOriginal}`);
                        console.log(`   📅 Fecha: ${new Date(ultimaClasificacion.fechaClasificacion).toLocaleString()}\n`);
                    }
                    
                    ultimoConteoClasificaciones = conteoClasificaciones;
                }

                if (conteoImagenes > ultimoConteoImagenes) {
                    console.log('🖼️ NUEVA IMAGEN DETECTADA!');
                    
                    // Obtener la imagen más reciente
                    const ultimaImagen = await Imagen.findOne()
                        .sort({ fechaSubida: -1 });

                    if (ultimaImagen) {
                        console.log(`   ✅ ID: ${ultimaImagen._id}`);
                        console.log(`   📝 Nombre: ${ultimaImagen.nombreOriginal}`);
                        console.log(`   💾 Tamaño: ${ultimaImagen.tamaño} bytes`);
                        console.log(`   🎨 Formato: ${ultimaImagen.formato}`);
                        console.log(`   📅 Fecha: ${new Date(ultimaImagen.fechaSubida).toLocaleString()}\n`);
                    }
                    
                    ultimoConteoImagenes = conteoImagenes;
                }

                // Mostrar estado actual cada 10 verificaciones (20 segundos)
                if (Date.now() % 20000 < 2000) {
                    process.stdout.write(`📊 Total actual: ${conteoClasificaciones} clasificaciones, ${conteoImagenes} imágenes\r`);
                }

            } catch (error) {
                console.error('❌ Error monitoreando:', error.message);
            }
        }, 2000);

    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
}

// Manejar ctrl+c para cerrar limpiamente
process.on('SIGINT', async () => {
    console.log('\n\n🔌 Cerrando monitor...');
    await mongoose.disconnect();
    console.log('👋 Monitor cerrado');
    process.exit(0);
});

console.log('🎯 Monitor de Base de Datos - Sistema PapaClick');
console.log('=====================================');
console.log('📋 Instrucciones:');
console.log('1. Deja este script corriendo');
console.log('2. Ve a http://localhost:3000 en tu navegador');
console.log('3. Haz login y va a "Clasificar"');
console.log('4. Sube una imagen o toma una foto');
console.log('5. Observa este monitor para ver si se guardan los datos');
console.log('6. Presiona Ctrl+C para detener el monitor\n');

monitorearDB();