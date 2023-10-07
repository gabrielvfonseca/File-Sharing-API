require("dotenv").config();
const multer = require("multer");
const path = require("path");

// Maximum upload size
const maxUploadSize = 2 * 1024 * 1024 * 1024; // 2GB Max

// Multer file default configuration
module.exports = multer({
  dest: path.resolve("..", "tmp", "uploads"),
  limits: {
    fileSize: maxUploadSize,
  },
  fileFilter: (req, file, cb) => {
    const allowedDataTypes = [
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/zip",
      "application/rar",
    ];

    if (allowedDataTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // if file type isn't supported, will return an error
      cb(new Error("Invalid file type!"));
    }
  },
});
