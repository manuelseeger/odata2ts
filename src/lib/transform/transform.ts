import { Service } from '../parser/Service.js';
import { EntityType } from '../parser/EntityType.js';
import { EntityProperty } from '../parser/EntityProperty.js';
import { edmTypeMap } from './constants.js';
import prettier from 'prettier';
import parserTypescript from "prettier/parser-typescript.js";
import _ from 'lodash';
import { CodeList } from '../codelists/codelists.js';

export interface ITransformer {
    setCodelists(codelist: Map<string, CodeList[]>): void;
    transform(metadata: Service): string;
}

export interface ConvertorOptions {
    propertyCallback: CallableFunction;
}

export class Transformer implements ITransformer {
    private codelists: Map<string, CodeList[]> = new Map();
    constructor() {
        
    }
    setCodelists(codelists: Map<string, CodeList[]>): void {
        this.codelists = codelists;
    }

    transform(metadata: Service): string {
        let result = '';

        let entityByNameSpace = _.groupBy(metadata.entityTypes, v => v.namespace);

        for (let namespace of Object.keys(entityByNameSpace)) {
            result += `export namespace ${namespace} {\n`
            result += entityByNameSpace[namespace].map(t => this.transformType(t)).join('\n')
            result += '}\n'
        }

        if (this.codelists.size > 0) {
            for (let [enumName, codelist] of this.codelists.entries()) {
                result += this.transformEnums(enumName, codelist);
            }
        }

        let prettierOptions: prettier.Options = {
            parser: "typescript",
            plugins: [parserTypescript],
          };

        return prettier.format(result, prettierOptions);
    }

    transformEnums(enumName: string, codelist: CodeList[]): string {
        let result = `export type  ${enumName.replace(/Collection$/, '')} = `;
        if (codelist.length) {
            result += codelist.map(c => `'${c.Code}'`).join('|')
        } else {
            result += `''`;
        }
        result += ';\n';
        return result;
    }
    
    transformType(entityType: EntityType): string {
        let result = `export interface ${entityType.name} {`;

        result += entityType.properties.map(p => this.transformProperty(p)).join('\n');

        result += '\n}\n';
        return result;
    }

    transformProperty(property: EntityProperty): string {
        let result = `${property.name}${property.required ? '': '?'}:`;

        // TODO: check if codelist is actually included in this.codelists
        if (property.$ && 'c4c:value-help' in property.$) {
            const codelistName = property.$['c4c:value-help'] as string;
            result += codelistName.replace(/Collection$/, '');
        } else {
            result += property.type ? edmTypeMap[property.type] : 'any';
        }
        result += ';\n';
        return result;
    }
}

