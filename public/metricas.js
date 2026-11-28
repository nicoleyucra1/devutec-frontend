/*
 * Métricas DEVUTEC · el script que el estudiante pega en la web que entrega.
 *
 *   <script src="https://devutec.vercel.app/metricas.js" data-key="LLAVE_DEL_PROYECTO" defer></script>
 *
 * Cuenta solo: visitas, clics, velocidad de carga y los botones marcados con
 *   data-devutec="contacto"  (WhatsApp, llamar, cómo llegar, formularios)
 *   data-devutec="pedido"
 *   data-devutec="reserva"
 *
 * Privacidad (Ley 29733): antes de contar, el visitante ve un aviso y decide. Si dice que no, no se envía nada.
 * No usa cookies ni guarda nombres, correos o teléfonos. A la página se le quita lo que va después de "?" o "#".
 * El identificador de la visita es al azar y se borra al cerrar la pestaña (sessionStorage).
 */
(function () {
  'use strict'
  var script = document.currentScript
  if (!script || window.__devutecMetricas) return
  window.__devutecMetricas = true

  var KEY = script.getAttribute('data-key')
  var API = script.getAttribute('data-api') || 'https://devutec.duckdns.org/api/v1/collect'
  var CONSENT = 'devutec-metricas-consentimiento'
  if (!KEY) {
    console.warn('[DEVUTEC] Falta data-key en el script de métricas')
    return
  }

  function read(storage, name) {
    try { return window[storage].getItem(name) } catch (e) { return null }
  }
  function write(storage, name, value) {
    try { window[storage].setItem(name, value) } catch (e) { /* modo privado: no pasa nada */ }
  }

  // Identificador al azar de esta visita (Amplitude pide uno por evento). Dura hasta cerrar la pestaña
  function visitId() {
    var id = read('sessionStorage', 'devutec-visita')
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36)
      write('sessionStorage', 'devutec-visita', id)
    }
    return id
  }

  // De dónde llegó, solo como categoría (nunca el link completo)
  function source() {
    var ref = document.referrer
    if (!ref) return 'directo'
    var host = ''
    try { host = new URL(ref).hostname } catch (e) { return 'otro' }
    if (host === location.hostname) return null
    if (/instagram\./.test(host)) return 'instagram'
    if (/facebook\.|fb\./.test(host)) return 'facebook'
    if (/google\./.test(host)) return 'google'
    if (/tiktok\./.test(host)) return 'tiktok'
    if (/whatsapp\.|wa\.me/.test(host)) return 'whatsapp'
    return 'otro'
  }

  function device() {
    return window.matchMedia && window.matchMedia('(max-width: 768px)').matches ? 'celular' : 'computadora'
  }

  function send(type, extra) {
    if (read('localStorage', CONSENT) !== 'si') return
    var body = { key: KEY, type: type, path: location.pathname, visitorId: visitId(), device: device() }
    for (var k in extra) body[k] = extra[k]
    var text = JSON.stringify(body)
    // text/plain: el navegador lo envía sin preguntar antes al servidor (sin preflight)
    if (navigator.sendBeacon && navigator.sendBeacon(API, new Blob([text], { type: 'text/plain' }))) return
    try { fetch(API, { method: 'POST', body: text, keepalive: true, headers: { 'Content-Type': 'text/plain' } }) } catch (e) { /* sin red */ }
  }

  function start() {
    send('PAGEVIEW', { source: source() })
    // Velocidad: cuánto tardó la página en estar lista
    setTimeout(function () {
      var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]
      var ms = nav ? Math.round(nav.loadEventEnd || nav.domContentLoadedEventEnd) : 0
      if (ms > 0 && ms < 60000) send('PERFORMANCE', { valueMs: ms })
    }, 1500)
  }

  var TYPES = { contacto: 'CONTACT', pedido: 'ORDER', reserva: 'RESERVATION' }
  document.addEventListener('click', function (event) {
    var el = event.target && event.target.closest && event.target.closest('[data-devutec], a, button')
    if (!el || el.closest('#devutec-aviso')) return
    var mark = (el.getAttribute('data-devutec') || '').toLowerCase()
    send(TYPES[mark] || 'CLICK', {})
  }, true)

  // Aviso al visitante: aparece una vez; si acepta, se empieza a contar
  function notice() {
    var box = document.createElement('div')
    box.id = 'devutec-aviso'
    box.setAttribute('role', 'dialog')
    box.setAttribute('aria-label', 'Aviso de estadísticas')
    box.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;max-width:420px;margin:0 auto;z-index:2147483647;'
      + 'background:#0e0e0c;color:#fff;border-radius:14px;padding:14px 16px;font:13px/1.45 system-ui,-apple-system,sans-serif;'
      + 'box-shadow:0 8px 30px rgba(0,0,0,.25)'
    box.innerHTML = '<p style="margin:0 0 10px">Este sitio cuenta visitas de forma anónima con DEVUTEC para que el negocio sepa cómo le va. '
      + 'No guardamos tu nombre, correo ni teléfono, ni usamos cookies.</p>'
      + '<div style="display:flex;gap:8px;justify-content:flex-end">'
      + '<button type="button" data-r="no" style="border:1px solid #555;background:transparent;color:#fff;border-radius:9px;padding:7px 12px;cursor:pointer">No, gracias</button>'
      + '<button type="button" data-r="si" style="border:0;background:#d7f25c;color:#0e0e0c;border-radius:9px;padding:7px 12px;font-weight:600;cursor:pointer">Aceptar</button></div>'
    box.addEventListener('click', function (event) {
      var answer = event.target && event.target.getAttribute('data-r')
      if (!answer) return
      write('localStorage', CONSENT, answer)
      box.remove()
      if (answer === 'si') start()
    })
    document.body.appendChild(box)
  }

  function ready() {
    var answer = read('localStorage', CONSENT)
    if (answer === 'si') start()
    else if (answer !== 'no') notice()
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready)
  else ready()

  // Para eventos propios desde el código de la web: DevutecMetricas.evento('reserva_cancelada')
  window.DevutecMetricas = {
    evento: function (name) { send('CUSTOM', { name: String(name || '') }) },
  }
})()
