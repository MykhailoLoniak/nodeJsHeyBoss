const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../uploads/avatars");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {


    const id = req.params.id || Date.now(); // req.params.id працюватиме, якщо middleware буде після express router
    const ext = path.extname(file.originalname);
    cb(null, `${id}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage, // ВИКОРИСТОВУЄМО storage, а не dest
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Тільки файли типу jpg, jpeg, png дозволені"));
    }
    cb(null, true);
  },
});

module.exports = upload.single("avatar");
