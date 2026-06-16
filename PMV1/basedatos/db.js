// Configuración y conexión a MongoDB Atlas
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Validar URI de MongoDB Atlas
        let mongoURI = process.env.MONGODB_URI;
        let connectionType = 'Atlas';
        
        // Verificar si es una URI válida de Atlas
        if (!mongoURI || 
            mongoURI.includes('username:password') || 
            mongoURI.includes('xxxxx') ||
            mongoURI.includes('TU_PASSWORD') ||
            mongoURI.includes('tu_password')) {
            console.log('⚠️  URI de MongoDB Atlas no configurada o contiene placeholder');
            console.log('🔧 Por favor configura la contraseña real en el archivo .env');
            console.log('🔄 Usando MongoDB Local como alternativa...');
            mongoURI = process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/PapasDB';
            connectionType = 'Local';
        }
        
        console.log(`🔗 Conectando a MongoDB ${connectionType}...`);
        console.log(`📍 URI: ${mongoURI.replace(/\/\/.*:.*@/, '//***:***@')}`); // Ocultar credenciales
        
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000, // 10 segundos para Atlas
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            retryWrites: true,
        });

        console.log(`✅ MongoDB ${connectionType} conectado exitosamente!`);
        console.log(`🏠 Host: ${conn.connection.host}`);
        console.log(`📊 Base de datos: ${conn.connection.name}`);
        console.log(`🔌 Estado: ${conn.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
        
        return conn;
        
    } catch (error) {
        console.error('❌ Error conectando a MongoDB Atlas:', error.message);

        // Si el error parece venir de una consulta SRV (DNS), intentar una conexión "no-SRV"
        // resolviendo los registros SRV y construyendo una URI mongodb://host1:27017,host2:27017
        try {
            const dnsPromises = require('dns').promises;
            const dns = require('dns');

            if (process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith('mongodb+srv://') && /querySrv|ECONNREFUSED/i.test(error.message)) {
                console.log('🔁 Detectado fallo SRV. Intentando resolver SRV usando DNS públicos y construir URI sin +srv...');

                // Intentar forzar resolución SRV usando servidores públicos (Google / Cloudflare)
                try {
                    dns.setServers(['8.8.8.8', '1.1.1.1']);
                    console.log('🔎 Usando servidores DNS: 8.8.8.8, 1.1.1.1 para resolveSrv');
                } catch (e) {
                    console.warn('⚠️ No se pudo asignar servidores DNS personalizados, se usará el resolver del sistema');
                }

                // Extraer credenciales y opciones desde la URI original
                // Formato esperado: mongodb+srv://user:pass@cluster0.xyz.mongodb.net/DBNAME?options
                const uri = process.env.MONGODB_URI;
                const match = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?$/);

                if (!match) {
                    throw new Error('No se pudo parsear MONGODB_URI para fallback no-SRV');
                }

                const user = encodeURIComponent(match[1]);
                const pass = encodeURIComponent(match[2]);
                const clusterHost = match[3];
                const dbName = match[4] || 'PapasDB';
                const query = match[5] || '?retryWrites=true&w=majority';

                // Resolver registros SRV (usando los servidores DNS configurados arriba)
                const srvName = `_mongodb._tcp.${clusterHost}`;
                let records;
                try {
                    records = await dnsPromises.resolveSrv(srvName);
                } catch (dnsErr) {
                    console.error('🔴 Error de DNS al resolver registros SRV:', dnsErr.message);
                    throw dnsErr; // propagar para manejar abajo
                }

                const hosts = records.map(r => `${r.name}:${r.port}`).join(',');

                const noSrvURI = `mongodb://${user}:${pass}@${hosts}/${dbName}${query}&ssl=true&authSource=admin`;
                console.log(`🔧 URI no-SRV construida (credenciales ocultas): ${noSrvURI.replace(/\/\/.*:.*@/, '//***:***@')}`);

                try {
                    const conn = await mongoose.connect(noSrvURI, {
                        serverSelectionTimeoutMS: 10000,
                        socketTimeoutMS: 45000,
                        maxPoolSize: 10,
                        retryWrites: true,
                    });

                    console.log('✅ Conectado a MongoDB Atlas (no-SRV) exitosamente!');
                    console.log(`🏠 Host: ${conn.connection.host}`);
                    console.log(`📊 Base de datos: ${conn.connection.name}`);
                    return conn;
                } catch (noSrvError) {
                    console.error('❌ Error conectando usando URI no-SRV:', noSrvError.message);
                }
            }
        } catch (fallbackError) {
            console.error('⚠️ Error durante intento de fallback no-SRV:', fallbackError.message);
            console.log('➡️ Recomendación: copia la cadena "Standard connection string (without +srv)" desde Atlas y pégala en MONGODB_URI en .env.');
        }

        // Intentar conexión local como fallback solo si no estaba ya usando local
        if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('mongodb+srv://')) {
            console.log('🔄 Intentando conexión local de respaldo...');

            try {
                const localURI = process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/PapasDB';
                const conn = await mongoose.connect(localURI, {
                    serverSelectionTimeoutMS: 3000,
                });

                console.log(`✅ Conectado a MongoDB Local: ${conn.connection.host}`);
                console.log(`📊 Base de datos: ${conn.connection.name}`);
                return conn;

            } catch (fallbackError) {
                console.error('❌ Error en conexión local de respaldo:', fallbackError.message);
            }
        }

        // Mostrar guía de configuración
        console.log('\n� GUÍA DE CONFIGURACIÓN:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1️⃣  Para MongoDB Atlas:');
        console.log('   • Ve a https://cloud.mongodb.com');
        console.log('   • Crea un cluster (gratis)');
        console.log('   • Copia la cadena de conexión (elige la opción "Standard connection string (without +srv)")');
        console.log('   • Actualiza MONGODB_URI en .env con esa cadena');
        console.log('');
        console.log('2️⃣  Para MongoDB Local:');
        console.log('   • Instala: https://www.mongodb.com/try/download/community');
        console.log('   • O usa Docker: docker run -d -p 27017:27017 --name mongodb mongo');
        console.log('');
        console.log('3️⃣  Formato de URI Atlas (no-SRV):');
        console.log('   mongodb://usuario:password@host1:27017,host2:27017,host3:27017/tuDB?replicaSet=...&authSource=admin&ssl=true');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Continuar sin BD para permitir desarrollo del frontend
        console.log('⚠️  Continuando sin base de datos - Solo funcionalidad frontend disponible');
        return null;
    }
};

// Manejo de eventos de conexión
mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose conectado exitosamente');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 Error de conexión MongoDB:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 Mongoose desconectado de MongoDB');
});

// Cerrar conexión cuando la aplicación termine
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Conexión MongoDB cerrada por terminación de aplicación');
    process.exit(0);
});

module.exports = connectDB;