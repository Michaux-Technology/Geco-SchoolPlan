const crypto = require('crypto');

// Test du cryptage/décryptage des QR codes
const ENCRYPTION_KEY = 'geco-school-plan-2024-secure-key';

// Fonction de cryptage (simulation frontend)
const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32), 'utf8');
    const iv = Buffer.from('0000000000000000', 'utf8');
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(jsonString, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return encrypted;
  } catch (error) {
    console.error('Erreur lors du cryptage:', error);
    return null;
  }
};

// Fonction de décryptage (simulation backend)
const decryptData = (encryptedData) => {
  try {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32), 'utf8');
    const iv = Buffer.from('0000000000000000', 'utf8');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Erreur lors du décryptage:', error);
    return null;
  }
};

// Test des données
const testData = {
  backend: 'http://192.168.1.30:5000',
  schoolName: 'Geco School',
  username: 'eleve',
  password: '1234',
  role: 'eleve',
  timestamp: Date.now(),
  version: '1.0'
};

console.log('🔐 Test du cryptage des QR codes');
console.log('================================');

console.log('\n📤 Données originales:');
console.log(JSON.stringify(testData, null, 2));

const encrypted = encryptData(testData);
console.log('\n🔒 Données cryptées:');
console.log(encrypted);

const decrypted = decryptData(encrypted);
console.log('\n🔓 Données décryptées:');
console.log(JSON.stringify(decrypted, null, 2));

console.log('\n✅ Test de validation:');
console.log('Données identiques:', JSON.stringify(testData) === JSON.stringify(decrypted) ? 'OUI' : 'NON');

if (JSON.stringify(testData) === JSON.stringify(decrypted)) {
  console.log('\n🎉 Test réussi ! Le cryptage fonctionne correctement.');
} else {
  console.log('\n❌ Test échoué ! Il y a un problème avec le cryptage.');
} 