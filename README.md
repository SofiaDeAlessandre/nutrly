# 🍓 Nutrly — Tu diario nutricional inteligente

App de seguimiento nutricional personal con IA.  
**Proyecto Final — programa esencIA (Google.org)**  
🌐 **[nutrly.netlify.app](https://nutrly.netlify.app)**

---

## ¿Qué es Nutrly?

Nutrly es una app web que permite a usuarias registrar sus comidas diarias eligiendo entre las opciones de su plan alimentario mensual. La IA analiza los registros y genera resúmenes semanales y mensuales personalizados, considerando condiciones digestivas e intolerancias de cada persona.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18, React Router, Recharts |
| Estilos | CSS Variables (dark theme violeta + aqua) |
| Backend | Netlify Functions (serverless) |
| Base de datos | MongoDB Atlas |
| Autenticación | JWT + bcrypt |
| IA | Groq API — modelo Llama 3.3 70B |
| Deploy | Netlify (CI/CD desde GitHub) |
| Keep-alive | cron-job.org (ping cada 12 horas) |

---

## Funcionalidades

- 🔐 Login / Registro con JWT (acceso por whitelist de emails)
- 🍽️ Registro diario de comidas: desayuno, colación mañana, almuerzo, merienda, cena y postre
- 📋 Plan mensual: cargá las opciones de tu nutricionista por tipo de comida
- ✨ Resumen semanal y mensual generado por IA (Groq / Llama 3.3 70B)
- ⚖️ Registro de peso con gráfico de evolución
- 🫁 Perfil de salud digestiva: intolerancias y condiciones (privado)
- 😄 Estado de ánimo y notas diarias
- 🔒 Datos de salud privados — nunca compartidos con terceros

---

## Pantallas

| Pantalla | Descripción |
|---|---|
| **Hoy** | Registrá tus comidas del día |
| **Mi Plan** | Cargá las opciones del plan mensual |
| **Historial** | Revisá registros + resumen IA semanal/mensual |
| **Peso** | Gráfico de evolución de peso |
| **Perfil** | Salud digestiva, intolerancias y datos personales |

---

## Base de datos — MongoDB Atlas

Base de datos: `nutrly` (cluster: SofiaDev)

| Colección | Descripción | Estado |
|---|---|---|
| `allowed_emails` | Emails habilitados para registrarse | ✅ Creada |
| `users` | Usuarias registradas | ✅ Creada |
| `daily_logs` | Registro diario de comidas | ✅ Creada |
| `meal_plans` | Plan mensual por usuaria | Se crea al cargar el primer plan |
| `weight_logs` | Historial de peso | Se crea al registrar el primer peso |
| `ai_summaries` | Caché de resúmenes de IA (12hs) | Se crea al generar el primer resumen |

---

## Variables de entorno

Crear `.env.local` en la raíz con:

```
MONGODB_URI=mongodb+srv://sdealessandre:PASSWORD@sofiadev.gt9diq0.mongodb.net/nutrly?appName=SofiaDev
JWT_SECRET=tu_clave_secreta
GROQ_API_KEY=gsk_...
```

En Netlify → **Site settings → Environment variables** cargar las mismas 3 variables.

---

## Estructura del proyecto

```
nutrly/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── layout/       → Layout con nav responsivo
│   │   └── pages/        → Hoy, Mi Plan, Historial, Peso, Perfil
│   ├── context/          → AuthContext (JWT)
│   ├── utils/
│   │   ├── api.js        → Llamadas a Netlify Functions
│   │   └── dates.js      → Helpers de fechas en español
│   ├── App.js            → Rutas
│   └── index.css         → Design tokens dark (violeta + aqua)
├── netlify/
│   └── functions/
│       ├── _db.js              → Conexión MongoDB
│       ├── auth-login.js       → POST /api/auth-login
│       ├── auth-register.js    → POST /api/auth-register
│       ├── meal-plans.js       → GET/POST /api/meal-plans
│       ├── daily-logs.js       → GET/POST /api/daily-logs
│       ├── weight-logs.js      → GET/POST/DELETE /api/weight-logs
│       ├── profile.js          → GET/PUT /api/profile
│       └── ai-summary.js       → POST /api/ai-summary (Groq API)
├── scripts/
│   ├── seed-mongodb.js         → Setup inicial de la BD
│   └── add-email.js            → Agregar email habilitado
├── .env.example
├── .gitignore
├── netlify.toml
└── package.json
```

---

## Gestión de acceso

Los emails autorizados se guardan en la colección `allowed_emails`. Para agregar una usuaria nueva, insertar un documento en Atlas:

```json
{
  "email": "nueva@email.com",
  "name": "Nombre",
  "addedAt": { "$date": "2026-05-12T00:00:00Z" }
}
```

O usar el script:
```bash
node scripts/add-email.js nueva@email.com "Nombre Apellido"
```

---

## Diseño

**Paleta:** Violeta oscuro (`#0f0a24`) con detalles en verde aqua (`#00d4b4`) y violeta (`#9d5fff`).  
Los colores son variables CSS en `src/index.css` — fácil de personalizar.

**Responsive:** Mobile-first con 4 breakpoints:
- 📱 Mobile (base)
- 📱 Landscape (≥568px)
- 📟 Tablet (≥768px) — nav lateral
- 💻 Desktop (≥1024px) — nav expandida con labels
- 🖥️ Large desktop (≥1440px)

---

## Seguridad y privacidad

- Contraseñas hasheadas con **bcrypt** (salt 12)
- Autenticación por **JWT** con expiración de 7 días
- Sistema de **whitelist**: solo emails habilitados pueden registrarse
- Datos de salud **privados**: condiciones digestivas, intolerancias y peso solo visibles para la usuaria
- **Nunca se comparten** datos con terceros

---

## Correr localmente

```bash
# 1. Instalar dependencias del frontend
npm install

# 2. Instalar dependencias del backend
cd netlify/functions && npm install && cd ../..

# 3. Crear .env.local con las variables de entorno

# 4. Levantar en desarrollo
npm run dev
# → abre http://localhost:8888
```

> ⚠️ Para desarrollo local, conectarse al hotspot del celular si el WiFi bloquea el puerto de MongoDB.

---

## Deploy

El proyecto se deploya automáticamente en Netlify al hacer push a `main`.

Para deploy manual:
```bash
git add .
git commit -m "descripción del cambio"
git push
```

---

*Proyecto desarrollado por Sofía De Alessandre para el programa esencIA — Google.org*  
*Entrega: 12 de mayo de 2026*  
*Desarrollado con React + Netlify Functions + MongoDB + Groq IA*