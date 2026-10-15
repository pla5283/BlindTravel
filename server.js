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
            return res.status(400).json({ exito: false, mensaje: "Completa todos los campos obligatorios." });
        }
        const usuarios = JSON.parse(fs.readFileSync(ARCHIVO_USUARIOS, 'utf-8'));
        if (usuarios.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return res.status(400).json({ exito: false, mensaje: "Este correo ya está registrado." });
        }
        const nuevoUsuario = { id: 'USR-' + Date.now(), nombre, apellidos, email: email.toLowerCase(), password, fechaRegistro: new Date().toISOString() };
        usuarios.push(nuevoUsuario);
        fs.writeFileSync(ARCHIVO_USUARIOS, JSON.stringify(usuarios, null, 2));
        res.json({ exito: true, mensaje: "Cuenta creada exitosamente.", usuario: { nombre, email } });
    } catch (err) {
        res.status(500).json({ exito: false, mensaje: "Error al registrar usuario." });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        const usuarios = JSON.parse(fs.readFileSync(ARCHIVO_USUARIOS, 'utf-8'));
        const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!usuario) {
            return res.status(401).json({ exito: false, mensaje: "Credenciales incorrectas o usuario no registrado." });
        }
        res.json({ exito: true, mensaje: "Inicio de sesión correcto.", usuario: { nombre: usuario.nombre, email: usuario.email } });
    } catch (err) {
        res.status(500).json({ exito: false, mensaje: "Error en el servidor de autenticación." });
    }
});

function seleccionarDestinoDetallado(peticion, presupuesto) {
    const texto = (peticion || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let opciones = [];

    if (texto.includes('sudamerica') || texto.includes('colombia') || texto.includes('argentina') || texto.includes('peru')) {
        opciones = [
            {
                destino: "Cartagena de Indias, Colombia",
                vueloNombre: "Iberia / Avianca (Salida EUS/BIO 08:30h - 1 escala)",
                hotelNombre: "Hotel Charleston Santa Teresa (5 Estrellas - Ciudad Amurallada)",
                actividadesTexto: "Tour histórico guiado, excursión en barco a Islas del Rosario y cata de café.",
                pistas: ["Destino vibrante en Sudamérica con arquitectura colonial.", "Playas del Caribe y excelente gastronomía tropical."],
                equipaje: "Ropa ligera, protector solar y bañador.",
                costeVueloBase: 320, costeHotelBase: 450
            }
        ];
    } else if (texto.includes('caribe') || texto.includes('mexico') || texto.includes('playa') || texto.includes('sol')) {
        opciones = [
            {
                destino: "Riviera Maya, México",
                vueloNombre: "Air Europa / Aeroméxico (Salida BIO 10:00h - Directo/Escala)",
                hotelNombre: "Grand Palladium Kantenah Resort & Spa (Todo Incluido)",
                actividadesTexto: "Excursión a Chichén Itzá, baño en cenotes naturales y snorkel en arrecife.",
                pistas: ["Playas turquesas del Caribe y ruinas mayas.", "Resorts todo incluido."],
                equipaje: "Traje de baño, gafas de sol y ropa fresca.",
                costeVueloBase: 300, costeHotelBase: 400
            }
        ];
    } else if (texto.includes('asia') || texto.includes('bali') || texto.includes('japon')) {
        opciones = [
            {
                destino: "Bali, Indonesia",
                vueloNombre: "Qatar Airways / Singapore Airlines (Salida BIO 15:20h)",
                hotelNombre: "Ubud Valley Boutique Villas (Piscina infinita en la selva)",
                actividadesTexto: "Excursión a templos sagrados, trekking al amanecer en Monte Batur y masaje balinés.",
                pistas: ["Templos milenarios y naturaleza exuberante.", "Villas exclusivas."],
                equipaje: "Ropa ligera, repelente de insectos y calzado cómodo.",
                costeVueloBase: 420, costeHotelBase: 380
            }
        ];
    } else if (texto.includes('frio') || texto.includes('nieve') || texto.includes('suiza') || texto.includes('alpes') || texto.includes('islandia')) {
        opciones = [
            {
                destino: "Ginebra & Alpes Suizos, Suiza",
                vueloNombre: "Vueling / Swiss Air (Salida Directa BIO 07:15h)",
                hotelNombre: "Hotel Alpine Lodge & Spa (Chamonix / Zermatt view)",
                actividadesTexto: "Forfait de esquí de 2 días / Excursión con raquetas de nieve y acceso a spa termal.",
                pistas: ["Paisajes alpinos y lagos cristalinos a 2 horas.", "Entorno ideal para la montaña."],
                equipaje: "Ropa de abrigo, chaqueta impermeable y botas.",
                costeVueloBase: 130, costeHotelBase: 220
            }
        ];
    } else {
        opciones = [
            {
                destino: "Roma, Italia",
                vueloNombre: "Iberia / Vueling (Salida Directa BIO 09:40h - 2h 15m)",
                hotelNombre: "Hotel Artemide (Zona Via Nazionale - 4 Estrellas Superior)",
                actividadesTexto: "Entradas sin filas al Coliseo, Vaticano y tour gastronómico por Trastevere.",
                pistas: ["Historia viva, arte y una gastronomía incomparable.", "Monumentos icónicos."],
                equipaje: "Calzado cómodo para caminar y ropa casual.",
                costeVueloBase: 95, costeHotelBase: 190
            },
            {
                destino: "Oporto, Portugal",
                vueloNombre: "TAP Air Portugal (Salida Directa BIO 11:30h - 1h 10m)",
                hotelNombre: "Pestana Vintage Porto (A pie de orilla del río Duero)",
                actividadesTexto: "Crucero por los 6 puentes del Duero, cata de vino de Oporto en bodega histórica.",
                pistas: ["Ciudad histórica frente al Atlántico y bodegas centenarias.", "Vistas al río."],
                equipaje: "Ropa cómoda y chaqueta ligera.",
                costeVueloBase: 70, costeHotelBase: 160
            }
        ];
    }

    const seleccionado = opciones[Math.floor(Math.random() * opciones.length)];
    return seleccionado;
}

function calcularDesgloseFinanciero(presupuestoUnitario, pasajeros, vueloBase, hotelBase) {
    const totalPers = presupuestoUnitario || 450;
    const totalPax = pasajeros || 1;

    let costeVuelo = Math.min(vueloBase || 110, Math.round(totalPers * 0.35));
    let costeHotel = Math.min(hotelBase || 190, Math.round(totalPers * 0.40));
    let restante = totalPers - (costeVuelo + costeHotel);

    let actividades = Math.max(30, Math.round(restante * 0.50));
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
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const numPasajeros = parseInt(pasajeros || 1, 10);
    const presupuestoNum = parseInt((presupuesto || '450').toString().replace(/\D/g, ''), 10) || 450;
    const presupuestoTotal = presupuestoNum * numPasajeros;

    const resultado = seleccionarDestinoDetallado(peticion, presupuestoNum);

    // Enlaces directos de búsqueda y referencia
    const urlBooking = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(resultado.destino)}`;
    const urlSkyscanner = `https://www.skyscanner.es/transport/flights/bio/`;

    return res.json({
        exito: true,
        tipoViaje: tipo || "sorpresa",
        titulo: tipo === 'medida' ? "🗺️ Propuesta Exclusiva a Medida" : "✈️ Destino Secreto Asignado",
        destinoAsignado: tipo === 'medida' ? resultado.destino : "--------------- (Destino Secreto)",
        destinoRealInterno: resultado.destino,
        vueloInfo: resultado.vueloNombre,
        hotelInfo: resultado.hotelNombre,
        actividadesInfo: resultado.actividadesTexto,
        enlaceBooking: urlBooking,
        enlaceSkyscanner: urlSkyscanner,
        tiempoVueloEst: resultado.vueloNombre,
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
        const { titular, tarjeta, importe, destino, peticion, tipoViaje, pasajeros, fechaSalida, fechaRegreso, costeVueloBase, costeHotelBase, vueloInfo, hotelInfo, actividadesInfo } = req.body;
        const codigoReserva = 'BT-' + Math.floor(100000 + Math.random() * 900000);
        const fechaRegistro = new Date().toLocaleString('es-ES');

        const peticionLimpia = (peticion || '').replace(/"/g, '""');
        const destinoLimpio = (destino || '---------------').replace(/"/g, '""');
        const numPasajeros = parseInt(pasajeros || 1, 10);
        
        const matchImporte = (importe || '450').toString().match(/(\d+)/);
        const presupuestoUnitario = matchImporte ? parseInt(matchImporte[1], 10) : 450;

        const desglose = calcularDesgloseFinanciero(presupuestoUnitario, numPasajeros, costeVueloBase, costeHotelBase);
        const tipoFinal = tipoViaje || 'sorpresa';

        // Archivos CSV detallados con información completa de Vuelo, Hotel y Actividades
        if (tipoFinal === 'sorpresa') {
            const csvReservas = 'viajes_sorpresa_reservas.csv';
            if (!fs.existsSync(csvReservas)) {
                fs.writeFileSync(csvReservas, `"CodigoReserva","Titular","Pasajeros","Destino_Oculto","Hotel_Asignado","Vuelo_Detalle","ImporteTotal","FechaSalida","FechaRegreso","Restricciones","Tarjeta","FechaRegistro"\n`);
            }
            fs.appendFileSync(csvReservas, `"${codigoReserva}","${titular}","${numPasajeros}","${destinoLimpio}","${hotelInfo || 'Hotel Verificado'}","${vueloInfo || 'Vuelo Directo'}","${desglose.total}","${fechaSalida || ''}","${fechaRegreso || ''}","${peticionLimpia}","**** **** **** ${(tarjeta || '0000').slice(-4)}","${fechaRegistro}"\n`);

            const csvDesglose = 'viajes_sorpresa_desglose.csv';
            if (!fs.existsSync(csvDesglose)) {
                fs.writeFileSync(csvDesglose, `"CodigoReserva","Titular","Pasajeros","Destino","Hotel_Nombre","Vuelo_Avion","Hotel_Alojamiento","Actividades","Comida","Seguro_Traslados","Total"\n`);
            }
            fs.appendFileSync(csvDesglose, `"${codigoReserva}","${titular}","${numPasajeros}","${destinoLimpio}","${hotelInfo || ''}","${desglose.vuelo}","${desglose.hotel}","${desglose.actividades}","${desglose.comida}","${desglose.seguro}","${desglose.total}"\n`);
        } else {
            const csvReservas = 'viajes_medida_reservas.csv';
            if (!fs.existsSync(csvReservas)) {
                fs.writeFileSync(csvReservas, `"CodigoReserva","Titular","Pasajeros","Destino_Solicitado","Hotel_Asignado","Vuelo_Detalle","ImporteTotal","FechaSalida","FechaRegreso","Peticion","Tarjeta","FechaRegistro"\n`);
            }
            fs.appendFileSync(csvReservas, `"${codigoReserva}","${titular}","${numPasajeros}","${destinoLimpio}","${hotelInfo || 'Hotel Verificado'}","${vueloInfo || 'Vuelo Directo'}","${desglose.total}","${fechaSalida || ''}","${fechaRegreso || ''}","${peticionLimpia}","**** **** **** ${(tarjeta || '0000').slice(-4)}","${fechaRegistro}"\n`);

            const csvDesglose = 'viajes_medida_desglose.csv';
            if (!fs.existsSync(csvDesglose)) {
                fs.writeFileSync(csvDesglose, `"CodigoReserva","Titular","Pasajeros","Destino","Hotel_Nombre","Vuelo_Avion","Hotel_Alojamiento","Actividades","Comida","Seguro_Traslados","Total"\n`);
            }
            fs.appendFileSync(csvDesglose, `"${codigoReserva}","${titular}","${numPasajeros}","${destinoLimpio}","${hotelInfo || ''}","${desglose.vuelo}","${desglose.hotel}","${desglose.actividades}","${desglose.comida}","${desglose.seguro}","${desglose.total}"\n`);
        }

        console.log(`✅ Reserva detallada registrada con éxito: ${codigoReserva}`);
        res.json({ exito: true, codigoReserva });
    } catch (err) {
        console.error("❌ Error en /api/pagar:", err);
        res.status(500).json({ exito: false, mensaje: err.message });
    }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
    console.log(`🔥 Servidor Empresarial BlindTravel v4.0 activo en el puerto ${PUERTO}`);
});
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