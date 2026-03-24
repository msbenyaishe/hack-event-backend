const multer = require('multer');
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const path = require('path');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hackevent/workshops",
    resource_type: "auto", // Better for PDFs than "raw"
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      return file.fieldname + '-' + uniqueSuffix + extension;
    }
  }
});

const uploadPdf = multer({ storage: storage });

module.exports = uploadPdf;
