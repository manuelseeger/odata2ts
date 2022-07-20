import parse from './parser/parse.js';
import fs, { outputFile } from 'fs-extra';
import { ITransformer, Transformer }  from './transform/transform.js';
import glob from 'glob';
import path from 'path';

export interface TransformOptions {
    sourceDir: string;
    targetDir: string;
    metadataExtension: string;
    source?: string;
}

const TransformDefaultOptions: TransformOptions = {
    sourceDir: '',
    targetDir: '',
    metadataExtension: 'xml'
}

export class OData2Ts {
    private options: TransformOptions;
    private transformer: ITransformer;

    constructor(options: TransformOptions) {
        this.options = { ...TransformDefaultOptions, ...options}
        this.transformer = new Transformer();
    }

    async odata2ts() {

        const sourceDir = path.resolve(this.options.sourceDir);
        const targetDir = path.resolve(this.options.targetDir);
        const globPath = `${sourceDir.replace(/\\/g, '/')}/*.${this.options.metadataExtension}`;
        let metadataFiles: Array<string>;

        if (this.options.source) {
            metadataFiles = [this.options.source];
        } else {
            const sourceDir = path.resolve(this.options.sourceDir);
            const targetDir = path.resolve(this.options.targetDir);
            const globPath = `${sourceDir.replace(/\\/g, '/')}/*.${this.options.metadataExtension}`;
            metadataFiles = glob.sync(globPath);
        }

        for (let f of metadataFiles) {
            console.log(f);
            let metadataXml = await fs.readFile(f);
            let metadataJs = await parse(metadataXml.toString());
            let types = this.transformer.convert(metadataJs);
            let outPath = path.join(targetDir, path.basename(f).replace(this.options.metadataExtension, 'd.ts'));
            if (!await fs.pathExists(path.dirname(outPath))) {
                await fs.mkdir(path.dirname(outPath));
            }
            await fs.writeFile(outPath, types);
        }
    }
}
