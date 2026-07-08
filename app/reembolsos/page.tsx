export const metadata = { title: "Política de Reembolsos — Rutalinea SEO" };

export default function ReembolsosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 prose">
      <h1>Política de Reembolsos</h1>
      <p>Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

      <h2>1. Suscripciones mensuales</h2>
      <p>Las suscripciones se facturan por adelantado cada mes. Puedes cancelar en cualquier momento desde tu panel; seguirás teniendo acceso hasta el final del periodo ya pagado, sin renovación posterior.</p>

      <h2>2. Reembolsos</h2>
      <p>Si consideras que ha habido un error de facturación o un problema grave con el servicio, contacta con nosotros dentro de los 14 días siguientes al cobro. Evaluaremos cada caso individualmente.</p>

      <h2>3. Derecho de desistimiento (UE)</h2>
      <p>Si eres consumidor dentro de la Unión Europea, dispones de 14 días naturales desde la contratación para ejercer tu derecho de desistimiento, salvo que hayas comenzado a usar activamente el servicio digital con tu consentimiento expreso.</p>
    </div>
  );
}
