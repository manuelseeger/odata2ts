import parse from './parser/parse.js';
import fs, { outputFile } from 'fs-extra';
import { ITransformer, Transformer }  from './transform/transform.js';
import glob from 'glob';
import path from 'path';
import parseCodeList, { CodeList } from './codelists/codelists.js';

export interface TransformOptions {
    sourceDir: string;
    targetDir: string;
    metadataExtension: string;
    source?: string;
    generateCodeListEnums?: boolean
}

const TransformDefaultOptions: TransformOptions = {
    sourceDir: '',
    targetDir: '',
    metadataExtension: 'xml',
    generateCodeListEnums: false
}

export class OData2Ts {
    private options: TransformOptions;
    private transformer: ITransformer;

    constructor(options: TransformOptions) {
        this.options = { ...TransformDefaultOptions, ...options}
        this.transformer = new Transformer();
    }

    async odata2ts() {
        const targetDir = path.resolve(this.options.targetDir);
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
            const metadataXml = await fs.readFile(f);
            const metadataJs = await parse(metadataXml.toString());
            
            if (this.options.generateCodeListEnums) {
                const codelistDir = path.join(path.dirname(f), path.basename(f).replace('$metadata.xml', '.codelists'));
                if (await fs.pathExists(codelistDir)) {
                    const globPath = codelistDir.replace(/\\/g, '/') + '/*';
                    const codelistFiles = glob.sync(globPath);

                    const codelists: Map<string, CodeList[]> = new Map();
                    for (let cf of codelistFiles) {
                        let codelistjson = await fs.readFile(cf);
                        let codelist = parseCodeList(codelistjson);
                        codelists.set(path.basename(cf).replace('.json', ''), codelist)
                    }
                    this.transformer.setCodelists(codelists);
                }
            }

            const types = this.transformer.transform(metadataJs);

            let outPath = path.join(targetDir, 
                path.basename(f).replace(
                    new RegExp(this.options.metadataExtension + '$'), 'ts'));
            if (!await fs.pathExists(path.dirname(outPath))) {
                await fs.mkdir(path.dirname(outPath));
            }
            await fs.writeFile(outPath, types);
        }
    }
}
