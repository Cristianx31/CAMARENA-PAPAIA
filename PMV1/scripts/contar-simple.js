/**
 * Contador simple de registros
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/PapasDB';

async function contar() {
    try {
        await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        
        const db = mongoose.connection.db;
        
        const clasificaciones = await db.collection('clasificaciones').countDocuments();
        const imagenes = await db.collection('imagenes').countDocuments();
        
        console.log(`📊 Estado de la base de datos (${new Date().toLocaleString()}):`);
        console.log(`   📋 Clasificaciones: ${clasificaciones}`);
        console.log(`   🖼️ Imágenes: ${imagenes}`);
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

contar();