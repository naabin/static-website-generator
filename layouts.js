const klawsync = require('klaw-sync');
const path = require('path');
const fsextra = require('fs-extra');

module.exports = (layoutsDir) => klawsync(layoutsDir, {
    filter: f => f.path.endsWith('.html'),
    depthLimit: 0,
    nodir: true
}).reduce((acc, f) => {
    const layoutKey = path.basename(f.path).split('.')[0];
    if (layoutKey) {
        return {
            ...acc,
            [layoutKey]: fsextra.readFileSync(f.path)
        }
    }
}, {});

