import { CategoryDescription } from "@/components/Dashboard/PieChart/Tooltip/interfaces";

export const categoryDescriptions: Record<string, CategoryDescription> = {
    'Industria': {
      title: 'Industria',
      description: 'Clasificación de los leads según el sector industrial al que pertenecen. Permite identificar qué sectores tienen mayor número de leads/cierre para enfocar los esfuerzos de marketing y ventas.'
    },
    'Fuente de Lead': {
      title: 'Fuente de Lead',
      description: 'Origen o canal por el cual se obtuvo el lead. Permite identificar qué fuentes generan más oportunidades y dónde enfocar los esfuerzos de marketing.'
    },
    'Volumen de Interacción': {
      title: 'Volumen de Interacción',
      description: 'Cantidad de interacciones que el cliente intenta automatizar. Ayuda a priorizar leads. Un volumen alto suele implicar mayor urgencia y mayor disposición a pagar'
    },
    'Dolor Principal': {
      title: 'Dolor Principal',
      description: 'Problema o necesidad principal que el lead está buscando resolver. Esta información es clave para personalizar la propuesta de valor y el enfoque de ventas.'
    },
    'Madurez Tecnológica': {
      title: 'Madurez Tecnológica',
      description: 'Nivel de adopción y sofisticación tecnológica de la empresa del lead. Input directo sobre qué integraciones son prioritarias para construir.'
    },
    'Urgencia': {
      title: 'Urgencia',
      description: 'Nivel de urgencia percibido para resolver el problema o necesidad. Táctica de cierre. Los clientes con estacionalidad tienen una fecha límite ("deadline") clara para comprar.'
    }
};