import { Property } from './Property';
import { Reference } from './Reference';

export interface Schema {
  namespace?: string;
  items?: Schema | Reference | Property;
  properties?: {[propertyName: string]: Property};
}
