import { OData2Ts, TransformOptions } from '../lib/odata2ts.js';

(async () => {
    const options = <TransformOptions>{
        sourceDir: 'c:/Users/manuel/dev/C4C-OData-Metadata/my344469',
        targetDir: 'out',
        //source: 'c:/Users/manuel/dev/C4C-OData-Metadata/my344469/employee$metadata.xml'
        generateCodeListEnums: true
    }
    const odata2ts = new OData2Ts(options);
    odata2ts.odata2ts();
})();
