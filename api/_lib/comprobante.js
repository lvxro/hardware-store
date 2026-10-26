// T-024: el comprobante de compra que se manda por mail cuando Mercado Pago aprueba un pago.
// Misma estética que el mail de confirmación de cuenta (supabase/plantilla-confirmar-correo.html):
// fondo oscuro, lima como único acento, precios en letra monoespaciada. Todo en tablas y estilos
// en línea, que es lo único que respetan Gmail y Outlook.
import nodemailer from 'nodemailer'

const C = {
  fondo: '#0E0E10',
  panel: '#17171A',
  elevado: '#1F1F24',
  borde: '#26262B',
  lima: '#CBEB4C',
  texto: '#FFFFFF',
  apagado: '#9B9BA6',
}
const SANS = 'Poppins,Arial,Helvetica,sans-serif'
const MONO = "'JetBrains Mono',Menlo,Consolas,'Courier New',monospace"

const MEDIOS = {
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta de débito',
  prepaid_card: 'Tarjeta prepaga',
  account_money: 'Dinero en cuenta',
  ticket: 'Efectivo',
  bank_transfer: 'Transferencia',
  digital_currency: 'Mercado Crédito',
}

const pesos = (n) => `$ ${Math.round(Number(n)).toLocaleString('es-AR')}`

// Los nombres de producto vienen de la base de datos: se escapan para que no rompan el HTML
const esc = (t) =>
  String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function fechaArgentina(fecha) {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha)
}

// "pedido" es la fila de la tabla pedidos; "pago" lo que devuelve Mercado Pago
export function armarComprobante(pedido, pago, sitio) {
  const numero = pedido.id.slice(0, 8).toUpperCase()
  const fecha = fechaArgentina(new Date(pago.date_approved ?? Date.now()))
  const medio = MEDIOS[pago.payment_type_id] ?? 'Mercado Pago'
  const cuotas = pago.installments > 1 ? `${pago.installments} cuotas` : null
  const tarjeta = pago.card?.last_four_digits ? `terminada en ${pago.card.last_four_digits}` : null
  const unidades = pedido.items.reduce((s, i) => s + i.cantidad, 0)

  const filasProductos = pedido.items
    .map(
      (i) => `
          <tr>
            <td style="padding:16px 0;border-top:1px solid ${C.borde};font-family:${SANS};">
              <div style="font-size:12px;line-height:1.4;color:${C.apagado};">${esc(i.marca)}</div>
              <div style="font-size:15px;font-weight:500;line-height:1.35;color:${C.texto};">${esc(i.nombre)}</div>
              <div style="padding-top:4px;font-family:${MONO};font-size:13px;color:${C.apagado};">${i.cantidad} × ${pesos(i.precio)}</div>
            </td>
            <td align="right" valign="top" style="padding:16px 0 16px 16px;border-top:1px solid ${C.borde};font-family:${MONO};font-size:15px;font-weight:700;white-space:nowrap;color:${C.texto};">
              ${pesos(i.precio * i.cantidad)}
            </td>
          </tr>`,
    )
    .join('')

  const datos = [
    ['Pedido', numero],
    ['Fecha', fecha],
    ['Operación Mercado Pago', pago.id],
    ['Medio de pago', [medio, tarjeta].filter(Boolean).join(' ')],
    ...(cuotas ? [['Cuotas', cuotas]] : []),
  ]
  const filasDatos = datos
    .map(
      ([etiqueta, valor]) => `
          <tr>
            <td style="padding:4px 0;font-family:${MONO};font-size:13px;color:${C.apagado};">${etiqueta}</td>
            <td align="right" style="padding:4px 0 4px 16px;font-family:${MONO};font-size:13px;color:${C.texto};">${esc(valor)}</td>
          </tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>Tu compra en aura/ware</title>
</head>
<body style="margin:0;padding:0;background-color:${C.fondo};">
  <!-- Texto que muestra la bandeja de entrada al lado del asunto -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.fondo};">
    Pagaste ${pesos(pedido.total)}. Pedido ${numero}. Ya estamos preparando tu compra.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.fondo}" style="background-color:${C.fondo};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panel}" style="max-width:560px;background-color:${C.panel};border:1px solid ${C.borde};border-radius:4px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:40px 32px 8px 32px;font-family:${SANS};font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1;color:${C.texto};">
              aura<span style="color:${C.lima};font-weight:400;">/</span>ware
            </td>
          </tr>

          <!-- Sello con el tilde -->
          <tr>
            <td align="center" style="padding:32px 0 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle" width="64" height="64" bgcolor="${C.lima}" style="width:64px;height:64px;background-color:${C.lima};border-radius:32px;font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:700;line-height:64px;color:${C.fondo};">
                    &#10003;
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rótulo y título -->
          <tr>
            <td align="center" style="padding:24px 40px 0 40px;font-family:${MONO};font-size:12px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:${C.lima};">
              Pago aprobado
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:12px 40px 0 40px;font-family:${SANS};font-size:32px;font-weight:600;line-height:1.2;color:${C.texto};">
              ¡Listo! <span style="color:${C.lima};">Es tuyo.</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 40px 0 40px;font-family:${SANS};font-size:16px;line-height:1.5;color:${C.apagado};">
              ${unidades > 1 ? `Tus ${unidades} productos ya están confirmados.` : 'Tu compra ya está confirmada.'}
              Este es el detalle de tu pedido.
            </td>
          </tr>

          <!-- Ticket -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.elevado}" style="background-color:${C.elevado};border:1px solid ${C.borde};border-radius:3px;">
                <tr>
                  <td style="padding:4px 20px 0 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${filasProductos}
                    </table>
                  </td>
                </tr>
                <!-- Corte del ticket -->
                <tr>
                  <td style="padding:0 20px;"><div style="border-top:1px dashed #3A3A42;height:1px;line-height:1px;font-size:1px;">&nbsp;</div></td>
                </tr>
                <tr>
                  <td style="padding:20px 20px 0 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family:${SANS};font-size:15px;color:${C.apagado};">Pagaste</td>
                        <td align="right" style="font-family:${MONO};font-size:28px;font-weight:700;color:${C.lima};white-space:nowrap;">${pesos(pedido.total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px 20px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${filasDatos}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Qué sigue -->
          <tr>
            <td style="padding:28px 40px 0 40px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.apagado};">
              <span style="color:${C.texto};font-weight:500;">Qué sigue:</span> ya estamos preparando tu pedido. Te escribimos cuando salga.
              El comprobante de pago te lo manda Mercado Pago por separado.
            </td>
          </tr>

          <!-- Botón -->
          <tr>
            <td align="center" style="padding:28px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${C.lima}" style="background-color:${C.lima};border-radius:4px;">
                    <a href="${esc(sitio)}/productos" target="_blank" style="display:block;padding:16px 24px;font-family:${MONO};font-size:15px;font-weight:700;line-height:1.2;color:${C.fondo};text-decoration:none;">
                      Seguir comprando
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td align="center" style="padding:40px 40px 32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="border-top:1px solid ${C.borde};padding-top:20px;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.apagado};">
                    Comprobante de compra. Documento no válido como factura.<br />
                    &copy; ${new Date().getFullYear()} aura/ware. Todos los derechos reservados.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`

  // Versión en texto, para los programas de correo que no muestran HTML
  const texto = [
    'aura/ware — Pago aprobado',
    '',
    ...pedido.items.map((i) => `${i.cantidad} × ${i.nombre}  ${pesos(i.precio * i.cantidad)}`),
    '',
    `Pagaste: ${pesos(pedido.total)}`,
    ...datos.map(([e, v]) => `${e}: ${v}`),
    '',
    'Ya estamos preparando tu pedido. El comprobante de pago te lo manda Mercado Pago por separado.',
    'Comprobante de compra. Documento no válido como factura.',
  ].join('\n')

  return { asunto: `Tu compra en aura/ware · Pedido ${numero}`, html, texto }
}

// Envío por SMTP: sirve cualquier proveedor (Gmail, Resend, Brevo...) cambiando las variables.
// Devuelve false si no está configurado.
export async function enviarCorreo({ para, asunto, html, texto }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_REMITENTE } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('Falta configurar SMTP_HOST, SMTP_USER y SMTP_PASS: no se manda el comprobante')
    return false
  }
  const puerto = Number(SMTP_PORT ?? 465)
  const transporte = nodemailer.createTransport({
    host: SMTP_HOST,
    port: puerto,
    secure: puerto === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  await transporte.sendMail({
    from: MAIL_REMITENTE ?? `aura/ware <${SMTP_USER}>`,
    to: para,
    subject: asunto,
    html,
    text: texto,
  })
  return true
}
