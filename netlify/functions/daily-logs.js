const { connectDB, getDB, corsHeaders, verifyToken } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: corsHeaders(), body: "" };

  const user = verifyToken(event);
  if (!user) return { statusCode: 401, headers: corsHeaders(), body: JSON.stringify({ error: "No autorizado" }) };

  const client = await connectDB();
  const db = getDB(client);

  // GET - obtener registros (por fecha o rango)
  if (event.httpMethod === "GET") {
    const { date, from, to } = event.queryStringParameters || {};
    const query = { userId: user.userId };

    if (date) {
      query.date = date;
    } else if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to) query.date.$lte = to;
    }

    const logs = await db.collection("daily_logs").find(query).sort({ date: -1 }).toArray();
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify(logs) };
  }

  // POST - guardar/actualizar registro del día
  if (event.httpMethod === "POST") {
    const { date, breakfast, morningSnack, lunch, afternoonSnack, dinner, dessert, mood, notes } = JSON.parse(event.body);

    if (!date) return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: "La fecha es requerida (YYYY-MM-DD)" }) };

    const logData = {
      userId: user.userId,
      date,
      breakfast: breakfast || null,
      morningSnack: morningSnack || null,
      lunch: lunch || null,
      afternoonSnack: afternoonSnack || null,
      dinner: dinner || null,
      dessert: dessert || null,
      mood: mood || null,
      notes: notes || "",
      updatedAt: new Date(),
    };

    const result = await db.collection("daily_logs").findOneAndUpdate(
      { userId: user.userId, date },
      { $set: logData, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    );

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify(result) };
  }

  return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: "Method not allowed" }) };
};
