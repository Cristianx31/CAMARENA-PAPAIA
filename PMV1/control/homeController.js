// Controlador para la página de inicio
class HomeController {
    
    // Mostrar página de inicio
    static async mostrarInicio(req, res) {
        try {
            res.render('index', {
                titulo: 'PAPAIA - Clasificación Inteligente de Variedades de Papa',
                usuario: req.session.usuario || null
            });
        } catch (error) {
            console.error('Error mostrando página de inicio:', error);
            res.status(500).render('error', {
                mensaje: 'Error interno del servidor',
                codigo: 500
            });
        }
    }
}

module.exports = HomeController;