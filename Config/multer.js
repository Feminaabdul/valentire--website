const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/Admins/productImages'));
    },
    filename: function(req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const upload = multer({ storage: storage });

// Middleware to process image cropping
const cropImage = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const imagePath = path.join(__dirname, '../public/Admins/productImages', req.file.filename);

    // Specify your crop options (e.g., width, height, position)
    const cropOptions = {
        left: 0,
        top: 0,
        width: 1000, // Specify the desired width
        height: 1000, // Specify the desired height
    };
console.log("worksfghjmjjjjjhgfhdszesxrdctfv");
    sharp(imagePath)
        .extract(cropOptions)
        .toBuffer()
        .then((buffer) => {
            // Overwrite the original image with the cropped one
            sharp(buffer).toFile(imagePath, (err) => {
                if (err) {
                    return next(err);
                }
                next();
            });
        })
        .catch((err) => {
            return next(err);
        });
};

module.exports = { upload, cropImage };
