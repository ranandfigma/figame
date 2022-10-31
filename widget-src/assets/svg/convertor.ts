import { glob } from 'glob';
import * as fs from 'fs';
import Path from 'path'


const ROOT = "widget-src/assets";
const SVG_DIR = "widget-src/assets/svg";

glob(`${ROOT}/*.svg`, {}, (err: any, files: string[]) => {
    for (const file of files) {
        const data = fs.readFileSync(file);
        const stringified = `export default \`${data.toString().replace(/\n/g, '')}\``
        const filename = `${SVG_DIR}/${Path.parse(file).name}.tsx`;
        fs.writeFileSync(filename, stringified);
    }
})


export default 1;

