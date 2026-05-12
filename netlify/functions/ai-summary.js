const Anthropic = require("@anthropic-ai/sdk");
const { connectDB, getDB, corsHeaders, verifyToken } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: corsHeaders(), body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: "Method not allowed" }) };

  const user = verifyToken(event);
  if (!user) return { statusCode: 401, headers: corsHeaders(), body: JSON.stringify({ error: "No autorizado" }) };

  const client = await connectDB();
  const db = getDB(client);

  const { period, startDate, endDate } = JSON.parse(event.body); // period: "weekly" | "monthly"

  // Verificar caché
  const cached = await db.collection("ai_summaries").findOne({
    userId: user.userId,
    period,
    startDate,
  });

  if (cached && cached.generatedAt) {
    const ageHours = (Date.now() - new Date(cached.generatedAt).getTime()) / 3600000;
    if (ageHours < 12) {
      return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ summary: cached.summary, fromCache: true }) };
    }
  }

  // Buscar registros del período
  const logs = await db.collection("daily_logs").find({
    userId: user.userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 }).toArray();

  if (logs.length === 0) {
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ summary: "No hay registros en este período para analizar.", fromCache: false }) };
  }

  // Obtener perfil del usuario para contexto
  const userProfile = await db.collection("users").findOne(
    { _id: require("mongodb").ObjectId.createFromHexString(user.userId) },
    { projection: { name: 1, digestiveConditions: 1, intolerances: 1, digestiveNotes: 1 } }
  );

  // Armar resumen de datos para la IA
  const MEAL_LABELS = {
    breakfast: "Desayuno",
    morningSnack: "Colación mañana",
    lunch: "Almuerzo",
    afternoonSnack: "Merienda",
    dinner: "Cena",
    dessert: "Postre",
  };

  const logsText = logs.map((log) => {
    const meals = Object.entries(MEAL_LABELS)
      .map(([key, label]) => log[key] ? `  - ${label}: ${log[key]}` : null)
      .filter(Boolean)
      .join("\n");
    return `📅 ${log.date}:\n${meals || "  (sin registro)"}${log.mood ? `\n  Estado de ánimo: ${log.mood}` : ""}${log.notes ? `\n  Notas: ${log.notes}` : ""}`;
  }).join("\n\n");

  const conditionsText = userProfile?.digestiveConditions?.length
    ? `Condiciones digestivas: ${userProfile.digestiveConditions.join(", ")}`
    : "";
  const intolerancesText = userProfile?.intolerances?.length
    ? `Intolerancias: ${userProfile.intolerances.join(", ")}`
    : "";

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `Sos una asistente nutricional empática y motivadora. Analizá el registro alimentario ${period === "weekly" ? "semanal" : "mensual"} de ${userProfile?.name || "la usuaria"} y generá un resumen amigable en español argentino.

DATOS DE SALUD:
${conditionsText}
${intolerancesText}
${userProfile?.digestiveNotes ? `Notas adicionales: ${userProfile.digestiveNotes}` : ""}

REGISTRO DE COMIDAS (${startDate} al ${endDate}):
${logsText}

Por favor incluí:
1. 📊 Resumen general de la semana/mes
2. ✅ Patrones positivos detectados
3. 🔄 Repeticiones frecuentes (si las hay)
4. 💡 Sugerencias constructivas (máximo 3, considerando las condiciones de salud si las hay)
5. 🌟 Un mensaje motivador final

Sé concisa, cálida y práctica. Evitá ser alarmista. Máximo 400 palabras.`,
      },
    ],
  });

  const summary = message.content[0].text;

  // Guardar en caché
  await db.collection("ai_summaries").findOneAndUpdate(
    { userId: user.userId, period, startDate },
    { $set: { userId: user.userId, period, startDate, endDate, summary, generatedAt: new Date() } },
    { upsert: true }
  );

  return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ summary, fromCache: false }) };
};
