const { connectDB, getDB, corsHeaders, verifyToken } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: corsHeaders(), body: "" };

  const user = verifyToken(event);
  if (!user) return { statusCode: 401, headers: corsHeaders(), body: JSON.stringify({ error: "No autorizado" }) };

  const client = await connectDB();
  const db = getDB(client);

  if (event.httpMethod === "GET") {
    const profile = await db.collection("users").findOne(
      { _id: require("mongodb").ObjectId.createFromHexString(user.userId) },
      { projection: { passwordHash: 0 } }
    );
    if (!profile) return { statusCode: 404, headers: corsHeaders(), body: JSON.stringify({ error: "Usuario no encontrado" }) };
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify(profile) };
  }

  if (event.httpMethod === "PUT") {
    const { name, digestiveConditions, intolerances, notes } = JSON.parse(event.body);

    const update = { updatedAt: new Date() };
    if (name) update.name = name.trim();
    if (digestiveConditions !== undefined) update.digestiveConditions = digestiveConditions;
    if (intolerances !== undefined) update.intolerances = intolerances;
    if (notes !== undefined) update.digestiveNotes = notes;

    await db.collection("users").updateOne(
      { _id: require("mongodb").ObjectId.createFromHexString(user.userId) },
      { $set: update }
    );

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: "Method not allowed" }) };
};
