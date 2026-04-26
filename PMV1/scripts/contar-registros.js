/**
 * Script para contar clasificaciones antes y después de una prueba manual
 */

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

const Clasificacion = require('../modelo/Clasificacion');
const Imagen = require('../modelo/Imagen');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/PapasDB';

async function contarRegistros() {
    try {
        await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        
        const clasificaciones = await Clasificacion.countDocuments();
        const imagenes = await Imagen.countDocuments();
        
        console.log(`📊 Estado actual de la base de datos:`);
        console.log(`   📋 Clasificaciones: ${clasificaciones}`);
        console.log(`   🖼️ Imágenes: ${imagenes}`);
        console.log(`   📅 Fecha: ${new Date().toLocaleString()}`);
        
        // Mostrar las últimas clasificaciones
        const ultimasClasificaciones = await Clasificacion.find()
            .populate('idVariedad', 'nombreComun')
            .sort({ fechaClasificacion: -1 })
            .limit(3);
        
        if (ultimasClasificaciones.length > 0) {
            console.log(`\n🔍 Últimas 3 clasificaciones:`);
            ultimasClasificaciones.forEach((c, i) => {
                const fecha = new Date(c.fechaClasificacion).toLocaleString();
                console.log(`   ${i + 1}. ${c.idVariedad.nombreComun} - ${Math.round(c.confianza * 100)}% - ${c.condicion} (${fecha})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

console.log('🔢 Contador de Registros - MongoDB Atlas');
console.log('=====================================');
contarRegistros();