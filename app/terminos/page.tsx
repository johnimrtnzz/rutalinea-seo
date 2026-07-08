export const metadata = { title: "Términos de Servicio — Rutalinea SEO" };

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 prose">
      <h1>Términos de Servicio</h1>
      <p>Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

      <h2>1. Descripción del servicio</h2>
      <p>Rutalinea SEO es una plataforma SaaS que ofrece herramientas de investigación de palabras clave, generación de contenido asistida por IA, optimización on-page, enlazado interno y publicación en WordPress.</p>

      <h2>2. Cuenta de usuario</h2>
      <p>Para usar el servicio necesitas crear una cuenta con un email válido. Eres responsable de mantener la confidencialidad de tus credenciales.</p>

      <h2>3. Planes y facturación</h2>
      <p>El servicio se ofrece mediante suscripción mensual recurrente (planes Starter, Pro y Agency). La facturación se procesa a través de nuestro proveedor de pagos. Puedes cancelar tu suscripción en cualquier momento desde tu panel de usuario; la cancelación surtirá efecto al final del periodo ya pagado.</p>

      <h2>4. Uso aceptable</h2>
      <p>No está permitido usar el servicio para generar contenido ilegal, difamatorio, spam, o que infrinja derechos de terceros.</p>

      <h2>5. Propiedad del contenido</h2>
      <p>El contenido generado a través de la plataforma pertenece al usuario que lo genera. Rutalinea SEO no reclama derechos de propiedad sobre los artículos creados.</p>

      <h2>6. Limitación de responsabilidad</h2>
      <p>El servicio se ofrece "tal cual". No garantizamos resultados concretos de posicionamiento SEO, ya que estos dependen de factores externos fuera de nuestro control.</p>

      <h2>7. Contacto</h2>
      <p>Para cualquier consulta sobre estos términos, contacta a través del email de soporte indicado en la web.</p>
    </div>
  );
}
