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

// MOTOR DE RESPALDO DINÁMICO (SI GEMINI NO RESPONDE O NO HAY API KEY)
function seleccionarDestinoRespaldoDinamico(peticion, presupuesto) {
    const texto = (peticion || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const pres = parseInt(presupuesto || 450, 10);

    let opciones = [];

    if (pres >= 2000 || texto.includes('japon') || texto.includes('asia') || texto.includes('tokio') || texto.includes('nueva york') || texto.includes('eeuu')) {
        opciones = [
            {
                destino: "Tokio & Kioto, Japón",
                vueloNombre: "Qatar Airways / ANA (Salida BIO 14:15h)",
                hotelNombre: "Hotel Gracery Shinjuku & Ryokan Tradicional 5*",
                actividadesTexto: "Pase Shinkansen, entradas a teamLab Planets y ceremonias tradicionales.",
                pistas: ["Fusión única de tecnología futurista y cultura ancestral.", "Gastronomía galardonada con estrellas Michelin."],
                equipaje: "Calzado ultrasuave para caminar mucho y ropa elegante casual.",
                costeVueloBase: 650, costeHotelBase: 800
            },
            {
                destino: "Nueva York, Estados Unidos",
                vueloNombre: "Delta Air Lines / Iberia (Salida BIO 08:30h - 1 escala)",
                hotelNombre: "The Plaza Hotel Fifth Avenue (Manhattan)",
                actividadesTexto: "Vuelo en helicóptero sobre Manhattan y entradas VIP para musicales de Broadway.",
                pistas: ["La ciudad que nunca duerme con los rascacielos más famosos del mundo.", "Parques urbanos emblemáticos y compras de lujo."],
                equipaje: "Ropa urbana con estilo y calzado de marcha.",
                costeVueloBase: 550, costeHotelBase: 900
            }
        ];
    } else if (texto.includes('frio') || texto.includes('nieve') || texto.includes('suiza') || texto.includes('alpes') || texto.includes('islandia')) {
        opciones = [
            {
                destino: "Ginebra & Alpes Suizos, Suiza",
                vueloNombre: "Swiss Air (Salida Directa BIO 07:15h)",
                hotelNombre: "Alpine Lodge & Thermal Spa Resort 5*",
                actividadesTexto: "Pase VIP de montaña y acceso privado a baños termales.",
                pistas: ["Majestuosos picos alpinos y lagos helados.", "Entorno exclusivo de nieve y montaña."],
                equipaje: "Ropa térmica de alta montaña y botas de nieve.",
                costeVueloBase: 220, costeHotelBase: 500
            },
            {
                destino: "Reikiavik, Islandia",
                vueloNombre: "Icelandair (Salida BIO 09:20h)",
                hotelNombre: "The Retreat at Blue Lagoon",
                actividadesTexto: "Tour privado en superjeep por cascadas y glaciares con baño termal.",
                pistas: ["Tierra de fuego y hielo con auroras boreales y géiseres.", "Naturaleza virgen incomparable."],
                equipaje: "Chaqueta impermeable de alta gama y ropa térmica.",
                costeVueloBase: 280, costeHotelBase: 600
            }
        ];
    } else if (texto.includes('caribe') || texto.includes('playa') || texto.includes('mexico') || texto.includes('sol')) {
        opciones = [
            {
                destino: "Riviera Maya, México",
                vueloNombre: "Aeroméxico / Air Europa (Salida BIO 10:00h)",
                hotelNombre: "Grand Velas Riviera Maya (Luxury Todo Incluido)",
                actividadesTexto: "Navegación privada en yate y exploración exclusiva de cenotes.",
                pistas: ["Playas turquesas de arena blanca y legado maya.", "Gastronomía caribeña de autor."],
                equipaje: "Traje de baño, ropa ligera de lino y gafas de sol.",
                costeVueloBase: 400, costeHotelBase: 700
            }
        ];
    } else {
        opciones = [
            {
                destino: "París, Francia",
                vueloNombre: "Air France (Salida Directa BIO 10:30h)",
                hotelNombre: "Le Meurice Palace (Junto al Jardín de las Tullerías)",
                actividadesTexto: "Cena privada en crucero por el Sena y pase prioritario al Louvre.",
                pistas: ["La capital mundial de la moda, el arte y la gastronomía.", "Monumentos legendarios y avenidas imperiales."],
                equipaje: "Ropa elegante e informal.",
                costeVueloBase: 180, costeHotelBase: 450
            },
            {
                destino: "Praga, República Checa",
                vueloNombre: "Lufthansa (Salida BIO 08:45h)",
                hotelNombre: "Grand Mark Prague 5*",
                actividadesTexto: "Recorrido privado por el Castillo y concierto de música clásica.",
                pistas: ["La ciudad de las cien torres con un casco histórico sacado de un cuento.", "Cultura cervecera y palacios medievales."],
                equipaje: "Calzado cómodo para empedrados y abrigo casual.",
                costeVueloBase: 150, costeHotelBase: 300
            }
        ];
    }

    return opciones[Math.floor(Math.random() * opciones.length)];
}

// CONSULTA A GEMINI API (MODELO OFICIAL gemini-1.5-flash)
async function consultarGeminiIA(peticion, presupuesto, pasajeros, tipoViaje) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log("⚠️ No se encontró GEMINI_API_KEY en variables de entorno. Usando motor de respaldo dinámico.");
        return seleccionarDestinoRespaldoDinamico(peticion, presupuesto);
    }

    try {
        const prompt = `Eres la IA experta en viajes de BlindTravel. El usuario pide un viaje tipo "${tipoViaje}" desde Bilbao/San Sebastián (BIO). 
Presupuesto: ${presupuesto}€ por persona para ${pasajeros} pasajero(s). 
Petición del usuario: "${peticion}".

Genera una propuesta realista acorde al presupuesto y la petición. 
RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO (sin bloques \`\`\`json ni texto extra):
{
  "destino": "Ciudad, País",
  "vueloNombre": "Aerolínea y detalle del vuelo desde BIO",
  "hotelNombre": "Nombre de hotel acorde al presupuesto",
  "actividadesTexto": "Actividades destacadas",
  "pistas": ["Pista 1 sobre el destino", "Pista 2 sobre el destino"],
  "equipaje": "Recomendación de ropa/equipaje",
  "costeVueloBase": 150,
  "costeHotelBase": 250
}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            console.error(`❌ Error en respuesta de Gemini: ${response.status} ${response.statusText}`);
            return seleccionarDestinoRespaldoDinamico(peticion, presupuesto);
        }

        const data = await response.json();
        const textoRespuesta = data.candidates[0].content.parts[0].text;
        
        // Limpiar formato markdown si Gemini lo devuelve envuelto
        const jsonTexto = textoRespuesta.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonTexto);
        
        console.log("🤖 Gemini IA respondió exitosamente:", parsed.destino);
        return parsed;
    } catch (err) {
        console.error("❌ Fallo al procesar respuesta con Gemini API:", err.message);
        return seleccionarDestinoRespaldoDinamico(peticion, presupuesto);
    }
}

function calcularDesgloseFinanciero(presupuestoUnitario, pasajeros, vueloBase, hotelBase) {
    const totalPers = presupuestoUnitario || 450;
    const totalPax = pasajeros || 1;

    let costeVuelo = Math.min(vueloBase || 150, Math.round(totalPers * 0.35));
    let costeHotel = Math.min(hotelBase || 250, Math.round(totalPers * 0.40));
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

    // Consultar a Gemini o Respaldo
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
        tiempoVueloEst: "Aproximadamente 2h - 8h según destino seleccionado",
        pistas: resultado.pistas || ["Destino increíble adaptado a tu petición.", "Experiencia única reservada."],
        equipajeRecomendado: resultado.equipaje || "Ropa cómoda adecuada al clima del destino.",
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

        console.log(`✅ Pago procesado y registrado: ${codigoReserva}`);
        res.json({ exito: true, codigoReserva });
    } catch (err) {
        res.status(500).json({ exito: false, mensaje: err.message });
    }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => console.log(`🔥 Servidor BlindTravel con Gemini 1.5 activo en puerto ${PUERTO}`));