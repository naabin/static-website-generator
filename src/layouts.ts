import klawsync from 'klaw-sync';
import path from 'path';
import fsextra from 'fs-extra';

export default (layoutsDir: string) => klawsync(layoutsDir, {
    filter: (f) => f.path.endsWith('.html'),
    depthLimit: 0,
    nodir: true
}).reduce((acc, f) => {
    const layoutKey = path.basename(f.path).split('.')[0];
    if (layoutKey) {
        return {
            ...acc,
            [layoutKey]: fsextra.readFileSync(f.path)
        }
    } else
        return acc
}, {});

export type Layouts = {
    [key: string]: Buffer
}