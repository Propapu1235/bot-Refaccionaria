const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const xlsx = require('xlsx');

// 1. LECTURA DE LA BASE DE DATOS
const workbook = xlsx.readFile('LISTA UNIFIL DESCUENTOS VARIOS 2026.xlsx');
const data: any[] = xlsx.utils.sheet_to_json(workbook.Sheets['UNIFIL'], { range: 1 });

console.log(`✅ Base de datos cargada: ${data.length} productos listos.`);

// 2. CONFIGURACIÓN DEL BOT
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    }
});

// 3. EVENTOS DE CONEXIÓN
client.on('qr', (qr: string) => {
    console.log('📱 Escanea este código QR con la cuenta de WhatsApp Business:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('🤖 Bot conectado y escuchando mensajes...');
});

// 4. LÓGICA DEL BUSCADOR
client.on('message', async (msg: any) => {
    const texto = msg.body.toLowerCase().trim();

    // Filtro para ignorar textos muy cortos
    if (texto.length < 3) return;

    // Saludo con instrucciones
    if (texto === 'hola' || texto === 'buenos dias' || texto === 'buenas tardes') {
        await msg.reply('Hola . Escribe el código para buscar el filtro (Ejemplo: FO-10158)');
        return;
    }

    // Búsqueda por CODIGO o MODELO
    const resultado = data.find((producto: any) => {
        const codigo = String(producto.CODIGO || '').toLowerCase();
        return codigo.includes(texto)
    });

    if (resultado) {
        // Precio de la columna M (descuento al 30%)
        const precioBase = resultado.PRECIO;

        const precio = precioBase ? (precioBase * 1.3).toFixed(2) : 'No disponible';
        
        const respuesta = `*✅ Filtro Encontrado*\n\n` +
                          `*Código:* ${resultado.CODIGO}\n` +
                          `*Marca:* ${resultado.MARCA}\n` +
                          `*Aplicación:* ${resultado.MODELO}\n` +
                          `*Precio:* ${precio}\n\n` +
                          `*Descripción:* ${resultado.DESCRIPCION}`;
        
        await msg.reply(respuesta);
    } else {
        await msg.reply('❌ No encontré ningún filtro con esa clave o modelo. Verifica si está bien escrito e intenta de nuevo.');
    }
});

client.initialize();