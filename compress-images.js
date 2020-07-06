const jimp = require('jimp');
const klawSync = require('klaw-sync');
const fs = require('fs');
const path = require('path');

const compressedFilePrefix = 'c_';

klawSync('../assets/images', {
    traverseAll: true,
    nodir: true,
    filter: f => (f.path.endsWith('.jpg')
        || f.path.endsWith('.jpeg')
        || f.path.endsWith('.png')) && !path.basename(f.path).startsWith(compressedFilePrefix)

}).forEach(async i => {
    await compressImage(i);
})

async function compressImage(i) {
    console.log('Compressing: ' + i.path)
    const image = await jimp.read(i.path);
    const saveFilePath = path.join(path.dirname(i.path), compressedFilePrefix + path.basename(i.path));
    image.quality(40).writeAsync(saveFilePath);
    fs.unlinkSync(i.path);
}