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

// Limpiar archivos de registros antiguos al arrancar para empezar limpios
['viajes_sorpresa_desglose.csv', 'viajes_medida_desglose.csv'].forEach(file => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
});

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

// MOTOR DE INTELIGENCIA DE VIAJES CON DATOS DETALLADOS DE VUELO
function procesarIAViaje(peticion, presupuesto) {
    const txt = (peticion || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const pres = parseInt(presupuesto || 450, 10);

    const esIslaOPlaya = txt.includes('isla') || txt.includes('mar') || txt.includes('playa') || txt.includes('caribe') || txt.includes('sol');
    const esFrioONieve = txt.includes('frio') || txt.includes('nieve') || txt.includes('suiza') || txt.includes('alpes');
    const esAsiaOExotico = txt.includes('japon') || txt.includes('tokio') || txt.includes('asia') || txt.includes('bali');
    const esLujoPresupuestoAlto = pres >= 1500;

    let resultado = {};

    if (esIslaOPlaya) {
        if (esLujoPresupuestoAlto) {
            resultado = {
                destino: "Bora Bora & Tahití, Polinesia Francesa",
                vueloInfo: "Air Tahiti Nui (Vuelo TN-072 - Salida 06:40h)",
                hotelNombre: "Overwater Villa Resort 5* Deluxe",
                actividadesTexto: "Navegación privada en catamarán y baño con mantarrayas.",
                pistas: ["Atolones de coral paradisíacos y bungalows sobre aguas turquesas."],
                equipaje: "Bañadores, protector solar biodegradable y ropa ligera.",
                costeVueloBase: 1200, costeHotelBase: 2500, duracionVuelo: "Aproximadamente 18h de vuelo"
            };
        } else {
            resultado = {
                destino: "Santorini & Islas Cícladas, Grecia",
                vueloInfo: "Aegean Airlines (Vuelo A3-752 - Salida 07:10h)",
                hotelNombre: "Caldera Premium Villas 4*",
                actividadesTexto: "Paseo en velero al atardecer y cata de vinos.",
                pistas: ["Casitas blancas con cúpulas azules sobre el mar Egeo."],
                equipaje: "Ropa fresca de algodón, gafas de sol y calzado cómodo.",
                costeVueloBase: 180, costeHotelBase: 280, duracionVuelo: "Aproximadamente 3h y media de vuelo"
            };
        }
    } else if (esFrioONieve) {
        resultado = {
            destino: "Ginebra & Alpes Suizos, Suiza",
            vueloInfo: "Swiss Air (Vuelo LX-2064 - Salida 07:15h)",
            hotelNombre: "Alpine Lodge & Thermal Spa Resort 5*",
            actividadesTexto: "Pase VIP de montaña y acceso privado a baños termales.",
            pistas: ["Majestuosos picos alpinos, lagos helados y estaciones de esquí."],
            equipaje: "Ropa térmica de abrigo, chaqueta impermeable y botas de nieve.",
            costeVueloBase: 220, costeHotelBase: 500, duracionVuelo: "Aproximadamente 2 horas de vuelo directo"
        };
    } else if (esAsiaOExotico) {
        resultado = {
            destino: "Tokio & Kioto, Japón",
            vueloInfo: "Qatar Airways (Vuelo QR-148 - Salida 14:15h)",
            hotelNombre: "Hotel Gracery Shinjuku & Ryokan Tradicional 5*",
            actividadesTexto: "Pase Shinkansen, entradas a teamLab Planets y ceremonias.",
            pistas: ["Fusión única de tecnología futurista y cultura ancestral."],
            equipaje: "Calzado ultrasuave para caminar mucho y ropa elegante casual.",
            costeVueloBase: 650, costeHotelBase: 800, duracionVuelo: "Aproximadamente 14h de vuelo"
        };
    } else {
        if (esLujoPresupuestoAlto) {
            resultado = {
                destino: "Nueva York, Estados Unidos",
                vueloInfo: "Delta Air Lines (Vuelo DL-418 - Salida 08:30h)",
                hotelNombre: "The Plaza Hotel Fifth Avenue (Manhattan)",
                actividadesTexto: "Vuelo en helicóptero sobre Manhattan y Broadway VIP.",
                pistas: ["La gran metrópoli mundial repleta de rascacielos icónicos."],
                equipaje: "Ropa urbana con estilo y calzado cómodo.",
                costeVueloBase: 550, costeHotelBase: 900, duracionVuelo: "Aproximadamente 8h de vuelo"
            };
        } else {
            resultado = {
                destino: "París, Francia",
                vueloInfo: "Air France (Vuelo AF-1240 - Salida 10:30h)",
                hotelNombre: "Le Meurice Palace (Junto a Tullerías)",
                actividadesTexto: "Cena privada en crucero por el Sena y Louvre prioritario.",
                pistas: ["Capital mundial del arte, la moda y monumentos imperiales."],
                equipaje: "Ropa elegante e informal y abrigo ligero.",
                costeVueloBase: 180, costeHotelBase: 450, duracionVuelo: "Aproximadamente 1h y 35m de vuelo"
            };
        }
    }
    return resultado;
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

    const resultado = procesarIAViaje(peticion, presupuestoNum);

    res.json({
        exito: true,
        tipoViaje: tipo || "sorpresa",
        titulo: tipo === 'medida' ? "🗺️ Propuesta Exclusiva a Medida" : "✈️ Destino Secreto Asignado",
        destinoAsignado: tipo === 'medida' ? resultado.destino : "--------------- (Destino Secreto)",
        destinoRealInterno: resultado.destino,
        vueloInfo: resultado.vueloInfo,
        hotelInfo: resultado.hotelNombre,
        actividadesInfo: resultado.actividadesTexto,
        tiempoVueloEst: resultado.duracionVuelo,
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
        const { titular, emailCliente, telefonoCliente, importe, destino, tipoViaje, pasajeros, costeVueloBase, costeHotelBase, hotelInfo, vueloInfo } = req.body;
        const codigoReserva = 'BT-' + Math.floor(100000 + Math.random() * 900000);

        const numPasajeros = parseInt(pasajeros || 1, 10);
        const matchImporte = (importe || '450').toString().match(/(\d+)/);
        const presupuestoUnitario = matchImporte ? parseInt(matchImporte[1], 10) : 450;

        const desglose = calcularDesgloseFinanciero(presupuestoUnitario, numPasajeros, costeVueloBase, costeHotelBase);

        const archivoCsv = tipoViaje === 'sorpresa' ? 'viajes_sorpresa_desglose.csv' : 'viajes_medida_desglose.csv';
        if (!fs.existsSync(archivoCsv)) {
            fs.writeFileSync(archivoCsv, `"CodigoReserva","Titular","Email","Telefono","Pasajeros","Destino","Hotel","Vuelo","Total"\n`);
        }
        fs.appendFileSync(archivoCsv, `"${codigoReserva}","${titular || 'Anónimo'}","${emailCliente || 'N/A'}","${telefonoCliente || 'N/A'}","${numPasajeros}","${destino}","${hotelInfo || ''}","${vueloInfo || 'Vuelo Directo'}","${desglose.total}"\n`);

        console.log(`✅ Pago procesado y registrado: ${codigoReserva}`);
        res.json({ exito: true, codigoReserva });
    } catch (err) {
        res.status(500).json({ exito: false, mensaje: err.message });
    }
});

app.get('/api/desarrollador/registros', (req, res) => {
    try {
        let sorpresas = [];
        let medidas = [];

        if (fs.existsSync('viajes_sorpresa_desglose.csv')) {
            sorpresas = fs.readFileSync('viajes_sorpresa_desglose.csv', 'utf-8').split('\n').filter(Boolean);
        }
        if (fs.existsSync('viajes_medida_desglose.csv')) {
            medidas = fs.readFileSync('viajes_medida_desglose.csv', 'utf-8').split('\n').filter(Boolean);
        }

        res.json({ exito: true, sorpresas, medidas });
    } catch (err) {
        res.status(500).json({ exito: false, mensaje: "Error al leer registros." });
    }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => console.log(`🔥 Servidor BlindTravel Activo en Puerto ${PUERTO}`));