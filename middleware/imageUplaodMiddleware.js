const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const resizeProductImages = async (req, res, next) => {
    if (!req.files.image) {
        return next();
    }

    const processedImages = [];
    await Promise.all(
        req.files.image.map(async (file) => {
            const filename = `${uuidv4()}.jpeg`;
            try {
                await sharp(file.buffer)
                    .resize(500, 500)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(path.join(__dirname, '../public/Admins/productImages', filename));
                processedImages.push(filename);
            } catch (error) {
                // Handle error if needed
                console.error('Error processing image:', error);
            }
        })
    );

    req.body.images = processedImages;
    next();
};

module.exports = { resizeProductImages };
