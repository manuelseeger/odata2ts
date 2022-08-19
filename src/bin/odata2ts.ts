import { OData2Ts, TransformOptions } from '../lib/odata2ts.js';
import path from 'path';
import fs from 'fs-extra';
import { Command } from 'commander';

(async () => {
    const program = new Command();
    program
        .option('-c, --config <path>', 'path to config file', 'odata2ts.config.json')
        .option('-s, --sourceDir <dir>', 'directory where to look for metadata files')
        .option('-t, --targetDir <dir>', 'target directory for typescript files (default: "out")')
        .option('-m, --metadataExtension <ext>', 'file extension of metadata file (default: "xml")')
        .option('--c4c', 'use SAP C4C metadata vocabulary')
        .argument('[source]', 'specific metadata file to parse');
    program.addHelpText('after', '\nOne of source, sourceDir, or config file required');
    program.parse();
    const cliOptions = program.opts();

    let configFilePath = cliOptions.config;
    let config;
    if (!path.isAbsolute(configFilePath)) {
        configFilePath = path.join(process.cwd(), configFilePath);
    }
    if (await fs.pathExists(configFilePath)) {
        config = <TransformOptions> JSON.parse((await fs.readFile(configFilePath)).toString());
    } else {
        config = <TransformOptions> {};
    }

    if (cliOptions.sourceDir) {
        config.sourceDir = cliOptions.sourceDir;
    }
    if (cliOptions.targetDir) {
        config.targetDir = cliOptions.targetDir;
    } else {
        if (config.targetDir == undefined) {
            config.targetDir = 'out';
        }
    }
    if (cliOptions.metadataExtension) {
        config.metadataExtension = cliOptions.metadataExtension;
    } else {
        if (config.metadataExtension == undefined) {
            config.metadataExtension = 'xml';
        }
    }
    config.generateCodeListEnums = cliOptions.c4c;

    if (!config.sourceDir && !config.source && !config.source) {
        console.log('error: Either provide sourceDir, source command line, or config file');
    }

    const odata2ts = new OData2Ts(config);
    odata2ts.odata2ts();
})();
