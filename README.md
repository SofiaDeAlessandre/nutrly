# 🍓 Nutrly — Proyecto Final esencIA

App de seguimiento nutricional personal con IA.  
**Stack:** React · Netlify Functions · MongoDB Atlas · Claude API

---

## 🚀 Pasos para levantar el proyecto

### 1. Prerequisitos
- Node.js 18+ instalado
- Cuenta en [MongoDB Atlas](https://cloud.mongodb.com) (gratis)
- Cuenta en [Netlify](https://netlify.com) (gratis)
- API Key de [Anthropic](https://console.anthropic.com)

---

### 2. Instalar dependencias

```bash
# Dependencias del frontend (React)
npm install

# Dependencias de las Netlify Functions
cd netlify/functions
npm install
cd ../..
```

---

### 3. Configurar variables de entorno

Copiá `.env.example` como `.env.local` en la raíz:

```bash
cp .env.example .env.local
```

Completá los valores:

```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/nutriapp
JWT_SECRET=una_clave_secreta_larga_y_aleatoria
ANTHROPIC_API_KEY=sk-ant-...
```

---

### 4. Crear la base de datos en MongoDB Atlas

1. Creá un cluster gratuito en [MongoDB Atlas](https://cloud.mongodb.com)
2. Creá un usuario de base de datos (Database Access)
3. Permitís acceso desde cualquier IP: `0.0.0.0/0` (Network Access)
4. Copiás el connection string en `MONGODB_URI`
5. Corré el script de seed para crear colecciones e índices:

```bash
node scripts/seed-mongodb.js
```

Este script crea:
- Colección `allowed_emails` con el email de test de la profesora
- Índices necesarios para performance
- Estructura inicial de las colecciones

---

### 5. Correr en desarrollo local

Necesitás `netlify-cli` instalado globalmente:

```bash
npm install -g netlify-cli
```

Luego:

```bash
netlify dev
```

Esto levanta React en el puerto 3000 y las Functions en el puerto 8888 simultáneamente.

---

### 6. Deploy en Netlify

#### Opción A — Desde la interfaz de Netlify (recomendado)
1. Subís el proyecto a GitHub
2. En Netlify: **Add new site → Import an existing project**
3. Conectás el repositorio
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
5. En **Site settings → Environment variables** agregás:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ANTHROPIC_API_KEY`
6. Deploy!

#### Opción B — Desde la terminal
```bash
netlify deploy --prod
```

---

## 📧 Gestión de acceso (emails habilitados)

Los emails autorizados se guardan en la colección `allowed_emails` de MongoDB.

Para agregar un email nuevo, podés usar MongoDB Compass o Atlas UI:

```json
{
  "email": "nueva.usuaria@gmail.com",
  "name": "Nombre de la usuaria",
  "addedAt": { "$date": "2026-05-12T00:00:00Z" }
}
```

O ejecutar el script:
```bash
node scripts/add-email.js nueva.usuaria@gmail.com "Nombre Apellido"
```

---

## 🗂️ Estructura del proyecto

```
nutriapp/
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
│   └── index.css         → Design tokens + estilos globales
├── netlify/
│   └── functions/
│       ├── _db.js              → Conexión MongoDB compartida
│       ├── auth-login.js       → POST /api/auth-login
│       ├── auth-register.js    → POST /api/auth-register
│       ├── meal-plans.js       → GET/POST /api/meal-plans
│       ├── daily-logs.js       → GET/POST /api/daily-logs
│       ├── weight-logs.js      → GET/POST/DELETE /api/weight-logs
│       ├── profile.js          → GET/PUT /api/profile
│       └── ai-summary.js       → POST /api/ai-summary (Claude API)
├── scripts/
│   ├── seed-mongodb.js         → Setup inicial de la base de datos
│   └── add-email.js            → Agregar email habilitado
├── netlify.toml
└── package.json
```

---

## 🗃️ Colecciones MongoDB

| Colección | Descripción |
|---|---|
| `users` | Usuarias registradas (sin passwordHash en respuestas) |
| `allowed_emails` | Emails habilitados para registrarse |
| `meal_plans` | Plan mensual por usuaria |
| `daily_logs` | Registro diario de comidas |
| `weight_logs` | Historial de peso |
| `ai_summaries` | Caché de resúmenes de IA (válidos 12hs) |

---

## 🎨 Design tokens

Los colores son variables CSS en `src/index.css`. Para cambiar la paleta:

```css
:root {
  --color-primary: var(--mint-500);   /* Verde menta */
  --color-accent:  var(--violet-500); /* Violeta */
  --color-highlight: var(--berry-400); /* Frambuesa (frutilla) */
}
```

---

## 🔒 Privacidad y seguridad

- Passwords hasheados con bcrypt (salt 12)
- Autenticación por JWT con expiración de 7 días
- Datos de salud (condiciones digestivas, intolerancias, peso) son privados
- Nunca se comparten con terceros
- Solo la usuaria puede ver y editar sus datos
- Sistema de whitelist: solo emails habilitados pueden registrarse

---

## 🤖 Uso de Claude API

La IA se usa en:
- **Resumen semanal**: analiza los registros de comidas de la semana
- **Resumen mensual**: análisis más profundo del mes
- Considera las condiciones digestivas e intolerancias de la usuaria
- Cache de 12hs para no repetir llamadas innecesarias

---

*Proyecto desarrollado para el programa esencIA — Google.org*  
*Entrega: 12 de mayo de 2026*
