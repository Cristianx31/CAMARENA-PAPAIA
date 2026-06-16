const dns = require('dns');
const dnsPromises = require('dns').promises;

async function testResolve(clusterHost) {
  console.log(`Probando resolución SRV para: ${clusterHost}`);

  const srvName = `_mongodb._tcp.${clusterHost}`;

  try {
    console.log('\n1) Intentando resolver SRV con servidores DNS públicos (8.8.8.8, 1.1.1.1)');
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('   Servidores DNS configurados: ', dns.getServers());
    } catch (e) {
      console.warn('   No se pudo asignar servidores DNS personalizados:', e.message);
    }

    try {
      const records = await dnsPromises.resolveSrv(srvName);
      console.log('   Registros SRV (usando DNS públicos):', records);
    } catch (err) {
      console.error('   Error al resolver SRV con DNS públicos:', err.message);
    }

    console.log('\n2) Ahora intentando resolver SRV con el resolver del sistema (predeterminado)');
    try {
      dns.setServers([]); // restablecer al resolver del sistema (no siempre efectivo en Windows)
    } catch (e) {}

    try {
      const recordsSystem = await dnsPromises.resolveSrv(srvName);
      console.log('   Registros SRV (resolver del sistema):', recordsSystem);
    } catch (err) {
      console.error('   Error al resolver SRV con resolver del sistema:', err.message);
    }

  } catch (e) {
    console.error('Error inesperado:', e.message);
  }
}

const host = process.argv[2] || 'cluster0.k2hjaao.mongodb.net';
testResolve(host).then(()=>process.exit(0));
