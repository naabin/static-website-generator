import graymatter from "gray-matter";
import handlebars from "handlebars";
import fsextra from "fs-extra";
import deepmerge from "deepmerge";
import { BuildContext } from "../types";
import { Layouts } from "../layouts";

function buildMetaData() {
    return {
        buildTs: Date.now()
    }
}

export function renderFile(filePath: string, ctx?: BuildContext) {
    const fileRawContent = fsextra.readFileSync(filePath);
    return render(fileRawContent, ctx || {});
}

export function render(raw: Buffer, initCtx: Partial<BuildContext>) {
    const { content, data } = graymatter(raw);
    const ctx = deepmerge(deepmerge(initCtx, data), buildMetaData());
    const html = handlebars.compile(content)(ctx);
    return { ctx, html }
}

export function withLayout(layouts: Layouts, ctx: BuildContext, main: any) {
    const { layout, ...rest } = ctx;
    if (layout) {
        console.log('Rendering layout: ' + layout)
        if (!layouts[layout])
            throw new Error('Invalid layout valid ' + layout + '. Must be one of' + Object.keys(layouts).join())
        return render(layouts[layout], { ...rest, main }).html;
    }
    return main;
}
