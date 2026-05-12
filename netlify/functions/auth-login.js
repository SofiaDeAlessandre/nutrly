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
    const { email, password } = JSON.parse(event.body);
    if (!email || !password) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: "Email y contraseña requeridos" }) };
    }

    const client = await connectDB();
    const db = getDB(client);

    const user = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return { statusCode: 401, headers: corsHeaders(), body: JSON.stringify({ error: "Email o contraseña incorrectos" }) };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { statusCode: 401, headers: corsHeaders(), body: JSON.stringify({ error: "Email o contraseña incorrectos" }) };
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      }),
    };
  } catch (err) {
    console.error("Login error:", err);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: "Error interno del servidor" }) };
  }
};
