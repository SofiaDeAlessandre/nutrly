/**
 * add-email.js
 * Agrega un email a la lista de acceso habilitado.
 * Uso: node scripts/add-email.js email@ejemplo.com "Nombre Apellido"
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const [,, email, name] = process.argv;

if (!email) {
  console.error('❌ Uso: node scripts/add-email.js email@ejemplo.com "Nombre Apellido"');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ Falta MONGODB_URI en .env.local');
  process.exit(1);
}

async function addEmail() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('nutriapp');

  const emailNorm = email.toLowerCase().trim();

  const result = await db.collection('allowed_emails').updateOne(
    { email: emailNorm },
    {
      $setOnInsert: {
        email: emailNorm,
        name: name || '',
        addedAt: new Date(),
      },
    },
    { upsert: true }
  );

  if (result.upsertedCount > 0) {
    console.log(`✅ Email habilitado: ${emailNorm}`);
  } else {
    console.log(`ℹ️  El email ya estaba habilitado: ${emailNorm}`);
  }

  await client.close();
}

addEmail().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
