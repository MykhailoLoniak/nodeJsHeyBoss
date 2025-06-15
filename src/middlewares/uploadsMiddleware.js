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

module.exports = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "portfolio", maxCount: 5 }
]);
