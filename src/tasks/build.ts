import fsextra from "fs-extra";
import handlebars from "handlebars";
import klawsync from "klaw-sync";
import nodesass from 'node-sass';
import path from "path";
import partials from "../partials";
import layouts from "../layouts";
import { renderFile, withLayout } from './render-page';
import siteData from '../data';
import helpers from '../helpers';

export default (rootDir: string = process.cwd()) => {
    const layoutsDir = path.join(rootDir, '_layouts');
    const partialsDir = path.join(rootDir, '_partials');
    const dataDir = path.join(rootDir, '_data');
    const sassDir = path.join(rootDir, '_sass');
    const assetsDir = path.join(rootDir, 'assets');
    const distDir = path.join(rootDir, '_dist');
    const distCssDir = path.join(distDir, 'css');
    const data = siteData(dataDir);

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

    Object.keys(helpers).forEach((k: any) => handlebars.registerHelper(k, (helpers as any)[k]));
    partials(partialsDir).forEach(x => x && handlebars.registerPartial(x.partialName, x.fn))

    const allSrcHtmlFiles = klawsync(rootDir, {
        filter: f => f.path.endsWith('.html') && !path.relative(rootDir, f.path).startsWith('_'),
        traverseAll: true,
        nodir: true
    })

    allSrcHtmlFiles.forEach(f => {
        processSrcFile(f.path)
    });

    fsextra.copySync(assetsDir, path.join(distDir, 'assets'));

    function processSrcFile(srcFilePath: string) {
        const relativePath = path.relative(rootDir, srcFilePath);
        const allLayouts = layouts(layoutsDir);
        const { ctx, html } = renderFile(srcFilePath, {
            data,
            site: fsextra.readJSONSync(path.join(rootDir, '_site.json')),
            ...fileContextData(srcFilePath)
        })
        const finalHtml = withLayout(allLayouts, ctx, html);
        fsextra.writeFileSync(path.join(distDir, relativePath), finalHtml);
    }


    function fileContextData(filePath: string) {
        const relativePath = path.relative(rootDir, filePath);
        return { path: relativePath }
    }

}