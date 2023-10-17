const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        const modifiedname =
            "Creation-" + Date.now() + path.extname(file.originalname);
        cb(null, modifiedname);
    },
});

const upload = multer({
    storage: storage,
});

module.exports = upload;