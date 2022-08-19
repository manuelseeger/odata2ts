import { OData2Ts, TransformOptions } from "../lib/odata2ts";
import fs from 'fs-extra';

describe('Parse Northwind', () => {
    test('Parses Northwind example to types', async () => {
        const odata2ts = new OData2Ts({} as TransformOptions);
        const types = await odata2ts.fileToTypes('./example/Northwind$metadata.xml');
        const typesSnapshot = await fs.readFile('./example/Northwind$metadata.ts');
        expect(types.toString()).toBe(typesSnapshot.toString());
    });
});