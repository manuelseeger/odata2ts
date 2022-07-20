import { Service } from '../parser/Service.js';
import { EntityType } from '../parser/EntityType.js';
import { EntityProperty } from '../parser/EntityProperty.js';
import { edmTypeMap } from './constants.js';
import prettier from 'prettier';
import parserTypescript from "prettier/parser-typescript.js";

export interface ITransformer {
    convert(metadata: Service): string;
}

export interface ConvertorOptions {
    propertyCallback: CallableFunction;
}

export class Transformer implements ITransformer {
    constructor() {
        
    }

    convert(metadata: Service): string {
        let result = '';

        let entityTypes = metadata.entityTypes.map(t => this.convertType(t))

        result += entityTypes.join('\n');

        let prettierOptions: prettier.Options = {
            parser: "typescript",
            plugins: [parserTypescript],
          };

        return prettier.format(result, prettierOptions);
    }
    
    convertType(entityType: EntityType): string {
        let result = `export interface ${entityType.name} {`;

        result += entityType.properties.map(p => this.convertProperty(p)).join('\n');

        result += '\n}\n';
        return result;
    }

    convertProperty(property: EntityProperty): string {
        let result = `${property.name}${property.required ? '': '?'}:`;
        result += property.type ? edmTypeMap[property.type] : 'any;';
        return result;
    }
}

