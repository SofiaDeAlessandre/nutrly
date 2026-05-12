const { connectDB, getDB, corsHeaders, verifyToken } = require("./_db");
const { ObjectId } = require("mongodb");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: corsHeaders(), body: "" };

  const user = verifyToken(event);
  if (!user) return { statusCode: 401, headers: corsHeaders(), body: JSON.stringify({ error: "No autorizado" }) };

  const client = await connectDB();
  const db = getDB(client);

  // GET - obtener plan del mes
  if (event.httpMethod === "GET") {
    const month = event.queryStringParameters?.month; // "2026-05"
    const query = { userId: user.userId };
    if (month) query.month = month;
    const plans = await db.collection("meal_plans").find(query).sort({ month: -1 }).toArray();
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify(plans) };
  }

  // POST - crear o actualizar plan mensual
  if (event.httpMethod === "POST") {
    const { month, breakfast, morningSnack, lunch, afternoonSnack, dinner, dessert } = JSON.parse(event.body);

    if (!month) return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: "El mes es requerido (ej: 2026-05)" }) };

    const planData = {
      userId: user.userId,
      month,
      breakfast: breakfast || [],
      morningSnack: morningSnack || [],
      lunch: lunch || [],
      afternoonSnack: afternoonSnack || [],
      dinner: dinner || [],
      dessert: dessert || [],
      updatedAt: new Date(),
    };

    const result = await db.collection("meal_plans").findOneAndUpdate(
      { userId: user.userId, month },
      { $set: planData, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    );

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify(result) };
  }

  return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: "Method not allowed" }) };
};
