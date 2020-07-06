const klawsync = require('klaw-sync');
const path = require('path');
const fsextra = require('fs-extra');
const { renderFile } = require("./render-page");


const dirMetaFile = '.meta.json';

function getAllDirDataFiles(dir) {
    return klawsync(dir, {
        depthLimit: 0,
        filter: f => path.basename(f.path) !== dirMetaFile
    })
}

function getSiteData(dir) {
    return getAllDirDataFiles(dir).reduce((acc, f) => (
        {
            ...acc,
            [getDataKey(f.path)]: f.stats.isDirectory() ? getDirData(f.path) : getFileData(f.path)
        }), {});
}

function getDirData(dir) {
    return applyMetaDir(getAllDirDataFiles(dir).map(x => {
        return getFileData(x.path);
    }), dir)
}

function getDataKey(fPath) {
    return path.basename(fPath).split('.')[0];
}

function getFileData(fPath) {
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

function getJsonFileData(jsonFilePath) {
    const { data, meta } = JSON.parse(fsextra.readFileSync(jsonFilePath))
    if (meta) {
        return applyMetaObj(data, meta);
    }
    return data;
}
function applyMetaDir(data, dir) {
    const metaFile = path.join(dir, dirMetaFile);
    if (fsextra.existsSync(metaFile))
        return applyMetaObj(data, fsextra.readJSONSync(metaFile));
    return data;
}
function applyMetaObj(data, meta) {
    let dataWithMeta = data;
    if (!meta)
        return data;
    const { sort, ...rest } = meta;
    if (sort) {
        const { sortKey, sortOrder = 'DESC' } = sort;
        if (!sortKey)
            throw new Error('Sort key must be provided');
        dataWithMeta = dataWithMeta.sort((a, b) => (a[sortKey].valueOf().toString().localeCompare(b[sortKey].valueOf().toString())) * (sortOrder === 'DESC' ? -1 : 1));
    }
    return dataWithMeta.map(x => ({ ...x, ...rest }))
}

function getHtmlFileData(htmlFilePath) {
    const { ctx, html } = renderFile(htmlFilePath);
    return { ...ctx, content: html.trim() };
}

module.exports = getSiteData
