# Vambe Meetings - Sistema de Análisis Inteligente de Ventas

## 📋 Descripción General

**Vambe Meetings** es una aplicación full-stack diseñada para transformar transcripciones de reuniones de ventas en insights accionables mediante inteligencia artificial. El sistema procesa archivos CSV con información de clientes y sus transcripciones, utiliza modelos de lenguaje avanzados (Google Gemini) para clasificar automáticamente a los clientes en múltiples dimensiones, y presenta los resultados mediante dashboards interactivos y visualizaciones de datos.

### Propósito del Proyecto

El sistema automatiza el análisis de leads y clientes potenciales, extrayendo información estructurada de transcripciones no estructuradas y generando recomendaciones estratégicas basadas en patrones identificados en los datos.

---

## 📑 Índice

- [📋 Descripción General](#-descripción-general)
  - [Propósito del Proyecto](#propósito-del-proyecto)
- [🏗️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
  - [Arquitectura General](#arquitectura-general)
  - [Backend (NestJS)](#backend-nestjs)
    - [Módulos Principales](#módulos-principales)
    - [Flujo de Procesamiento](#flujo-de-procesamiento)
    - [Decisiones Arquitectónicas Clave](#decisiones-arquitectónicas-clave)
  - [Frontend (Next.js)](#frontend-nextjs)
    - [Estructura de Páginas](#estructura-de-páginas)
    - [Decisiones Arquitectónicas Clave](#decisiones-arquitectónicas-clave-1)
- [🚀 Funcionalidades Principales](#-funcionalidades-principales)
  - [1. Procesamiento de Archivos CSV](#1-procesamiento-de-archivos-csv)
    - [Validación de Archivos](#validación-de-archivos)
    - [Parsing Inteligente](#parsing-inteligente)
    - [Validación de Datos](#validación-de-datos)
  - [2. Clasificación con Inteligencia Artificial](#2-clasificación-con-inteligencia-artificial)
    - [Dimensiones de Clasificación](#dimensiones-de-clasificación)
    - [Características de la Clasificación](#características-de-la-clasificación)
  - [3. Recomendaciones Estratégicas (Metodología 3S)](#3-recomendaciones-estratégicas-metodología-3s)
    - [Análisis de Datos para 3S](#análisis-de-datos-para-3s)
    - [Generación de Recomendaciones](#generación-de-recomendaciones)
  - [4. Visualizaciones y Dashboards](#4-visualizaciones-y-dashboards)
    - [Dashboard Principal](#dashboard-principal)
    - [Página de Leads](#página-de-leads)
    - [Página de Rendimiento (Close Rate)](#página-de-rendimiento-close-rate)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [DevOps & Infraestructura](#devops--infraestructura)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔌 API Endpoints](#-api-endpoints)
  - [Backend (Puerto 8000)](#backend-puerto-8000)
    - [CSV Parser](#csv-parser)
    - [AI Classification](#ai-classification)
- [⚙️ Variables de Entorno](#️-variables-de-entorno)
  - [Backend](#backend-1)
  - [Frontend](#frontend-1)
- [🚀 Instrucciones de Ejecución](#-instrucciones-de-ejecución)
  - [Prerrequisitos](#prerrequisitos)
  - [Configuración Inicial](#configuración-inicial)
  - [Ejecución con Make](#ejecución-con-make)
  - [Otros Comandos Útiles](#otros-comandos-útiles)
- [🔍 Decisiones de Diseño Clave](#-decisiones-de-diseño-clave)
- [📊 Flujo de Datos](#-flujo-de-datos)

---

## 🏗️ Arquitectura del Sistema

### Arquitectura General

El proyecto sigue una arquitectura de **microservicios** con separación clara entre backend y frontend:

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │────────▶│    Backend      │
│   (Next.js)     │  HTTP   │   (NestJS)      │
│   Puerto 3000   │◀────────│   Puerto 8000   │
└─────────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │  Google Gemini  │
                            │      API        │
                            └─────────────────┘
```

### Backend (NestJS)

**Tecnología:** NestJS (Node.js/TypeScript)  
**Puerto:** 8000  
**Arquitectura:** Modular con inyección de dependencias

#### Módulos Principales

1. **AppModule** - Módulo raíz que configura:
   - `ConfigModule` para gestión de variables de entorno
   - `CsvParserModule` para procesamiento de CSV
   - `AiClassificationModule` para clasificación con IA

2. **CsvParserModule** - Responsable de:
   - Validación y parsing de archivos CSV
   - Extracción de datos de clientes y reuniones
   - Validación de formato de columnas (flexible con múltiples variantes de nombres)
   - Manejo de errores de validación por fila

3. **AiClassificationModule** - Encargado de:
   - Clasificación de clientes usando Google Gemini AI
   - Generación de recomendaciones estratégicas (metodología 3S)
   - Validación y transformación de respuestas de la IA

#### Flujo de Procesamiento

```
1. Upload CSV → Validación de archivo (extensión, MIME type, tamaño)
2. Parse CSV → Lectura stream-based con validación por fila
3. Validación de datos → Verificación de campos obligatorios y formatos
4. Clasificación IA → Envío a Gemini API con prompt estructurado
5. Validación respuesta → Transformación y validación de clasificaciones
6. Respuesta combinada → Retorno de datos parseados + clasificaciones
```

#### Decisiones Arquitectónicas Clave

- **Streaming CSV Parser**: Uso de `csv-parser` con streams para manejar archivos grandes sin cargar todo en memoria
- **Validación Flexible**: Sistema de mapeo de columnas que acepta múltiples variantes de nombres (ej: "correo", "Correo", "Correo Electronico")
- **Separación de Responsabilidades**: Validadores, servicios y controladores claramente separados
- **Manejo Robusto de Errores**: Validación por fila con reporte detallado de errores sin detener el procesamiento completo
- **Dual Model Strategy**: Dos modelos Gemini con diferentes temperaturas:
  - Modelo de clasificación (temp: 0.1) para consistencia
  - Modelo creativo (temp: 0.7) para recomendaciones estratégicas

### Frontend (Next.js)

**Tecnología:** Next.js 16 (React 19)  
**Puerto:** 3000  
**Arquitectura:** App Router con Server/Client Components

#### Estructura de Páginas

1. **Landing Page (`/`)** - Página de inicio con:
   - Upload de archivo CSV
   - Descripción de funcionalidades
   - Interfaz de carga con feedback visual

2. **Dashboard (`/dashboard`)** - Panel principal con:
   - Gráficos de distribución (pie charts) por múltiples dimensiones
   - Gráfico de rendimiento por vendedor
   - Tendencia de leads por mes
   - Recomendaciones estratégicas 3S (Start, Stop, Spice Up)
   - Filtros dinámicos (Vendedor, Estado de cierre)

3. **Leads (`/leads`)** - Vista detallada de leads con:
   - Tabla completa de clasificaciones
   - Estadísticas resumidas (total, cerrados, tasa de cierre)
   - Filtros avanzados por todas las dimensiones
   - Búsqueda por nombre de cliente

4. **Close Rate (`/close-rate`)** - Análisis de rendimiento con:
   - Gráfico de tasa de cierre por categoría
   - Comparativa de rendimiento
   - Métricas de conversión

#### Decisiones Arquitectónicas Clave

- **Client-Side State Management**: Uso de `localStorage` para persistencia de datos entre páginas
- **Component-Based Architecture**: Componentes reutilizables y modulares
- **Responsive Design**: Diseño adaptativo con soporte móvil
- **Theme Support**: Sistema de temas claro/oscuro con `next-themes`
- **Data Visualization**: Uso de `recharts` para gráficos interactivos
- **Optimistic UI**: Feedback inmediato durante carga de archivos

---

## 🚀 Funcionalidades Principales

### 1. Procesamiento de Archivos CSV

#### Validación de Archivos
- Verificación de extensión `.csv`
- Validación de MIME type (`text/csv`, `application/csv`, `text/plain`)
- Verificación de tamaño (archivos no vacíos)
- Manejo de errores descriptivos

#### Parsing Inteligente
- **Mapeo Flexible de Columnas**: El sistema acepta múltiples variantes de nombres de columnas:
  - `correo`, `Correo`, `Correo Electronico`, `Correo Electrónico`
  - `telefono`, `Telefono`, `Teléfono`, `Numero de Telefono`
  - `fecha`, `Fecha`, `Fecha de la Reunion`, `Fecha de la Reunión`
  - `vendedor`, `Vendedor`, `Vendedor asignado`, `Vendedor Asignado`
  - `cerrado`, `Cerrado`, `closed`, `Closed`
  - `transcripcion`, `Transcripcion`, `Transcripción`

#### Validación de Datos
- **Campos Obligatorios**: nombre, correo, teléfono, vendedor, fecha, cerrado
- **Validación de Email**: Regex para formato de correo electrónico válido
- **Parsing de Booleanos**: Acepta múltiples formatos:
  - Numéricos: `1`/`0`
  - Booleanos: `true`/`false`
  - Español: `si`/`sí`/`no`
  - Inglés: `yes`/`no`
- **Reporte de Errores**: Cada fila con error se reporta individualmente sin detener el procesamiento

### 2. Clasificación con Inteligencia Artificial

#### Dimensiones de Clasificación

El sistema clasifica cada cliente en **6 dimensiones** usando Google Gemini AI:

1. **Industria / Vertical** (`industry`)
   - E-commerce / Retail
   - Salud
   - Finanzas
   - Educación
   - Turismo
   - Logística
   - Tecnología / SaaS
   - Servicios Profesionales

2. **Canal de Adquisición** (`leadSource`)
   - Evento / Conferencia
   - Referido / Boca a Boca
   - Búsqueda Web / Google
   - Contenido (Blog/Podcast/Prensa)
   - Redes Sociales

3. **Escala del Problema** (`interactionVolume`)
   - Bajo (< 500 mes)
   - Medio (500 - 2000 mes)
   - Alto (> 2000 mes)
   - Normalización automática de volúmenes semanales/diarios a mensuales

4. **Dolor Principal** (`mainPainPoint`)
   - Eficiencia / Sobrecarga
   - Experiencia / Personalización
   - Disponibilidad 24/7
   - Escalabilidad

5. **Integración Tecnológica** (`techMaturity`)
   - Gestión Manual
   - Sistema de Citas/Reservas
   - E-commerce/Plataforma
   - CRM/Soporte

6. **Urgencia / Estacionalidad** (`urgency`)
   - Alta (Temporada/Pico)
   - Media (Crecimiento constante)
   - Baja (Exploración)

#### Características de la Clasificación

- **Validación Estricta**: Validación de valores contra enums predefinidos
- **Fallbacks Inteligentes**: Valores por defecto cuando la IA retorna valores inválidos
- **Procesamiento Batch**: Clasificación de múltiples clientes en una sola llamada a la API
- **Métricas de Performance**: Tracking de tiempo de procesamiento

### 3. Recomendaciones Estratégicas (Metodología 3S)

El sistema genera recomendaciones estratégicas usando la metodología **"3 S"**:

- **Start**: Qué empezar a hacer (3 recomendaciones)
- **Stop**: Qué dejar de hacer (3 recomendaciones)
- **Spice Up**: Cómo mejorar lo que ya funciona (3 recomendaciones)

#### Análisis de Datos para 3S

El sistema analiza:
- Tasa de cierre total y por categorías
- Distribución por industria
- Distribución por fuente de leads
- Distribución por volumen de interacción
- Distribución por dolor principal
- Distribución por urgencia

#### Generación de Recomendaciones

- Uso de modelo creativo (temperatura 0.7) para mayor variabilidad
- Análisis de patrones en los datos clasificados
- Recomendaciones específicas y accionables
- Validación estricta de estructura de respuesta (exactamente 3 por categoría)

### 4. Visualizaciones y Dashboards

#### Dashboard Principal

- **Gráficos de Distribución (Pie Charts)**:
  - Por industria
  - Por fuente de leads
  - Por volumen de interacción
  - Por dolor principal
  - Por madurez tecnológica
  - Por urgencia

- **Gráfico de Rendimiento por Vendedor**:
  - Leads totales por vendedor
  - Leads cerrados por vendedor
  - Comparativa visual

- **Tendencia de Leads por Mes**:
  - Evolución temporal de leads
  - Identificación de patrones estacionales

- **Recomendaciones 3S**:
  - Visualización de recomendaciones estratégicas
  - Cards expandibles con descripciones detalladas

#### Página de Leads

- **Tabla Completa**:
  - Todas las clasificaciones con información detallada
  - Indicador visual de nivel de confianza
  - Estado de cierre destacado

- **Estadísticas Resumidas**:
  - Total de leads
  - Leads cerrados
  - Tasa de cierre porcentual

- **Filtros Avanzados**:
  - Por vendedor
  - Por estado de cierre
  - Por industria
  - Por fuente
  - Por volumen
  - Por dolor principal
  - Por madurez tecnológica
  - Por urgencia

- **Búsqueda**:
  - Búsqueda en tiempo real por nombre de cliente

#### Página de Rendimiento (Close Rate)

- **Gráfico de Tasa de Cierre**:
  - Por categoría
  - Comparativa visual
  - Métricas de conversión

---

## 🛠️ Stack Tecnológico

### Backend

- **Framework**: NestJS 11.x
- **Lenguaje**: TypeScript 5.7
- **Runtime**: Node.js 22
- **IA/ML**: Google Generative AI (Gemini 2.5 Flash Lite)
- **Parsing**: csv-parser 3.2.0
- **Validación**: class-validator, class-transformer
- **Configuración**: @nestjs/config
- **CORS**: Configurado para comunicación con frontend

### Frontend

- **Framework**: Next.js 16.0.3
- **Lenguaje**: TypeScript 5
- **UI Library**: React 19.2
- **Estilos**: Tailwind CSS 4
- **Componentes**: Radix UI
- **Gráficos**: Recharts 3.4.1
- **HTTP Client**: Axios 1.13.2
- **Notificaciones**: Sonner 2.0.7
- **Iconos**: Lucide React 0.554.0
- **Temas**: next-themes 0.4.6

### DevOps & Infraestructura

- **Containerización**: Docker
- **Orquestación**: Docker Compose
- **Build Tool**: Make
- **Health Checks**: Implementados en ambos servicios
- **Networking**: Red bridge personalizada (`vambe-network`)

---

## 📁 Estructura del Proyecto

```
vambe-test/
├── docker-compose.yml          # Configuración de servicios Docker
├── Makefile                    # Comandos de automatización
├── README.md                   # Este archivo
│
├── vambe-backend/              # Backend NestJS
│   ├── src/
│   │   ├── main.ts            # Punto de entrada
│   │   ├── app.module.ts      # Módulo raíz
│   │   ├── csv-parser/        # Módulo de procesamiento CSV
│   │   │   ├── csv-parser.controller.ts
│   │   │   ├── csv-parser.service.ts
│   │   │   ├── csv-parser.module.ts
│   │   │   ├── dto/           # Data Transfer Objects
│   │   │   ├── interfaces/    # Interfaces TypeScript
│   │   │   └── validators/    # Validadores de datos
│   │   └── ai-classification/ # Módulo de clasificación IA
│   │       ├── ai-classification.controller.ts
│   │       ├── ai-classification.service.ts
│   │       ├── ai-classification.module.ts
│   │       ├── dto/           # DTOs de request/response
│   │       └── interfaces/    # Interfaces de clasificación
│   ├── Dockerfile             # Imagen Docker del backend
│   ├── package.json
│   └── tsconfig.json
│
└── vambe-frontend/            # Frontend Next.js
    ├── src/
    │   ├── app/               # App Router de Next.js
    │   │   ├── page.tsx      # Landing page
    │   │   ├── dashboard/    # Dashboard principal
    │   │   ├── leads/        # Vista de leads
    │   │   └── close-rate/   # Análisis de rendimiento
    │   ├── components/        # Componentes React
    │   │   ├── Dashboard/    # Componentes del dashboard
    │   │   ├── Leads/        # Componentes de leads
    │   │   ├── Landing/      # Componentes de landing
    │   │   └── ui/           # Componentes UI base
    │   ├── server/           # Server actions/utilities
    │   └── utils/            # Utilidades y helpers
    ├── Dockerfile            # Imagen Docker del frontend
    ├── package.json
    └── next.config.ts
```

---

## 🔌 API Endpoints

### Backend (Puerto 8000)

#### CSV Parser

**POST** `/csv-parser/upload-and-classify`
- **Descripción**: Sube un archivo CSV, lo parsea y clasifica los clientes con IA
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `file`: Archivo CSV (form-data)
- **Response**: 
  ```typescript
  {
    parseResult: {
      totalRows: number;
      validRows: number;
      errors: ValidationError[];
    };
    classification: {
      totalClients: number;
      classifications: ClientClassification[];
      processingTime: number;
    } | null;
    data: ClientMeeting[];
  }
  ```

#### AI Classification

**POST** `/ai-classification/classify`
- **Descripción**: Clasifica una lista de clientes usando IA
- **Body**:
  ```typescript
  {
    clients: ClientMeeting[];
  }
  ```
- **Response**:
  ```typescript
  {
    totalClients: number;
    classifications: ClientClassification[];
    processingTime: number;
  }
  ```

**POST** `/ai-classification/three-s`
- **Descripción**: Genera recomendaciones estratégicas 3S
- **Body**:
  ```typescript
  {
    classifications: ClientClassification[];
  }
  ```
- **Response**:
  ```typescript
  {
    start: Array<{ title: string; description: string }>;
    stop: Array<{ title: string; description: string }>;
    spiceUp: Array<{ title: string; description: string }>;
    processingTime: number;
  }
  ```

---

## ⚙️ Variables de Entorno

### Backend

Crear archivo `.env` en `vambe-backend/`:

```env
# Puerto del servidor
PORT=8000

# URL del frontend (separadas por comas para múltiples orígenes)
FRONTEND_URL=http://localhost:3000,http://frontend:3000

# API Key de Google Gemini (OBLIGATORIO)
GEMINI_API_KEY=tu_api_key_aqui
```

### Frontend

Las variables de entorno del frontend se configuran en `docker-compose.yml`:

```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Instrucciones de Ejecución

### Prerrequisitos

- **Docker** y **Docker Compose** instalados
- **Make** instalado (generalmente incluido en sistemas Unix/macOS)
- **API Key de Google Gemini** (obtener en [Google AI Studio](https://makersuite.google.com/app/apikey))

### Configuración Inicial

1. **Clonar el repositorio** (si aplica):
   ```bash
   git clone <repository-url>
   cd vambe-test
   ```

2. **Configurar variables de entorno del backend**:
   ```bash
   cd vambe-backend
   cp .env.example .env  # Si existe un ejemplo
   # O crear manualmente:
   touch .env
   ```
   
   Editar `vambe-backend/.env` y agregar:
   ```env
   PORT=8000
   FRONTEND_URL=http://localhost:3000,http://frontend:3000
   GEMINI_API_KEY=tu_api_key_de_gemini_aqui
   ```

3. **Verificar configuración de Docker**:
   - Asegurarse de que Docker Desktop esté ejecutándose
   - Verificar que los puertos 3000 y 8000 estén disponibles

### Ejecución con Make

El proyecto incluye un `Makefile` con comandos útiles. Para ejecutar en producción:

```bash
make prod
```

Este comando:
1. Construye las imágenes Docker de backend y frontend
2. Inicia los contenedores en modo detached
3. Muestra las URLs de acceso

**URLs de acceso:**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

### Otros Comandos Útiles

```bash
# Ver ayuda con todos los comandos disponibles
make help

# Ver logs de todos los servicios
make logs

# Ver logs solo del backend
make logs-backend

# Ver logs solo del frontend
make logs-frontend

# Detener los contenedores
make down

# Reiniciar los contenedores
make restart

# Ver estado de los contenedores
make status

# Limpiar todo (contenedores, imágenes, volúmenes)
make clean

# Reconstruir sin caché
make rebuild

# Acceder al shell del backend
make shell-backend

# Acceder al shell del frontend
make shell-frontend
```

## 🔍 Decisiones de Diseño Clave

### 1. Arquitectura Modular (NestJS)

**Decisión**: Uso de módulos independientes (CsvParserModule, AiClassificationModule)  
**Razón**: Facilita mantenimiento, testing y escalabilidad. Cada módulo tiene responsabilidades claras.

### 2. Validación Flexible de Columnas CSV

**Decisión**: Sistema de mapeo que acepta múltiples variantes de nombres de columnas  
**Razón**: Los CSVs pueden venir de diferentes fuentes con diferentes convenciones de nombres. Esto mejora la usabilidad sin requerir estandarización estricta.

### 3. Procesamiento Stream-Based

**Decisión**: Uso de streams para parsing de CSV  
**Razón**: Permite manejar archivos grandes sin cargar todo en memoria, mejorando performance y escalabilidad.

### 4. Dual Model Strategy para IA

**Decisión**: Dos modelos Gemini con diferentes temperaturas  
**Razón**: 
- Clasificación requiere consistencia (temp: 0.1)
- Recomendaciones requieren creatividad (temp: 0.7)

### 5. Client-Side State Management

**Decisión**: Uso de localStorage en lugar de base de datos  
**Razón**: Para este MVP, la persistencia en cliente es suficiente. Los datos se mantienen durante la sesión del navegador.

### 6. Validación Estricta de Respuestas de IA

**Decisión**: Validación exhaustiva de respuestas de Gemini con fallbacks  
**Razón**: Las APIs de IA pueden retornar formatos inesperados. La validación garantiza integridad de datos.

### 7. Health Checks en Docker

**Decisión**: Health checks configurados en ambos servicios  
**Razón**: Permite que Docker Compose espere a que los servicios estén listos antes de iniciar dependencias.

### 8. Multi-Stage Docker Builds

**Decisión**: Dockerfiles con múltiples stages  
**Razón**: Reduce tamaño de imágenes finales, separando dependencias de desarrollo de producción.

---

## 📊 Flujo de Datos

```
Usuario sube CSV
    ↓
Frontend valida archivo localmente
    ↓
POST /csv-parser/upload-and-classify
    ↓
Backend valida archivo (extensión, MIME, tamaño)
    ↓
Parse CSV con validación por fila
    ↓
Si hay filas válidas → Clasificación con Gemini AI
    ↓
Validación y transformación de clasificaciones
    ↓
Respuesta combinada (parse + classification)
    ↓
Frontend almacena en localStorage
    ↓
Navegación a Dashboard
    ↓
Visualización de datos y gráficos
    ↓
Generación de recomendaciones 3S
```
