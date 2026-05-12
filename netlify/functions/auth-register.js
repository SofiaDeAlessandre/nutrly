const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectDB, getDB, corsHeaders } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { name, email, password } = JSON.parse(event.body);

    if (!name || !email || !password) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: "Faltan campos obligatorios" }) };
    }

    const client = await connectDB();
    const db = getDB(client);

    // Verificar que el email esté en la whitelist
    const allowed = await db.collection("allowed_emails").findOne({
      email: email.toLowerCase().trim(),
    });

    if (!allowed) {
      return {
        statusCode: 403,
        headers: corsHeaders(),
        body: JSON.stringify({ error: "Este email no tiene acceso. Contactá a la administradora para obtener acceso." }),
      };
    }

    // Verificar que no exista ya
    const existing = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return { statusCode: 409, headers: corsHeaders(), body: JSON.stringify({ error: "Este email ya está registrado" }) };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.collection("users").insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      digestiveConditions: [],
      intolerances: [],
      createdAt: new Date(),
    });

    const token = jwt.sign(
      { userId: result.insertedId.toString(), email: email.toLowerCase().trim(), name: name.trim() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      statusCode: 201,
      headers: corsHeaders(),
      body: JSON.stringify({ token, user: { id: result.insertedId, name: name.trim(), email: email.toLowerCase().trim() } }),
    };
  } catch (err) {
    console.error("Register error:", err);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: "Error interno del servidor" }) };
  }
};
