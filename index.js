const handlebars = require("handlebars");
const fsextra = require("fs-extra");
const klawsync = require("klaw-sync");
const path = require("path");
const partials = require("./partials");
const layouts = require("./layouts");
const nodesass = require('node-sass');
const { renderFile, withLayout } = require('./render-page');
const siteData = require('./site-data')
const helpers = require('./helpers');
const root = process.cwd();
const distDir = path.join(root, '_dist');
const distCssDir = path.join(distDir, 'css');
const layoutsDir = path.join(root, '_layouts');
const partialsDir = path.join(root, '_partials');
const dataDir = path.join(root, '_data');
const sassDir = path.join(root, '_sass');
const assetsDir = path.join(root, 'assets');
const data = siteData(dataDir)
fsextra.ensureDirSync(distDir);

nodesass.render({
    file: path.join(sassDir, 'main.scss')
}, (err, result) => {
    if (err)
        console.error(err)
    else {
        fsextra.ensureDirSync(distCssDir, {});
        fsextra.writeFileSync(path.join(distCssDir, 'main.css'), result.css)
    }
})

Object.keys(helpers).forEach(k => handlebars.registerHelper(k, helpers[k]));
partials(partialsDir).forEach(x => handlebars.registerPartial(x.partialName, x.fn))

const allSrcHtmlFiles = klawsync(root, {
    filter: f => f.path.endsWith('.html') && !path.relative(root, f.path).startsWith('_'),
    traverseAll: true,
    nodir: true
})

allSrcHtmlFiles.forEach(f => {
    processSrcFile(f.path)
});

fsextra.copySync(assetsDir, path.join(distDir, 'assets'));

function processSrcFile(srcFilePath) {
    const relativePath = path.relative(root, srcFilePath);
    const allLayouts = layouts(layoutsDir);
    const { ctx, html } = renderFile(srcFilePath, {
        data,
        site: fsextra.readJSONSync(path.join(root, '_site.json')),
        ...fileContextData(srcFilePath)
    })
    const finalHtml = withLayout(allLayouts, ctx, html);
    fsextra.writeFileSync(path.join(distDir, relativePath), finalHtml);
}


function fileContextData(filePath) {
    const relativePath = path.relative(root, filePath);
    return { path: relativePath }
}
