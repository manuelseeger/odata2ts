import { OData2Ts, TransformOptions } from '../lib/odata2ts.js';
import path from 'path';
import fs from 'fs-extra';
import { Command } from 'commander';


(async () => {
    const program = new Command();
    program
        .option('--metadataExtension <ext>', 'File extension of metadata file', 'xml')
        .option('--sourceDir <dir>', 'Directory where to look for metadata files')
        .option('--targetDir <dir>', 'Target directory for typescript files', 'out')
        .option('-c, --config <path>', 'Path to config file', 'odata2ts.config.json');

    program.parse();

    const options = program.opts();

    let configFilePath = options.config;
    let config;
    if (!path.isAbsolute(configFilePath)) {
        configFilePath = path.join(process.cwd(), configFilePath);
    }
    if (await fs.pathExists(configFilePath)) {
        config = <TransformOptions> JSON.parse((await fs.readFile(configFilePath)).toString());
    } else {
        config = <TransformOptions> {};
    }

    config.metadataExtension = options.metadataExtension;
    config.targetDir = options.targetDir;

    const odata2ts = new OData2Ts(config);
    odata2ts.odata2ts();
})();
