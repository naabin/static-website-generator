import klawsync from 'klaw-sync';
import path from 'path';
import fsextra from 'fs-extra';
import { renderFile } from './tasks/render-page';


const dirMetaFile = '.meta.json';

type Meta = {
    sort: {
        sortKey: string,
        sortOrder: 'DESC' | 'ASC'
    }
}
type Datum = {
    [key: string]: any
}
type FileData = {
    data: Datum[],
    meta: Meta
}

function getAllDirDataFiles(dir: string) {
    return klawsync(dir, {
        depthLimit: 0,
        filter: f => path.basename(f.path) !== dirMetaFile
    })
}


function getDirData(dir: string) {
    return applyMetaDir(getAllDirDataFiles(dir).map(x => {
        return getFileData(x.path);
    }), dir)
}

function getDataKey(fPath: string) {
    return path.basename(fPath).split('.')[0];
}

function getFileData(fPath: string) {
    console.log('Getting file data: ' + fPath)
    const fext = path.extname(fPath);
    switch (fext) {
        case '.json':
            return getJsonFileData(fPath);
        case '.html':
            return getHtmlFileData(fPath);
        default:
            throw new Error('Invalid file type. Only json,html files are allowed.Given ext: ' + fext);
    }
}

function getJsonFileData(jsonFilePath: string) {
    const fileContent = fsextra.readFileSync(jsonFilePath, { encoding: 'utf-8' });
    const { data, meta } = JSON.parse(fileContent) as FileData
    if (meta) {
        return applyMetaObj(data, meta);
    }
    return data;
}
function applyMetaDir(data: Array<Datum>, dir: string) {
    const metaFile = path.join(dir, dirMetaFile);
    if (fsextra.existsSync(metaFile))
        return applyMetaObj(data, fsextra.readJSONSync(metaFile));
    return data;
}
function applyMetaObj(data: Array<Datum>, meta: Meta) {
    let dataWithMeta = data;
    if (!meta)
        return data;
    const { sort, ...rest } = meta;
    if (sort) {
        const { sortKey, sortOrder = 'DESC' } = sort;
        if (!sortKey)
            throw new Error('Sort key must be provided');
        dataWithMeta = dataWithMeta.sort((a, b) => ((a[sortKey]).valueOf().toString().localeCompare((b[sortKey] as any).valueOf().toString())) * (sortOrder === 'DESC' ? -1 : 1));
    }
    return dataWithMeta.map(x => ({ ...x, ...rest }))
}

function getHtmlFileData(htmlFilePath: string) {
    const { ctx, html } = renderFile(htmlFilePath);
    return { ...ctx, content: html.trim() };
}

function getData(dir: string) {
    return getAllDirDataFiles(dir).reduce((acc, f) => (
        {
            ...acc,
            [getDataKey(f.path)]: f.stats.isDirectory() ? getDirData(f.path) : getFileData(f.path)
        }), {});
}

export default getData
