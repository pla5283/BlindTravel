const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const ARCHIVO_USUARIOS = 'usuarios.json';
if (!fs.existsSync(ARCHIVO_USUARIOS)) {
    fs.writeFileSync(ARCHIVO_USUARIOS, JSON.stringify([]));
}

app.get('/', (req, res) => {
    res.send('🚀 Servidor BlindTravel Cloud Ready (v3.4)');
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

function extraerHorasVuelo(texto) {
    const t = (texto || '').toLowerCase().replace(',', '.');
    const match = t.match(/(\d+(\.\d+)?)\s*h/i) || t.match(/m[áa]ximo\s*(\d+(\.\d+)?)/i) || t.match(/no\s*m[áa]s\s*de\s*(\d+(\.\d+)?)/i);
    return match ? parseFloat(match[1]) : null;
}

function seleccionarDestinoSorpresa(peticion, presupuesto) {
    const texto = (peticion || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let destinosDisponibles = [];

    if (texto.includes('sudamerica') || texto.includes('latinoamerica') || texto.includes('colombia') || texto.includes('argentina') || texto.includes('peru') || texto.includes('brasil')) {
        destinosDisponibles = [
            {
                destino: "Cartagena de Indias & Colombia",
                tiempoVueloEst: "~11 horas (Vuelo con escala desde Bilbao / San Sebastián)",
                pistas: ["Destino vibrante en Sudamérica con arquitectura colonial.", "Playas del Caribe y excelente gastronomía tropical."],
                equipaje: "Ropa ligera, protector solar y bañador.",
                costeVueloAprox: 300, costeHotelAprox: 400
            },
            {
                destino: "Buenos Aires & Patagonia, Argentina",
                tiempoVueloEst: "~13 horas (Vuelo internacional)",
                pistas: ["Tango, cultura e imponentes paisajes del cono sur.", "Gastronomía excepcional y contrastes únicos."],
                equipaje: "Ropa versátil y calzado cómodo.",
                costeVueloAprox: 350, costeHotelAprox: 450
            }
        ];
    } else if (texto.includes('caribe') || texto.includes('mexico') || texto.includes('playa') || texto.includes('sol') || texto.includes('punta cana')) {
        destinosDisponibles = [
            {
                destino: "Riviera Maya, México",
                tiempoVueloEst: "~10 horas",
                pistas: ["Playas turquesas del Caribe y ruinas mayas.", "Resorts todo incluido y cenotes naturales."],
                equipaje: "Traje de baño, gafas de sol y ropa fresca.",
                costeVueloAprox: 280, costeHotelAprox: 350
            },
            {
                destino: "Punta Cana, República Dominicana",
                tiempoVueloEst: "~9 horas y media",
                pistas: ["Arena blanca, cocoteros y aguas cristalinas.", "Ambiente caribeño de máxima relajación."],
                equipaje: "Ropa ligera de lino y protector solar.",
                costeVueloAprox: 290, costeHotelAprox: 380
            }
        ];
    } else if (texto.includes('asia') || texto.includes('bali') || texto.includes('japon') || texto.includes('tailandia')) {
        destinosDisponibles = [
            {
                destino: "Bali, Indonesia",
                tiempoVueloEst: "~15 horas",
                pistas: ["Templos milenarios y naturaleza exuberante.", "Villas exclusivas y cultura única en el Sudeste Asiático."],
                equipaje: "Ropa ligera, repelente de insectos y calzado cómodo.",
                costeVueloAprox: 400, costeHotelAprox: 350
            },
            {
                destino: "Tokio & Kioto, Japón",
                tiempoVueloEst: "~14 horas",
                pistas: ["Fusión futurista y tradición milenaria.", "Gastronomía de clase mundial y templos históricos."],
                equipaje: "Ropa cómoda para caminar y adaptador de enchufe.",
                costeVueloAprox: 450, costeHotelAprox: 400
            }
        ];
    } else if (texto.includes('frio') || texto.includes('nieve') || texto.includes('suiza') || texto.includes('alpes') || texto.includes('islandia')) {
        destinosDisponibles = [
            {
                destino: "Ginebra & Alpes Suizos, Suiza",
                tiempoVueloEst: "~2 horas (Vuelo directo Bilbao - Ginebra)",
                pistas: ["Paisajes alpinos y lagos cristalinos a 2 horas.", "Entorno ideal para desconectar en la montaña."],
                equipaje: "Ropa de abrigo, chaqueta impermeable y botas.",
                costeVueloAprox: 120, costeHotelAprox: 200
            },
            {
                destino: "Reykiavik, Islandia",
                tiempoVueloEst: "~4 horas y 30 minutos",
                pistas: ["Tierra de fuego y hielo con géiseres y cascadas.", "Naturaleza virgen en el norte de Europa."],
                equipaje: "Chaqueta térmica impermeable y botas de montaña.",
                costeVueloAprox: 210, costeHotelAprox: 260
            }
        ];
    } else {
        destinosDisponibles = [
            {
                destino: "Roma e Italia Antigua",
                tiempoVueloEst: "~2 horas y 30 minutos (Vuelo directo)",
                pistas: ["Historia viva, arte y una gastronomía incomparable.", "Paseos románticos y monumentos icónicos mundiales."],
                equipaje: "Calzado cómodo para caminar y ropa casual elegante.",
                costeVueloAprox: 95, costeHotelAprox: 180
            },
            {
                destino: "Oporto & Costa Norte, Portugal",
                tiempoVueloEst: "~1 hora y 15 minutos",
                pistas: ["Ciudad histórica frente al Atlántico y bodegas centenarias.", "Vistas al río Duero y excelente marisco."],
                equipaje: "Ropa cómoda y chaqueta ligera para la brisa marina.",
                costeVueloAprox: 75, costeHotelAprox: 170
            },
            {
                destino: "Santorini & Atenas, Grecia",
                tiempoVueloEst: "~3 horas y 45 minutos",
                pistas: ["Casitas blancas con cúpulas azules sobre el mar Egeo.", "Atardeceres legendarios y ruinas de la antigua Grecia."],
                equipaje: "Ropa de lino, gafas de sol y sandalias cómodas.",
                costeVueloAprox: 160, costeHotelAprox: 220
            },
            {
                destino: "Marrakech, Marruecos",
                tiempoVueloEst: "~2 horas y 15 minutos",
                pistas: ["Zocos tradicionales, riads con encanto y palacios históricos.", "Cultura exótica y clima cálido en el norte de África."],
                equipaje: "Ropa ligera de algodón y pañuelo para excursiones.",
                costeVueloAprox: 95, costeHotelAprox: 150
            }
        ];
    }

    const seleccionado = destinosDisponibles[Math.floor(Math.random() * destinosDisponibles.length)];
    return seleccionado;
}

function calcularDesgloseRealista(presupuestoTotalNum, pasajeros, costeVueloBase, costeHotelBase) {
    const totalPorPersona = presupuestoTotalNum || 450;
    const totalGlobal = totalPorPersona * (pasajeros || 1);

    let vuelo = Math.min(costeVueloBase || 110, Math.round(totalPorPersona * 0.30));
    let hotel = Math.min(costeHotelBase || 180, Math.round(totalPorPersona * 0.40));
    let restante = totalPorPersona - (vuelo + hotel);

    let actividades = Math.max(30, Math.round(restante * 0.45));
    let comida = Math.max(40, Math.round(restante * 0.35));
    let seguro = Math.max(15, totalPorPersona - (vuelo + hotel + actividades + comida));

    return { 
        vuelo: (vuelo * (pasajeros || 1)) + '€', 
        hotel: (hotel * (pasajeros || 1)) + '€', 
        actividades: (actividades * (pasajeros || 1)) + '€', 
        comida: (comida * (pasajeros || 1)) + '€', 
        seguro: (seguro * (pasajeros || 1)) + '€', 
        total: totalGlobal + '€' 
    };
}

app.post('/api/viaje', async (req, res) => {
    const { tipo, peticion, presupuesto, pasajeros, fechaSalida, fechaRegreso } = req.body;
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const numPasajeros = parseInt(pasajeros || 1, 10);
    const presupuestoNum = parseInt((presupuesto || '450').toString().replace(/\D/g, ''), 10) || 450;
    const presupuestoTotal = presupuestoNum * numPasajeros;

    if (tipo === 'sorpresa') {
        const resultado = seleccionarDestinoSorpresa(peticion, presupuestoNum);
        return res.json({
            exito: true,
            tipoViaje: "sorpresa",
            titulo: "✈️ Destino Secreto Asignado",
            destinoAsignado: "---------------",
            destinoRealInterno: resultado.destino,
            tiempoVueloEst: resultado.tiempoVueloEst,
            pistas: resultado.pistas,
            equipajeRecomendado: resultado.equipaje,
            precioEstimado: `${presupuestoNum}€ por persona (${presupuestoTotal}€ total para ${numPasajeros} pasajeros)`,
            precioUnitario: presupuestoNum,
            pasajeros: numPasajeros,
            fechaSalida: fechaSalida || "Por determinar",
            fechaRegreso: fechaRegreso || "Por determinar",
            origenSalida: "Donostia-San Sebastián / Bilbao",
            costeVueloAprox: resultado.costeVueloAprox,
            costeHotelAprox: resultado.costeHotelAprox
        });
    } else {
        let destinoDetectado = "Destino Personalizado Solicitado";
        const txt = (peticion || '').toLowerCase();
        if (txt.includes('bali')) destinoDetectado = "Bali, Indonesia";
        else if (txt.includes('japon') || txt.includes('japón')) destinoDetectado = "Tokio y Kioto, Japón";
        else if (txt.includes('roma') || txt.includes('italia')) destinoDetectado = "Roma e Italia";
        else if (txt.includes('sudamérica') || txt.includes('sudamerica') || txt.includes('colombia')) destinoDetectado = "Cartagena de Indias, Colombia";
        else if (txt.includes('portugal') || txt.includes('oporto')) destinoDetectado = "Oporto, Portugal";

        return res.json({
            exito: true,
            tipoViaje: "medida",
            titulo: "🗺️ Propuesta Exclusiva a Medida",
            destinoAsignado: destinoDetectado,
            destinoRealInterno: destinoDetectado,
            itinerario: `Itinerario a medida para ${numPasajeros} pasajero(s): "${peticion}". Salida desde Donostia / Bilbao del ${fechaSalida || ''} al ${fechaRegreso || ''}.`,
            precioEstimado: `${presupuestoNum}€ por persona (${presupuestoTotal}€ total)`,
            precioUnitario: presupuestoNum,
            pasajeros: numPasajeros,
            fechaSalida: fechaSalida || "Por determinar",
            fechaRegreso: fechaRegreso || "Por determinar",
            origenSalida: "Donostia-San Sebastián / Bilbao",
            costeVueloAprox: Math.round(presupuestoNum * 0.35),
            costeHotelAprox: Math.round(presupuestoNum * 0.40)
        });
    }
});

app.post('/api/pagar', (req, res) => {
    try {
        const { titular, tarjeta, importe, destino, peticion, tipoViaje, pasajeros, fechaSalida, fechaRegreso, costeVueloAprox, costeHotelAprox } = req.body;
        const codigoReserva = 'BT-' + Math.floor(100000 + Math.random() * 900000);
        const fechaRegistro = new Date().toLocaleString('es-ES');

        const peticionLimpia = (peticion || '').replace(/"/g, '""');
        const destinoLimpio = (destino || '---------------').replace(/"/g, '""');
        const numPasajeros = parseInt(pasajeros || 1, 10);
        
        const matchImporte = (importe || '450').toString().match(/(\d+)/);
        const presupuestoUnitario = matchImporte ? parseInt(matchImporte[1], 10) : 450;

        const desglose = calcularDesgloseRealista(presupuestoUnitario, numPasajeros, costeVueloAprox, costeHotelAprox);
        const tipoFinal = tipoViaje || 'sorpresa';

        if (tipoFinal === 'sorpresa') {
            const csvReservas = 'viajes_sorpresa_reservas.csv';
            if (!fs.existsSync(csvReservas)) {
                fs.writeFileSync(csvReservas, `"CodigoReserva","Titular","Pasajeros","Destino_Oculto","ImporteTotal","FechaSalida","FechaRegreso","Restricciones","Tarjeta","FechaRegistro"\n`);
            }
            fs.appendFileSync(csvReservas, `"${codigoReserva}","${titular}","${numPasajeros}","${destinoLimpio}","${desglose.total}","${fechaSalida || ''}","${fechaRegreso || ''}","${peticionLimpia}","**** **** **** ${(tarjeta || '0000').slice(-4)}","${fechaRegistro}"\n`);

            const csvDesglose = 'viajes_sorpresa_desglose.csv';
            if (!fs.existsSync(csvDesglose)) {
                fs.writeFileSync(csvDesglose, `"CodigoReserva","Titular","Pasajeros","Destino","Vuelo_Avion","Hotel_Alojamiento","Actividades","Comida","Seguro_Traslados","Total"\n`);
            }
            fs.appendFileSync(csvDesglose, `"${codigoReserva}","${titular}","${numPasajeros}","${destinoLimpio}","${desglose.vuelo}","${desglose.hotel}","${desglose.actividades}","${desglose.comida}","${desglose.seguro}","${desglose.total}"\n`);
        } else {
            const csvReservas = 'viajes_medida_reservas.csv';
            if (!fs.existsSync(csvReservas)) {
                fs.writeFileSync(csvReservas, `"CodigoReserva","Titular","Pasajeros","Destino_Solicitado","ImporteTotal","FechaSalida","FechaRegreso","Peticion_Detallada","Tarjeta","FechaRegistro"\n`);
            }
            fs.appendFileSync(csvReservas, `"${codigoReserva}","${titular}","${numPasajeros}","${destinoLimpio}","${desglose.total}","${fechaSalida || ''}","${fechaRegreso || ''}","${peticionLimpia}","**** **** **** ${(tarjeta || '0000').slice(-4)}","${fechaRegistro}"\n`);

            const csvDesglose = 'viajes_medida_desglose.csv';
            if (!fs.existsSync(csvDesglose)) {
                fs.writeFileSync(csvDesglose, `"CodigoReserva","Titular","Pasajeros","Destino","Vuelo_Avion","Hotel_Alojamiento","Actividades","Comida","Seguro_Traslados","Total"\n`);
            }
            fs.appendFileSync(csvDesglose, `"${codigoReserva}","${titular}","${numPasajeros}","${destinoLimpio}","${desglose.vuelo}","${desglose.hotel}","${desglose.actividades}","${desglose.comida}","${desglose.seguro}","${desglose.total}"\n`);
        }

        console.log(`✅ Pago registrado correctamente: ${codigoReserva}`);
        res.json({ exito: true, codigoReserva });
    } catch (err) {
        console.error("❌ Error en /api/pagar:", err);
        res.status(500).json({ exito: false, mensaje: err.message });
    }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
    console.log(`🔥 Servidor Empresarial BlindTravel activo en el puerto ${PUERTO}`);
});