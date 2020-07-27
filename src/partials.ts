import klawsync from 'klaw-sync';
import path from 'path';
import handlebars from 'handlebars';
import fsextra from 'fs-extra';
import { BuildContext } from './types';

export default (partialsDir: string) => klawsync(partialsDir, {
    filter: f => f.path.endsWith('.html'),
    depthLimit: 0,
    nodir: true
}).map(f => {
    const partialName = path.basename(f.path).split('.')[0];
    if (partialName) {
        const template = handlebars.compile(fsextra.readFileSync(f.path, { encoding: 'utf-8' }));
        return {
            partialName,
            fn: (ctx: BuildContext) => template(ctx)

        }
    }
}).filter(x => x);
