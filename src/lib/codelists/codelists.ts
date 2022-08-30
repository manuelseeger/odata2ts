export interface CodeList {
  Code?: string;
  Description?: string;
}

export default function parseCodeList(
  jsonString: string | Buffer
): Array<CodeList> {
  const codelist = JSON.parse(jsonString.toString());
  return <Array<CodeList>>codelist.d.results;
}
