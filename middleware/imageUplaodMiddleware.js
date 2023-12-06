const sharp = require('sharp')


const path = require('path')
const { v4: uuidv4 } = require('uuid');


const resizeProductImages = async (req, res, next) => {
    if (!req.files.image) return next();
    req.body.image = [];
    await Promise.all(
        req.files.image.map(async (file) => {
            const filename = `product-${v4()}.jpeg`;
            await sharp(file.buffer)
                .resize(50, 50)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(path.join(__dirname, '../public', 'products', filename));

            req.body.image.push(filename);
        })
    );
    next();
};
















module.exports = {resizeProductImages
}