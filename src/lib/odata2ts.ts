import parse from "./parser/parse.js";
import fs from "fs-extra";
import { Transformer } from "./transform/transform.js";
import glob from "glob";
import path from "path";
import parseCodeList, { CodeList } from "./codelists/codelists.js";

export interface TransformOptions {
  sourceDir: string;
  targetDir: string;
  metadataExtension?: string;
  source?: string;
  target?: string;
  generateCodeListEnums?: boolean;
}

const TransformDefaultOptions: TransformOptions = {
  sourceDir: "",
  targetDir: "",
  metadataExtension: "xml",
  generateCodeListEnums: false,
};

export class OData2Ts {
  private options: TransformOptions;
  private transformer: Transformer;

  constructor(options?: TransformOptions) {
    this.options = { ...TransformDefaultOptions, ...options };
    this.transformer = new Transformer();
  }

  async odata2ts() {
    const targetDir = path.resolve(this.options.targetDir);
    let metadataFiles: Array<string>;

    if (this.options.source) {
      metadataFiles = [this.options.source];
    } else {
      const sourceDir = path.resolve(this.options.sourceDir);
      const globPath = `${sourceDir.replace(/\\/g, "/")}/*.${
        this.options.metadataExtension
      }`;
      metadataFiles = glob.sync(globPath);
    }

    if (metadataFiles.length == 0) {
      throw new Error("No metadata files found at source location");
    }

    metadataFiles.forEach(async (f) => {
      const types = await this.fileToTypes(f);

      const outFileName = this.getOutFileName(path.basename(f));
      const outPath = path.join(targetDir, outFileName);
      if (!(await fs.pathExists(path.dirname(outPath)))) {
        await fs.mkdir(path.dirname(outPath));
      }
      await fs.writeFile(outPath, types);
    });
  }

  getOutFileName(filePath: string): string {
    if (filePath.includes(".")) {
      return filePath.split(".").slice(0, -1).join(".") + ".ts";
    } else {
      return filePath + ".ts";
    }
  }

  async fileToTypes(filePath: string): Promise<string> {
    console.log(filePath);
    const metadataXml = await fs.readFile(filePath);
    const metadataJs = await parse(metadataXml.toString());

    if (this.options.generateCodeListEnums) {
      const codelistDir = path.join(
        path.dirname(filePath),
        path.basename(filePath).replace("$metadata.xml", ".codelists")
      );
      const codelists: Map<string, CodeList[]> = new Map();
      if (await fs.pathExists(codelistDir)) {
        const globPath = codelistDir.replace(/\\/g, "/") + "/*";
        const codelistFiles = glob.sync(globPath);

        for (const cf of codelistFiles) {
          const codelistjson = await fs.readFile(cf);
          const codelist = parseCodeList(codelistjson);
          codelists.set(path.basename(cf).replace(".json", ""), codelist);
        }
      }
      this.transformer.setCodelists(codelists);
    }
    return this.transformer.transform(metadataJs);
  }
}
