import jimp from 'jimp';
import klawSync from 'klaw-sync';
import fs from 'fs';
import path from 'path';

const compressedFilePrefix = 'c_';

export default (rootDir: string = process.cwd()) => {
    klawSync(path.join(rootDir, 'assets', 'images'), {
        traverseAll: true,
        nodir: true,
        filter: f => (f.path.endsWith('.jpg')
            || f.path.endsWith('.jpeg')
            || f.path.endsWith('.png')) && !path.basename(f.path).startsWith(compressedFilePrefix)

    }).forEach(async i => {
        await compressImage(i.path);
    })

    async function compressImage(ipath: string) {
        console.log('Compressing: ' + ipath)
        const image = await jimp.read(ipath);
        const saveFilePath = path.join(path.dirname(ipath), compressedFilePrefix + path.basename(ipath));
        image.quality(40).writeAsync(saveFilePath);
        fs.unlinkSync(ipath);
    }
}