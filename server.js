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

// MOTOR IA DE DESTINOS DINÁMICOS Y MULTIVARIADO
function seleccionarDestinoSegunPeticion(peticion) {
    const texto = (peticion || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 1. Sudamérica / Latinoamérica
    if (texto.includes('sudamerica') || texto.includes('colombia') || texto.includes('argentina') || texto.includes('peru') || texto.includes('brasil')) {
        const opciones = [
            {
                destino: "Cartagena de Indias, Colombia",
                vueloNombre: "Avianca / Iberia (Salida BIO/EAS 08:30h - 1 escala)",
                hotelNombre: "Hotel Charleston Santa Teresa (5 Estrellas)",
                actividadesTexto: "Tour por la Ciudad Amurallada, excursión en barco a Islas del Rosario y cata de café.",
                pistas: ["Destino caribeño en Sudamérica con vibrante arquitectura colonial.", "Excelente gastronomía tropical e historia viva."],
                equipaje: "Ropa muy ligera, traje de baño, sombrero y crema solar.",
                costeVueloBase: 340, costeHotelBase: 420
            },
            {
                destino: "Buenos Aires, Argentina",
                vueloNombre: "Air Europa / LATAM (Salida BIO 11:15h)",
                hotelNombre: "Alvear Palace Hotel (Recoleta)",
                actividadesTexto: "Espectáculo de tango en San Telmo, tour por Caminito y degustación de carnes argentinas.",
                pistas: ["Elegante capital del cono sur conocida por su cultura y tango.", "Gastronomía excepcional y ambiente cosmopolita."],
                equipaje: "Ropa elegante e informal y calzado cómodo para caminar.",
                costeVueloBase: 380, costeHotelBase: 410
            }
        ];
        return opciones[Math.floor(Math.random() * opciones.length)];
    }

    // 2. Caribe / Sol y Playa / México
    if (texto.includes('caribe') || texto.includes('mexico') || texto.includes('playa') || texto.includes('sol') || texto.includes('punta cana') || texto.includes('cancun')) {
        const opciones = [
            {
                destino: "Riviera Maya, México",
                vueloNombre: "Aeroméxico / Air Europa (Salida BIO 10:00h)",
                hotelNombre: "Grand Palladium Kantenah Resort & Spa",
                actividadesTexto: "Excursión a las ruinas mayas de Chichén Itzá, baño en cenotes y snorkel.",
                pistas: ["Playas turquesas de arena blanca y civilizaciones antiguas.", "Resorts con servicio todo incluido."],
                equipaje: "Traje de baño, gafas de sol y ropa fresca de verano.",
                costeVueloBase: 310, costeHotelBase: 390
            },
            {
                destino: "Punta Cana, República Dominicana",
                vueloNombre: "Iberojet / World2Fly (Salida BIO 12:30h)",
                hotelNombre: "Barceló Bávaro Palace (Primera línea de playa)",
                actividadesTexto: "Catamarán a Isla Saona, deportes acuáticos y cena en la playa.",
                pistas: ["Cocoteros, aguas cristalinas y relajación caribeña absoluta.", "Clima cálido garantizado."],
                equipaje: "Ropa ligera de lino, protector solar biodegradable y bañador.",
                costeVueloBase: 290, costeHotelBase: 380
            }
        ];
        return opciones[Math.floor(Math.random() * opciones.length)];
    }

    // 3. Asia / Japón / Bali / Tailandia
    if (texto.includes('asia') || texto.includes('japon') || texto.includes('tokio') || texto.includes('bali') || texto.includes('tailandia')) {
        const opciones = [
            {
                destino: "Tokio & Kioto, Japón",
                vueloNombre: "Qatar Airways / ANA (Salida BIO 14:15h)",
                hotelNombre: "Hotel Gracery Shinjuku (Tokio) & Ryokan Tradicional (Kioto)",
                actividadesTexto: "Entradas a teamLab Planets, pase Shinkansen (tren bala) y visita a santuarios en Kioto.",
                pistas: ["Contraste único entre rascacielos futuristas y templos ancestrales.", "Una de las mejores gastronomías del mundo."],
                equipaje: "Ropa muy cómoda para caminar y calzado fácil de quitar.",
                costeVueloBase: 430, costeHotelBase: 420
            },
            {
                destino: "Ubud & Seminyak, Bali (Indonesia)",
                vueloNombre: "Singapore Airlines / Emirates (Salida BIO 15:45h)",
                hotelNombre: "Ubud Valley Boutique Villas",
                actividadesTexto: "Ruta por terrazas de arroz, masaje balinés y atardecer en templo Tanah Lot.",
                pistas: ["Naturaleza exuberante, espiritualidad y villas con piscina en la selva.", "Clima tropical exótico."],
                equipaje: "Ropa fresca de algodón, calzado de montaña ligero y repelente.",
                costeVueloBase: 410, costeHotelBase: 370
            }
        ];
        return opciones[Math.floor(Math.random() * opciones.length)];
    }

    // 4. Clima Frío / Alpes / Nieve / Islandia
    if (texto.includes('frio') || texto.includes('nieve') || texto.includes('suiza') || texto.includes('alpes') || texto.includes('islandia') || texto.includes('esqui')) {
        const opciones = [
            {
                destino: "Ginebra & Alpes Suizos, Suiza",
                vueloNombre: "Swiss Air / Vueling (Salida Directa BIO 07:15h - 1h 55m)",
                hotelNombre: "Alpine Lodge & Thermal Spa Resort",
                actividadesTexto: "Pase para tren de alta montaña Junfraujoch y acceso a balnearios termales.",
                pistas: ["Majestuosos picos alpinos, chocolates artesanales y lagos helados.", "Entorno perfecto para la nieve y la montaña."],
                equipaje: "Ropa térmica de abrigo, chaqueta impermeable y botas de nieve.",
                costeVueloBase: 130, costeHotelBase: 260
            },
            {
                destino: "Reikiavik, Islandia",
                vueloNombre: "Icelandair / Play (Salida BIO 09:20h)",
                hotelNombre: "The Retreat at Blue Lagoon",
                actividadesTexto: "Ruta del Círculo Dorado (geysers y cascadas) y baño en la Laguna Azul.",
                pistas: ["Tierra de fuego y hielo con paisajes volcánicos únicos en el planeta.", "Naturaleza virgen e imponente."],
                equipaje: "Cortavientos impermeable, ropa térmica en capas y bañador para termas.",
                costeVueloBase: 220, costeHotelBase: 290
            }
        ];
        return opciones[Math.floor(Math.random() * opciones.length)];
    }

    // 5. Ciudades de Europa Específicas
    if (texto.includes('paris') || texto.includes('francia')) {
        return {
            destino: "París, Francia",
            vueloNombre: "Air France / Vueling (Salida Directa BIO 10:30h - 1h 35m)",
            hotelNombre: "Hôtel Plaza Étoile (Junto al Arco del Triunfo)",
            actividadesTexto: "Crucero nocturno por el Río Sena, subida a la Torre Eiffel y entradas al Museo del Louvre.",
            pistas: ["La ciudad del amor, el arte y la arquitectura monumental.", "Avenida de los Campos Elíseos y gastronomía francesa."],
            equipaje: "Ropa elegante e informal, abrigo ligero y calzado cómodo.",
            costeVueloBase: 95, costeHotelBase: 220
        };
    }

    if (texto.includes('londres') || texto.includes('inglaterra') || texto.includes('uk')) {
        return {
            destino: "Londres, Reino Unido",
            vueloNombre: "British Airways / EasyJet (Salida Directa BIO 11:00h - 1h 50m)",
            hotelNombre: "The Park Grand London Kensington (4 Estrellas)",
            actividadesTexto: "Entradas al London Eye, recorrido por Covent Garden y musical en West End.",
            pistas: ["Capital cosmopolita llena de museos icónicos, parques reales y vida nocturna.", "Barrios históricos y compras."],
            equipaje: "Paraguas, chaqueta impermeable y ropa versátil.",
            costeVueloBase: 85, costeHotelBase: 230
        };
    }

    if (texto.includes('roma') || texto.includes('italia')) {
        return {
            destino: "Roma, Italia",
            vueloNombre: "Vueling / Iberia (Salida Directa BIO 09:40h - 2h 15m)",
            hotelNombre: "Hotel Artemide (4 Estrellas Superior)",
            actividadesTexto: "Entradas VIP al Coliseo y Museos Vaticanos + Tour gastronómico por Trastevere.",
            pistas: ["Historia viva, el Imperio Romano y pasta artesanal en cada rincón.", "Monumentos legendarios."],
            equipaje: "Calzado cómodo para empedrados y ropa casual.",
            costeVueloBase: 110, costeHotelBase: 210
        };
    }

    // 6. Catálogo General Multivariado (Si la petición es abierta o genérica)
    const catalogoGeneral = [
        {
            destino: "Praga, República Checa",
            vueloNombre: "Smartwings / Lufthansa (Salida BIO 08:45h)",
            hotelNombre: "Grand Hotel Bohemia (Centro Histórico Praga 1)",
            actividadesTexto: "Paseo por el Puente de Carlos al atardecer, visita al Castillo de Praga y cena con concierto medieval.",
            pistas: ["Ciudad de las cien torres con uno de los cascos históricos más bonitos de Europa.", "Cerveza artesanal y romanticismo."],
            equipaje: "Ropa de abrigo casual y calzado cómodo para caminar.",
            costeVueloBase: 120, costeHotelBase: 180
        },
        {
            destino: "Oporto, Portugal",
            vueloNombre: "TAP Air Portugal (Salida Directa BIO 11:30h - 1h 10m)",
            hotelNombre: "Pestana Vintage Porto (Frente al Río Duero)",
            actividadesTexto: "Crucero por los 6 puentes del Duero, visita a bodegas de vino en Gaia y degustación de bacalao.",
            pistas: ["Fachadas de azulejos, ambiente atlántico acogedor y bodegas centenarias.", "Vistas espectaculares al río."],
            equipaje: "Chaqueta ligera para la brisa marina y calzado antideslizante.",
            costeVueloBase: 70, costeHotelBase: 160
        },
        {
            destino: "Atenas & Islas Sarónicas, Grecia",
            vueloNombre: "Aegean Airlines / Vueling (Salida BIO 06:50h)",
            hotelNombre: "Electra Metropolis Hotel (Vistas a la Acrópolis)",
            actividadesTexto: "Entradas a la Acrópolis de Atenas y excursión en barco por las islas de Hydra y Poros.",
            pistas: ["Cuna de la civilización occidental frente al mar Egeo.", "Clima mediterráneo radiante."],
            equipaje: "Ropa ligera de lino, gafas de sol y calzado cómodo.",
            costeVueloBase: 140, costeHotelBase: 200
        },
        {
            destino: "Viena, Austria",
            vueloNombre: "Austrian Airlines / Lufthansa (Salida BIO 09:10h)",
            hotelNombre: "Hotel Hotel Baronesse (Estilo Imperial)",
            actividadesTexto: "Entradas al Palacio de Schönbrunn, concierto de música clásica y degustación de Tarta Sacher.",
            pistas: ["Elegancia palaciega, palacios imperiales y tradición cafetera.", "Arquitectura monumental."],
            equipaje: "Ropa formal/casual elegante y calzado cómodo.",
            costeVueloBase: 130, costeHotelBase: 210
        },
        {
            destino: "Marrakech, Marruecos",
            vueloNombre: "Ryanair / Vueling (Salida BIO 16:20h - 2h 20m)",
            hotelNombre: "Riad & Spa Le Clos des Arts (Medina Histórica)",
            actividadesTexto: "Tour guiado por los Zocos y la plaza Jemaa el-Fna + Excursión en quad al desierto de Agafay.",
            pistas: ["Experiencia sensorial única, arquitectura islámica con encanto y palacios.", "Clima cálido."],
            equipaje: "Ropa ligera que cubra los hombros, pañuelo y calzado cerrado.",
            costeVueloBase: 80, costeHotelBase: 150
        }
    ];

    return catalogoGeneral[Math.floor(Math.random() * catalogoGeneral.length)];
}

function calcularDesgloseFinanciero(presupuestoUnitario, pasajeros, vueloBase, hotelBase) {
    const totalPers = presupuestoUnitario || 450;
    const totalPax = pasajeros || 1;

    let costeVuelo = Math.min(vueloBase || 110, Math.round(totalPers * 0.30));
    let costeHotel = Math.min(hotelBase || 200, Math.round(totalPers * 0.40));
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

    const resultado = seleccionarDestinoSegunPeticion(peticion);

    return res.json({
        exito: true,
        tipoViaje: tipo || "sorpresa",
        titulo: tipo === 'medida' ? "🗺️ Propuesta Exclusiva a Medida" : "✈️ Destino Secreto Asignado",
        destinoAsignado: tipo === 'medida' ? resultado.destino : "--------------- (Destino Secreto)",
        destinoRealInterno: resultado.destino,
        vueloInfo: resultado.vueloNombre,
        hotelInfo: resultado.hotelNombre,
        actividadesInfo: resultado.actividadesTexto,
        tiempoVueloEst: "Aproximadamente 2h - 4h de vuelo (según ruta)",
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