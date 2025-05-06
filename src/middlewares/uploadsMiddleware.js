// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const uploadPath = path.join(__dirname, "../uploads/avatars");

// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {

//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {

//     const id = req.params.id || Date.now();
//     const ext = path.extname(file.originalname);
//     cb(null, `${id}-${Date.now()}${ext}`);
//   }
// });

// const upload = multer({
//   storage: storage, // ВИКОРИСТОВУЄМО storage, а не dest
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//       return cb(new Error("Тількіи файли типу jpg, jpeg, png дозволені"));
//     }
//     cb(null, true);
//   },
// });

// module.exports = upload.single("avatar");


const multer = require("multer");
const path = require("path");
const fs = require("fs");

const baseUploadPath = path.join(__dirname, "../uploads");

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "others";

    if (file.fieldname === "avatar") {
      folder = "avatars";
    } else if (file.fieldname === "portfolio") {
      folder = "portfolios";
    }

    const fullPath = path.join(baseUploadPath, folder);
    ensureDirExists(fullPath);
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const id = req.params.id || Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${id}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Тільки файли типу jpg, jpeg, png дозволені"));
    }
    cb(null, true);
  }
});

// Цей middleware дозволяє:
// - одне зображення для 'avatar'
// - до 5 зображень для 'portfolio'
module.exports = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "portfolio", maxCount: 5 }
]);
