const { connectDB, getDB, corsHeaders, verifyToken } = require("./_db");
const { ObjectId } = require("mongodb");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: corsHeaders(), body: "" };

  const user = verifyToken(event);
  if (!user) return { statusCode: 401, headers: corsHeaders(), body: JSON.stringify({ error: "No autorizado" }) };

  const client = await connectDB();
  const db = getDB(client);

  if (event.httpMethod === "GET") {
    const logs = await db.collection("weight_logs")
      .find({ userId: user.userId })
      .sort({ date: 1 })
      .toArray();
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify(logs) };
  }

  if (event.httpMethod === "POST") {
    const { date, weight, note } = JSON.parse(event.body);
    if (!date || !weight) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: "Fecha y peso requeridos" }) };
    }

    const result = await db.collection("weight_logs").insertOne({
      userId: user.userId,
      date,
      weight: parseFloat(weight),
      note: note || "",
      createdAt: new Date(),
    });

    return { statusCode: 201, headers: corsHeaders(), body: JSON.stringify({ _id: result.insertedId, date, weight, note }) };
  }

  if (event.httpMethod === "DELETE") {
    const { id } = event.queryStringParameters || {};
    if (!id) return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: "ID requerido" }) };

    await db.collection("weight_logs").deleteOne({ _id: new ObjectId(id), userId: user.userId });
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: "Method not allowed" }) };
};
