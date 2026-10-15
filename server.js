const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname)));

const ARCHIVO_USUARIOS = 'usuarios.json';
if (!fs.existsSync(ARCHIVO_USUARIOS)) {
    fs.writeFileSync(ARCHIVO_USUARIOS, JSON.stringify([]));
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/auth/registro', (req, res) => {
    try {
        const { nombre, apellidos, email, password } = req.body;
        if (!email || !password || !nombre) {
            return res.status(400).json({ exito: false, mensaje: "Completa todos los campos." });
        }
        const usuarios = JSON.parse(fs.readFileSync(ARCHIVO_USUARIOS, 'utf-8'));
        if (usuarios.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return res.status(400).json({ exito: false, mensaje: "Este correo ya existe." });
        }
        const nuevoUsuario = { id: 'USR-' + Date.now(), nombre, apellidos, email: email.toLowerCase(), password };
        usuarios.push(nuevoUsuario);
        fs.writeFileSync(ARCHIVO_USUARIOS, JSON.stringify(usuarios, null, 2));
        res.json({ exito: true, usuario: { nombre, email } });
    } catch (err) {
        res.status(500).json({ exito: false, mensaje: "Error en servidor." });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        const usuarios = JSON.parse(fs.readFileSync(ARCHIVO_USUARIOS, 'utf-8'));
        const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!usuario) {
            return res.status(401).json({ exito: false, mensaje: "Credenciales incorrectas." });
        }
        res.json({ exito: true, usuario: { nombre: usuario.nombre, email: usuario.email } });
    } catch (err) {
        res.status(500).json({ exito: false, mensaje: "Error en servidor." });
    }
});

function seleccionarDestinoDetallado(peticion) {
    const texto = (peticion || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let opciones = [];

    if (texto.includes('sudamerica') || texto.includes('colombia') || texto.includes('argentina')) {
        opciones = [{
            destino: "Cartagena de Indias, Colombia",
            vueloNombre: "Avianca (Salida BIO 08:30h - 1 escala)",
            hotelNombre: "Hotel Charleston Santa Teresa (5 Stars)",
            actividadesTexto: "Tour por la Ciudad Amurallada, Islas del Rosario y cata de café.",
            pistas: ["Destino vibrante con arquitectura colonial y playas caribeñas.", "Gran patrimonio cultural e historia."],
            equipaje: "Ropa muy ligera, traje de baño y crema solar.",
            costeVueloBase: 320, costeHotelBase: 450
        }];
    } else if (texto.includes('frio') || texto.includes('nieve') || texto.includes('suiza') || texto.includes('alpes')) {
        opciones = [{
            destino: "Ginebra & Alpes Suizos, Suiza",
            vueloNombre: "Swiss Air (Salida Directa BIO 07:15h)",
            hotelNombre: "Alpine Lodge & Spa Resort",
            actividadesTexto: "Pase de esquí / raquetas de nieve y acceso a termas.",
            pistas: ["Paisajes alpinos espectaculares y lagos cristalinos a pocas horas.", "Gastronomía reconfortante de montaña."],
            equipaje: "Ropa térmica de abrigo, chaqueta impermeable y botas.",
            costeVueloBase: 130, costeHotelBase: 220
        }];
    } else {
        opciones = [{
            destino: "Roma, Italia",
            vueloNombre: "Vueling / Iberia (Salida Directa BIO 09:40h - 2h 15m)",
            hotelNombre: "Hotel Artemide (4 Estrellas Superior)",
            actividadesTexto: "Entradas preferenciales al Coliseo, Vaticano y tour gastronómico por Trastevere.",
            pistas: ["Historia viva, arte y una gastronomía mundialmente famosa.", "Monumentos icónicos e historia antigua."],
            equipaje: "Calzado muy cómodo para caminar y ropa casual.",
            costeVueloBase: 110, costeHotelBase: 320
        }];
    }

    return opciones[0];
}

function calcularDesgloseFinanciero(presupuestoUnitario, pasajeros, vueloBase, hotelBase) {
    const totalPers = presupuestoUnitario || 450;
    const totalPax = pasajeros || 1;

    let costeVuelo = Math.min(vueloBase || 110, Math.round(totalPers * 0.30));
    let costeHotel = Math.min(hotelBase || 320, Math.round(totalPers * 0.40));
    let restante = totalPers - (costeVuelo + costeHotel);

    let actividades = Math.max(30, Math.round(restante * 0.45));
    let comida = Math.max(30, Math.round(restante * 0.35));
    let seguro = Math.max(15, totalPers - (costeVuelo + costeHotel + actividades + comida));

    return {
        vuelo: (costeVuelo * totalPax) + '€',
        hotel: (costeHotel * totalPax) + '€',
        actividades: (actividades * totalPax) + '€',
        comida: (comida * totalPax) + '€',
        seguro: (seguro * totalPax) + '€',
        total: (totalPers * totalPax) + '€'
    };
}

app.post('/api/viaje', async (req, res) => {
    const { tipo, peticion, presupuesto, pasajeros, fechaSalida, fechaRegreso } = req.body;
    const numPasajeros = parseInt(pasajeros || 1, 10);
    const presupuestoNum = parseInt((presupuesto || '450').toString().replace(/\D/g, ''), 10) || 450;
    const presupuestoTotal = presupuestoNum * numPasajeros;

    const resultado = seleccionarDestinoDetallado(peticion);

    return res.json({
        exito: true,
        tipoViaje: tipo || "sorpresa",
        titulo: tipo === 'medida' ? "🗺️ Propuesta Exclusiva a Medida" : "✈️ Destino Secreto Asignado",
        destinoAsignado: tipo === 'medida' ? resultado.destino : "--------------- (Destino Secreto)",
        destinoRealInterno: resultado.destino,
        vueloInfo: resultado.vueloNombre,
        hotelInfo: resultado.hotelNombre,
        actividadesInfo: resultado.actividadesTexto,
        tiempoVueloEst: "Aproximadamente 2h - 3h de vuelo",
        pistas: resultado.pistas,
        equipajeRecomendado: resultado.equipaje,
        precioEstimado: `${presupuestoNum}€ por persona (${presupuestoTotal}€ total para ${numPasajeros} pasajero(s))`,
        precioUnitario: presupuestoNum,
        pasajeros: numPasajeros,
        fechaSalida: fechaSalida || "Por determinar",
        fechaRegreso: fechaRegreso || "Por determinar",
        origenSalida: "Donostia-San Sebastián / Bilbao (BIO)",
        costeVueloBase: resultado.costeVueloBase,
        costeHotelBase: resultado.costeHotelBase
    });
});

app.post('/api/pagar', (req, res) => {
    try {
        const { titular, tarjeta, expira, cvc, importe, destino, peticion, tipoViaje, pasajeros, fechaSalida, fechaRegreso, costeVueloBase, costeHotelBase, vueloInfo, hotelInfo } = req.body;
        const codigoReserva = 'BT-' + Math.floor(100000 + Math.random() * 900000);
        const fechaRegistro = new Date().toLocaleString('es-ES');

        const numPasajeros = parseInt(pasajeros || 1, 10);
        const matchImporte = (importe || '450').toString().match(/(\d+)/);
        const presupuestoUnitario = matchImporte ? parseInt(matchImporte[1], 10) : 450;

        const desglose = calcularDesgloseFinanciero(presupuestoUnitario, numPasajeros, costeVueloBase, costeHotelBase);

        const csvDesglose = tipoViaje === 'sorpresa' ? 'viajes_sorpresa_desglose.csv' : 'viajes_medida_desglose.csv';
        if (!fs.existsSync(csvDesglose)) {
            fs.writeFileSync(csvDesglose, `"CodigoReserva","Titular","Pasajeros","Destino","Hotel_Nombre","Vuelo_Avion","Hotel_Alojamiento","Actividades","Comida","Seguro_Traslados","Total"\n`);
        }
        fs.appendFileSync(csvDesglose, `"${codigoReserva}","${titular}","${numPasajeros}","${destino}","${hotelInfo || ''}","${desglose.vuelo}","${desglose.hotel}","${desglose.actividades}","${desglose.comida}","${desglose.seguro}","${desglose.total}"\n`);

        console.log(`✅ Pago procesado y reserva registrada: ${codigoReserva}`);
        res.json({ exito: true, codigoReserva });
    } catch (err) {
        res.status(500).json({ exito: false, mensaje: err.message });
    }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => console.log(`🔥 Servidor BlindTravel listo en puerto ${PUERTO}`));