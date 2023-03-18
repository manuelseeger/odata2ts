/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EntityProperty {
  name: string;
  type?: string;
  required?: boolean;
  items?: any;
  $ref?: any;
  enum?: Array<any>;
  wrapValueInQuotesInUrls: boolean;
  $?: Map<string, string>;
}
