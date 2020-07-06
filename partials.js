const klawsync = require('klaw-sync');
const path = require('path');
const handlebars = require('handlebars');
const fsextra = require('fs-extra');

module.exports = (partialsDir) => klawsync(partialsDir, {
    filter: f => f.path.endsWith('.html'),
    depthLimit: 0,
    nodir: true
}).map(f => {
    const partialName = path.basename(f.path).split('.')[0];
    if (partialName) {
        const template = handlebars.compile(fsextra.readFileSync(f.path, { encoding: 'utf-8' }));
        return {
            partialName,
            fn: (ctx) => template(ctx)

        }
    }
}).filter(x => x);
