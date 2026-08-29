export function buildAccessEmail({ pageUrl, password }) {
  const subject = 'Tu acceso al Taller de Productividad Personal';

  const text = `¡Gracias por tu compra!

Ya puedes acceder al contenido del Taller de Productividad Personal:

${pageUrl}

Contraseña de acceso: ${password}

Un saludo,
Laura`;

  const html = `<p>¡Gracias por tu compra!</p>
<p>Ya puedes acceder al contenido del Taller de Productividad Personal:</p>
<p><a href="${pageUrl}">${pageUrl}</a></p>
<p>Contraseña de acceso: <strong>${password}</strong></p>
<p>Un saludo,<br>Laura</p>`;

  return { subject, text, html };
}
