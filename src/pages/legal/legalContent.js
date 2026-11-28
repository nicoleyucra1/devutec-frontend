import { SUPPORT_EMAIL } from '../../components/support/faq'

export const LEGAL_DOCS = {
  terms: {
    kicker: 'LEGAL',
    title: 'Términos y condiciones',
    updated: '14 de noviembre de 2026',
    sections: [
      {
        heading: 'Qué es DEVUTEC',
        paragraphs: [
          'DEVUTEC es una plataforma que conecta a negocios (clientes) con estudiantes y egresados (freelancers) para proyectos de desarrollo de software.',
          'Al crear una cuenta, aceptas estos términos. Si no estás de acuerdo, no uses la plataforma.',
        ],
      },
      {
        heading: 'Cuentas',
        paragraphs: [
          'Cada persona puede tener una sola cuenta y es responsable de mantener su contraseña en secreto.',
          'La información de tu perfil debe ser real. DEVUTEC puede suspender cuentas con datos falsos o que incumplan estos términos.',
        ],
      },
      {
        heading: 'Proyectos y postulaciones',
        paragraphs: [
          'El cliente publica un proyecto con su descripción, presupuesto y fecha límite. Los freelancers pueden postular con una propuesta.',
          'El cliente elige libremente qué postulación acepta. Al aceptar una, se crea un contrato entre ambas partes.',
        ],
      },
      {
        heading: 'Pago en garantía',
        paragraphs: [
          'Al aceptar una postulación, el cliente paga el monto del contrato y DEVUTEC lo retiene en garantía.',
          'El pago se libera al freelancer solo cuando el cliente confirma la entrega del trabajo.',
          'El cliente puede cancelar mientras no exista una entrega. En ese caso, el monto se le reembolsa completo.',
        ],
      },
      {
        heading: 'Reseñas',
        paragraphs: [
          'Cuando un contrato se confirma, cada parte puede dejar una reseña pública de la otra. Las reseñas deben ser honestas y respetuosas.',
        ],
      },
      {
        heading: 'Conducta',
        paragraphs: [
          'Está prohibido publicar contenido ilegal, ofensivo o engañoso, y acordar pagos por fuera de la plataforma para evitar la garantía.',
          'Antes de que exista un contrato no se pueden compartir datos de contacto (celular, correo o redes) en proyectos ni postulaciones. DEVUTEC no comparte los celulares de cliente y estudiante: todo se coordina dentro de la plataforma.',
          'Durante los 12 meses siguientes a conocerse en DEVUTEC, un cliente y un estudiante no pueden contratarse ni pagarse por fuera de la plataforma. Los textos que lo intenten se bloquean y quedan registrados.',
          'Cualquier persona puede reportar a la otra parte de su contrato o postulación. Según la gravedad y si se repite, DEVUTEC puede dar una advertencia, suspender la cuenta o cerrarla.',
        ],
      },
      {
        heading: 'Contacto',
        paragraphs: [`Si tienes dudas sobre estos términos, escríbenos a ${SUPPORT_EMAIL}.`],
      },
    ],
  },
  privacy: {
    kicker: 'LEGAL',
    title: 'Política de privacidad',
    updated: '14 de noviembre de 2026',
    sections: [
      {
        heading: 'Qué datos guardamos',
        paragraphs: [
          'Tu nombre, correo, contraseña (cifrada, nunca la vemos), tu rol y, si eres freelancer, los datos de tu perfil: universidad, ciclo, tarifa, portafolio y usuario de GitHub.',
          'También guardamos los proyectos, postulaciones, contratos, pagos y reseñas que creas en la plataforma.',
        ],
      },
      {
        heading: 'Para qué los usamos',
        paragraphs: [
          'Para que funcione la plataforma: mostrar tu perfil, gestionar contratos y pagos en garantía, y enviarte correos sobre tus postulaciones, contratos y pagos.',
          'No vendemos ni compartimos tus datos con terceros con fines publicitarios.',
        ],
      },
      {
        heading: 'Quién puede verlos',
        paragraphs: [
          'Tu perfil de freelancer y tus reseñas son públicos para los usuarios de DEVUTEC. Tu correo y tu contraseña no se muestran a nadie.',
          'El equipo administrador de DEVUTEC puede ver los pagos para supervisar la garantía.',
        ],
      },
      {
        heading: 'Permisos de la app móvil',
        paragraphs: [
          'La app puede pedir tu ubicación (para mostrar proyectos cercanos), la cámara (para escanear códigos QR de perfiles) y tu huella o rostro (para entrar más rápido). Todos son opcionales y puedes quitarlos desde los ajustes de tu teléfono.',
        ],
      },
      {
        heading: 'Tus derechos',
        paragraphs: [
          `De acuerdo con la Ley N.° 29733, Ley de Protección de Datos Personales del Perú, puedes pedir acceder, corregir o eliminar tus datos escribiendo a ${SUPPORT_EMAIL}.`,
        ],
      },
    ],
  },
}