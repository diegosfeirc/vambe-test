# Vambe Meetings 🚀

## Tabla de Contenidos

- [Overview](#overview)
- [Ejecución en Local](#ejecución-en-local)
- [Arquitectura](#arquitectura)
- [Decisiones Clave](#decisiones-clave)
- [Deployment](#deployment)

## Overview

Vambe Meetings es una plataforma de análisis inteligente que procesa transcripciones de reuniones de ventas mediante inteligencia artificial. El sistema extrae automáticamente información clave de clientes, organiza los datos en categorías precisas y genera métricas relevantes para el equipo de Vambe.

La aplicación permite subir archivos CSV con datos de reuniones, los cuales son procesados por modelos de lenguaje avanzados (Google Gemini) para clasificar leads en múltiples dimensiones estratégicas. Los resultados se visualizan en dashboards interactivos que facilitan la toma de decisiones basada en datos.

## Ejecución en Local

Para ejecutar la aplicación en modo producción localmente, sigue estos pasos:

### Prerrequisitos

- Docker y Docker Compose instalados
- Make instalado (opcional, pero recomendado)
- Archivo `.env` configurado en `vambe-backend/` con la variable `GEMINI_API_KEY`

### Pasos

1. **Clonar el repositorio** (si aún no lo has hecho):
   ```bash
   git clone <repository-url>
   cd vambe-test
   ```

2. **Configurar variables de entorno**:
   - Crea un archivo `.env` en el directorio `vambe-backend/`
   - Agrega tu API key de Google Gemini:
     ```
     GEMINI_API_KEY=tu_api_key_aqui
     ```

3. **Ejecutar en producción**:
   ```bash
   make prod
   ```
   
   Este comando construirá las imágenes Docker y levantará los contenedores en modo producción.

4. **Acceder a la aplicación**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Documentación de la API: http://localhost:8000/api-docs

### Comandos Adicionales

- `make down`: Detener los contenedores
- `make logs`: Ver logs de todos los servicios
- `make restart`: Reiniciar los contenedores
- `make clean`: Eliminar contenedores, imágenes y volúmenes

## Arquitectura

La aplicación sigue una arquitectura de microservicios con separación clara entre frontend y backend:

### Frontend
- **Framework**: Next.js 16 con React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Visualización**: Recharts para gráficos interactivos
- **Estado**: LocalStorage para persistencia de datos del cliente

### Backend
- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **IA**: Google Gemini API (gemini-2.5-flash-lite)
- **Validación**: class-validator y class-transformer

### Infraestructura
- **Containerización**: Docker y Docker Compose
- **Comunicación**: REST API con CORS habilitado
- **Health Checks**: Implementados en ambos servicios para garantizar disponibilidad

El backend procesa archivos CSV, valida los datos y utiliza la API de Gemini para clasificar leads. El frontend consume estos datos y los presenta en dashboards interactivos con capacidades de filtrado y visualización avanzada.

## Decisiones Clave

### Categorías de Clasificación

Se eligieron 6 dimensiones de clasificación que proporcionan información estratégica valiosa para el equipo de Vambe:

1. **Industria / Vertical** 🏭: Identifica qué sectores generan más leads y tienen mayor tasa de cierre, permitiendo enfocar esfuerzos de marketing y ventas en verticales más rentables.

2. **Canal de Adquisición** 📍: Muestra el origen de los leads, facilitando la identificación de canales más efectivos y la optimización del presupuesto de marketing.

3. **Volumen de Interacción** 💬: Ayuda a priorizar leads según la escala del problema que buscan resolver. Un volumen alto suele indicar mayor urgencia y disposición a pagar.

4. **Dolor Principal** ⚠️: Proporciona insights sobre las necesidades específicas de los clientes, permitiendo personalizar la propuesta de valor y el enfoque de ventas.

5. **Madurez Tecnológica** 💻: Ofrece información directa sobre el nivel de adopción tecnológica del lead, indicando qué integraciones son prioritarias para desarrollar.

6. **Urgencia** ⏰: Facilita la táctica de cierre identificando clientes con estacionalidad o deadlines claros, permitiendo priorizar esfuerzos comerciales.

### Gráficos y Secciones

La selección de visualizaciones está diseñada para maximizar el valor estratégico:

- **Gráficos de Torta (Pie Charts)**:
  - Muestran la distribución de leads en cada categoría, facilitando la identificación rápida de patrones y concentraciones
  - Permiten preparar pitches específicos por industria
  - Facilitan adaptar estrategias de cierre según el perfil del cliente
  - Ayudan a priorizar esfuerzos en las categorías que representan mayor volumen o potencial
  - Ejemplo: Si la mayoría de leads provienen de "E-commerce / Retail", el equipo puede desarrollar un mensaje de ventas especializado para ese vertical, destacando casos de uso específicos y beneficios relevantes

- **Gráfico de Tendencia de Leads**:
  - Visualiza la evolución temporal de leads por mes
  - Permite identificar estacionalidades y tendencias de crecimiento
  - Facilita planificar objetivos mensuales
  - Ayuda a anticipar períodos de alta demanda
  - Permite ajustar estrategias de seguimiento según patrones identificados
  - Ejemplo: Si se identifica un patrón estacional, pueden prepararse con anticipación, aumentando la capacidad de respuesta y mejorando las tasas de conversión durante picos de actividad

- **Gráfico de Leads por Vendedor**:
  - Facilita la gestión de equipos de ventas
  - Identifica desempeño individual y distribución de carga de trabajo
  - Permite detectar desbalances en la asignación de leads
  - Identifica oportunidades de coaching
  - Reconoce mejores prácticas de los vendedores con mayor éxito
  - Ejemplo: Si un vendedor tiene significativamente mejor tasa de cierre en ciertas categorías, se pueden compartir sus estrategias con el resto del equipo para mejorar el desempeño colectivo

- **Gráficos de Tasa de Cierre**:
  - Analizan qué categorías tienen mayor probabilidad de cierre
  - Proporcionan insights críticos para optimizar el proceso de ventas
  - Permiten priorizar tiempo y esfuerzo en leads con mayor probabilidad de conversión
  - Ejemplo: Si los leads con "Urgencia Alta" tienen una tasa de cierre del 60% versus 20% en "Urgencia Baja", el equipo puede enfocar sus recursos en leads urgentes y ajustar su estrategia de seguimiento para leads menos urgentes, optimizando así la eficiencia del proceso comercial

- **Recomendaciones 3S (Start, Stop, Spice Up)**:
  - Generadas por IA, ofrecen recomendaciones estratégicas accionables basadas en los patrones identificados en los datos
  - Transforman datos en acciones concretas para el equipo de ventas
  - Ejemplos de recomendaciones:
    - "Empezar a enfocarse en leads de alto volumen" si estos tienen mejor tasa de cierre
    - "Dejar de invertir tiempo en leads de baja urgencia sin seguimiento estructurado" si no están generando resultados
    - "Mejorar el pitch para clientes con madurez tecnológica avanzada" si se identifica una oportunidad de optimización
  - Ayudan al equipo a adaptar rápidamente sus estrategias basándose en evidencia real, mejorando continuamente el desempeño comercial

**Funcionalidad de Filtrado**:
- Todos los gráficos cuentan con funcionalidad de filtrado completo
- Permiten analizar elementos particulares y combinados para realizar análisis más profundos y específicos
- Ejemplo: El equipo de ventas puede filtrar por "Leads cerrados de industria E-commerce con alto volumen y urgencia alta" para entender mejor ese segmento específico y replicar estrategias exitosas en leads similares

Cada visualización aporta información complementaria que, en conjunto, permite una visión 360° del pipeline de ventas y facilita la toma de decisiones informadas.

## Deployment

### Frontend - Vercel

Se eligió Vercel para el despliegue del frontend debido a:

- **Integración Nativa con Next.js**: Vercel está optimizado para aplicaciones Next.js, ofreciendo despliegues automáticos desde Github, optimización de imágenes, y edge functions sin configuración adicional.

- **Performance**: CDN global y optimizaciones automáticas que garantizan tiempos de carga rápidos en cualquier ubicación.

- **Simplicidad**: Configuración mínima requerida, despliegues con un solo comando o integración automática con repositorios Git.

**Aplicación en producción**: [https://vambe-test.vercel.app/](https://vambe-test.vercel.app/)

### Backend - Render

Se eligió Render para el despliegue del backend debido a:

- **Simplicidad**: Render ofrece una experiencia de despliegue extremadamente simple. Solo necesitaba conectar el repositorio y Render detecta automáticamente el Dockerfile, construyendo y desplegando la aplicación sin configuración compleja.

- **Free Tier Generoso**: Render proporciona un tier gratuito que incluye servicios web con sleep automático, ideal para aplicaciones en desarrollo o con tráfico moderado, lo me permitió probar y desplegar sin costos iniciales.

- **Integración Nativa con Docker**: Render tiene soporte nativo para Docker, lo que significa que podemos desplegar exactamente el mismo contenedor que ejecutamos localmente, garantizando consistencia entre entornos. El proceso es tan simple como apuntar al Dockerfile y Render se encarga del resto.

> **Nota sobre Cold Start**: Render tiene un período de cold start cuando el servicio está inactivo. Esto significa que la primera subida de CSV después de un período de inactividad puede ser más lenta de lo normal. Sin embargo, una vez que el servicio está activo, las subidas posteriores de CSV son rápidas y normales.

> **Nota**: Al estar el backend completamente dockerizado, puede desplegarse de manera sencilla en cualquier otro servicio que soporte contenedores Docker, como Cloud Run de GCP, AWS ECS, Azure Container Instances, entre otros, sin necesidad de modificar el código.

**API en producción**: [https://vambe-test-backend.onrender.com/](https://vambe-test-backend.onrender.com/)

La documentación completa de la API está disponible en la ruta `/api-docs` del backend.

La combinación de Vercel para el frontend y Render para el backend proporciona una solución de despliegue completa, simple y económica para la aplicación.

