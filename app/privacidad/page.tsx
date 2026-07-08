export const metadata = { title: "Política de Privacidad — Rutalinea SEO" };

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 prose">
      <h1>Política de Privacidad</h1>
      <p>Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

      <h2>1. Datos que recopilamos</h2>
      <p>Recopilamos tu email, contraseña (cifrada), y los datos necesarios para prestar el servicio (URLs de WordPress conectadas, palabras clave, artículos generados).</p>

      <h2>2. Uso de los datos</h2>
      <p>Usamos tus datos exclusivamente para prestar el servicio contratado, procesar pagos y comunicarnos contigo sobre tu cuenta.</p>

      <h2>3. Proveedores externos</h2>
      <p>Usamos Supabase (base de datos y autenticación), Vercel (alojamiento), Anthropic (generación de contenido con IA) y un proveedor de pagos para procesar suscripciones. Estos proveedores procesan datos en nuestro nombre bajo sus propias políticas de seguridad.</p>

      <h2>4. Tus derechos</h2>
      <p>Puedes solicitar acceso, rectificación o eliminación de tus datos personales en cualquier momento, conforme al Reglamento General de Protección de Datos (RGPD), escribiendo al email de contacto de la web.</p>

      <h2>5. Conservación de datos</h2>
      <p>Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, tus datos personales se eliminan en un plazo razonable, salvo obligación legal de conservación.</p>
    </div>
  );
}
