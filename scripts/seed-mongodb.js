/**
 * seed-mongodb.js
 * Corre UNA SOLA VEZ para preparar la base de datos.
 * Uso: node scripts/seed-mongodb.js
 *
 * Requiere MONGODB_URI en .env.local o como variable de entorno.
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ Falta MONGODB_URI en .env.local');
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('nutriapp');

  console.log('🌱 Creando índices y estructura inicial...\n');

  // ── Colección: users ────────────────────────────────────────
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  console.log('✅ users — índice en email (único)');

  // ── Colección: allowed_emails ────────────────────────────────
  await db.collection('allowed_emails').createIndex({ email: 1 }, { unique: true });

  // Email de test para la profesora
  const testEmail = 'profesora.test@esencia.com';
  await db.collection('allowed_emails').updateOne(
    { email: testEmail },
    {
      $setOnInsert: {
        email: testEmail,
        name: 'Profesora (cuenta de prueba)',
        addedAt: new Date(),
        note: 'Cuenta de evaluación del proyecto',
      },
    },
    { upsert: true }
  );
  console.log(`✅ allowed_emails — email de test creado: ${testEmail}`);
  console.log('   Contraseña sugerida para la profesora: Test2026#esencia');
  console.log('   (La profesora puede registrarse con este email en la app)\n');

  // ── Colección: meal_plans ────────────────────────────────────
  await db.collection('meal_plans').createIndex({ userId: 1, month: 1 }, { unique: true });
  console.log('✅ meal_plans — índice compuesto userId + month');

  // ── Colección: daily_logs ────────────────────────────────────
  await db.collection('daily_logs').createIndex({ userId: 1, date: 1 }, { unique: true });
  await db.collection('daily_logs').createIndex({ userId: 1, date: -1 });
  console.log('✅ daily_logs — índices en userId + date');

  // ── Colección: weight_logs ────────────────────────────────────
  await db.collection('weight_logs').createIndex({ userId: 1, date: 1 });
  console.log('✅ weight_logs — índice en userId + date');

  // ── Colección: ai_summaries ───────────────────────────────────
  await db.collection('ai_summaries').createIndex({ userId: 1, period: 1, startDate: 1 });
  console.log('✅ ai_summaries — índice para caché de resúmenes IA');

  console.log('\n🎉 ¡Base de datos lista!\n');
  console.log('📧 Para agregar más emails habilitados:');
  console.log('   node scripts/add-email.js email@ejemplo.com "Nombre Apellido"\n');

  await client.close();
}

seed().catch(err => {
  console.error('❌ Error en seed:', err.message);
  process.exit(1);
});
