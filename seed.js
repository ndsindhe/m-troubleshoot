/**
 * seed.js — Run once to populate initial companies & models.
 * Usage: node seed.js  (after configuring serviceAccountKey.json)
 *
 * 1. Firebase Console → Project Settings → Service Accounts → Generate new private key
 * 2. Save as serviceAccountKey.json in the project root
 * 3. npm install firebase-admin
 * 4. node seed.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const COMPANIES = [
  { name: 'Apple',    emoji: '🍎' },
  { name: 'Samsung',  emoji: '🟠' },
  { name: 'Google',   emoji: '🔵' },
  { name: 'OnePlus',  emoji: '🔴' },
  { name: 'Xiaomi',   emoji: '🟠' },
  { name: 'Oppo',     emoji: '🟢' },
  { name: 'Vivo',     emoji: '🔵' },
  { name: 'Realme',   emoji: '🟡' },
  { name: 'Nokia',    emoji: '🔵' },
  { name: 'Motorola', emoji: '🔴' },
  { name: 'Sony',     emoji: '⚫' },
  { name: 'Huawei',   emoji: '🌸' },
];

const MODELS = {
  Apple:    ['iPhone 15', 'iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 14', 'iPhone 14 Pro', 'iPhone 13', 'iPhone SE (3rd Gen)'],
  Samsung:  ['Galaxy S24', 'Galaxy S24+', 'Galaxy S24 Ultra', 'Galaxy S23', 'Galaxy A55', 'Galaxy A35', 'Galaxy Z Fold 5', 'Galaxy Z Flip 5'],
  Google:   ['Pixel 9', 'Pixel 9 Pro', 'Pixel 8', 'Pixel 8 Pro', 'Pixel 8a', 'Pixel 7a'],
  OnePlus:  ['OnePlus 12', 'OnePlus 12R', 'OnePlus Nord 4', 'OnePlus Nord CE 4', 'OnePlus Open'],
  Xiaomi:   ['Xiaomi 14', 'Xiaomi 14 Pro', 'Redmi Note 13 Pro', 'Redmi Note 13', 'POCO X6 Pro', 'POCO M6 Pro'],
  Oppo:     ['Find X7', 'Find X7 Ultra', 'Reno 11 Pro', 'Reno 11', 'A99'],
  Vivo:     ['X100 Pro', 'X100', 'V30 Pro', 'V30', 'Y100'],
  Realme:   ['GT 5 Pro', 'GT Neo 6', '12 Pro+', 'Narzo 70 Pro', 'C65'],
  Nokia:    ['G42', 'G21', 'C32', 'XR21'],
  Motorola: ['Edge 50 Ultra', 'Edge 50 Pro', 'Moto G85', 'Moto G Power (2024)', 'Razr 50'],
  Sony:     ['Xperia 1 VI', 'Xperia 5 VI', 'Xperia 10 VI'],
  Huawei:   ['Mate 60 Pro', 'P60 Pro', 'Nova 12 Pro'],
};

async function seed() {
  const batch = db.batch();
  const companyRefs = {};

  for (const c of COMPANIES) {
    const ref = db.collection('companies').doc();
    companyRefs[c.name] = ref.id;
    batch.set(ref, { ...c, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  for (const [companyName, modelList] of Object.entries(MODELS)) {
    const companyId = companyRefs[companyName];
    for (const name of modelList) {
      const ref = db.collection('models').doc();
      batch.set(ref, { name, companyId, companyName, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    }
  }

  await batch.commit();
  console.log('✅ Seed complete! Companies and models added.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
