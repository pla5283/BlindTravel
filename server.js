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
        const { nombre, email, password } = req.body;
        if (!email || !password || !nombre) {
            return res.status(400).json({ exito: false, mensaje: "Completa todos los campos." });
        }
        const usuarios = JSON.parse(fs.readFileSync(ARCHIVO_USUARIOS, 'utf-8'));
        if (usuarios.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return res.status(400).json({ exito: false, mensaje: "Este correo ya existe." });
        }
        const nuevoUsuario = { id: 'USR-' + Date.now(), nombre, email: email.toLowerCase(), password };
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

// MOTOR DE RESPALDO INTELIGENTE (FALLBACK)
function seleccionarDestinoRespaldo(peticion) {
    const texto = (peticion || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (texto.includes('frio') || texto.includes('nieve') || texto.includes('suiza')) {
        return {
            destino: "Ginebra & Alpes Suizos, Suiza",
            vueloNombre: "Swiss Air (Salida Directa BIO 07:15h)",
            hotelNombre: "Alpine Lodge & Thermal Spa Resort",
            actividadesTexto: "Pase de montaña y acceso a termas.",
            pistas: ["Majestuosos picos alpinos y lagos helados.", "Entorno perfecto para la nieve."],
            equipaje: "Ropa térmica de abrigo y botas.",
            costeVueloBase: 130, costeHotelBase: 260
        };
    }
    return {
        destino: "Roma, Italia",
        vueloNombre: "Vueling / Iberia (Salida Directa BIO 09:40h - 2h 15m)",
        hotelNombre: "Hotel Artemide (4 Estrellas Superior)",
        actividadesTexto: "Entradas VIP al Coliseo y Museos Vaticanos.",
        pistas: ["Historia viva, el Imperio Romano y gastronomía italiana.", "Monumentos icónicos."],
        equipaje: "Calzado cómodo para empedrados y ropa casual.",
        costeVueloBase: 110, costeHotelBase: 210
    };
}

// INTEGRACIÓN CON LA IA DE GEMINI
async function consultarGeminiIA(peticion, presupuesto, pasajeros, tipoViaje) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log("⚠️ No se detectó GEMINI_API_KEY, usando motor de respaldo.");
        return seleccionarDestinoRespaldo(peticion);
    }

    try {
        const prompt = `Actúa como la IA de una agencia de viajes llamada BlindTravel. El usuario solicita un viaje tipo "${tipoViaje}" saliendo desde Bilbao/San Sebastián (BIO). Presupuesto: ${presupuesto}€ por persona para ${pasajeros} pasajero(s). Petición del usuario: "${peticion}".
        Genera un destino real adecuado y devuélvelo ÚNICAMENTE en formato JSON plano (sin bloques de código markdown como \`\`\`json, solo el objeto JSON):
        {
          "destino": "Ciudad y País",
          "vueloNombre": "Aerolínea y hora de salida desde BIO",
          "hotelNombre": "Nombre real de hotel 4 o 5 estrellas",
          "actividadesTexto": "Resumen de actividades",
          "pistas": ["Pista 1", "Pista 2"],
          "equipaje": "Recomendación de equipaje",
          "costeVueloBase": 120,
          "costeHotelBase": 250
        }`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const textoRespuesta = data.candidates[0].content.parts[0].text;
        const jsonLimpio = textoRespuesta.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonLimpio);
    } catch (err) {
        console.error("❌ Error con Gemini API, usando respaldo:", err);
        return seleccionarDestinoRespaldo(peticion);
    }
}

function calcularDesgloseFinanciero(presupuestoUnitario, pasajeros, vueloBase, hotelBase) {
    const totalPers = presupuestoUnitario || 450;
    const totalPax = pasajeros || 1;

    let costeVuelo = Math.min(vueloBase || 110, Math.round(totalPers * 0.30));
    let costeHotel = Math.min(hotelBase || 210, Math.round(totalPers * 0.40));
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

    // Consultar a la IA de Gemini
    const resultado = await consultarGeminiIA(peticion, presupuestoNum, numPasajeros, tipo);

    res.json({
        exito: true,
        tipoViaje: tipo || "sorpresa",
        titulo: tipo === 'medida' ? "🗺️ Propuesta Exclusiva a Medida" : "✈️ Destino Secreto Asignado",
        destinoAsignado: tipo === 'medida' ? resultado.destino : "--------------- (Destino Secreto)",
        destinoRealInterno: resultado.destino,
        vueloInfo: resultado.vueloNombre,
        hotelInfo: resultado.hotelNombre,
        actividadesInfo: resultado.actividadesTexto,
        tiempoVueloEst: "Aproximadamente 2h - 4h de vuelo",
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
        const { titular, tarjeta, importe, destino, tipoViaje, pasajeros, costeVueloBase, costeHotelBase, vueloInfo, hotelInfo } = req.body;
        const codigoReserva = 'BT-' + Math.floor(100000 + Math.random() * 900000);

        const numPasajeros = parseInt(pasajeros || 1, 10);
        const matchImporte = (importe || '450').toString().match(/(\d+)/);
        const presupuestoUnitario = matchImporte ? parseInt(matchImporte[1], 10) : 450;

        const desglose = calcularDesgloseFinanciero(presupuestoUnitario, numPasajeros, costeVueloBase, costeHotelBase);

        const csvDesglose = tipoViaje === 'sorpresa' ? 'viajes_sorpresa_desglose.csv' : 'viajes_medida_desglose.csv';
        if (!fs.existsSync(csvDesglose)) {
            fs.writeFileSync(csvDesglose, `"CodigoReserva","Titular","Pasajeros","Destino","Hotel_Nombre","Vuelo_Avion","Hotel_Alojamiento","Actividades","Comida","Seguro_Traslados","Total"\n`);
        }
        fs.appendFileSync(csvDesglose, `"${codigoReserva}","${titular}","${numPasajeros}","${destino}","${hotelInfo || ''}","${desglose.vuelo}","${desglose.hotel}","${desglose.actividades}","${desglose.comida}","${desglose.seguro}","${desglose.total}"\n`);

        console.log(`✅ Pago procesado y registrado con Gemini: ${codigoReserva}`);
        res.json({ exito: true, codigoReserva });
    } catch (err) {
        res.status(500).json({ exito: false, mensaje: err.message });
    }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => console.log(`🔥 Servidor BlindTravel con Gemini IA activo en puerto ${PUERTO}`));