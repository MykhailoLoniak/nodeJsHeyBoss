const fs = require('fs/promises');
const path = require('path');

async function deleteImage(urlImg) {
  const imagePath = path.join(__dirname, '../uploads/avatars', urlImg);

  try {
    await fs.unlink(imagePath);
    console.log('Файл успішно видалено');
  } catch (err) {
    console.error('Помилка при видаленні файлу:', err);
  }
}

module.exports = { deleteImage };
