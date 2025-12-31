/**
 * Backend şifresini hash'lemek için utility script
 * Kullanım: node src/utils/hashBackendPassword.js <şifre>
 * 
 * Hash'lenmiş şifreyi .env dosyasına BACKEND_PASSWORD_HASH olarak ekleyin
 */

import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function hashPassword() {
  const password = process.argv[2];
  
  if (!password) {
    console.log('⚠️  Şifre argüman olarak verilmedi, interaktif moda geçiliyor...');
    
    rl.question('Backend şifresini girin: ', async (inputPassword) => {
      if (!inputPassword) {
        console.error('❌ Şifre boş olamaz');
        rl.close();
        process.exit(1);
      }
      
      await generateHash(inputPassword);
      rl.close();
    });
  } else {
    await generateHash(password);
    rl.close();
  }
}

async function generateHash(password) {
  try {
    const hash = await bcrypt.hash(password, 12);
    console.log('\n✅ Şifre başarıyla hash\'lendi!\n');
    console.log('Aşağıdaki satırı .env dosyanıza ekleyin:\n');
    console.log(`BACKEND_PASSWORD_HASH=${hash}\n`);
    console.log('⚠️  NOT: Orijinal şifreyi güvenli bir yerde saklayın!\n');
  } catch (error) {
    console.error('❌ Hash oluşturma hatası:', error.message);
    process.exit(1);
  }
}

hashPassword();

