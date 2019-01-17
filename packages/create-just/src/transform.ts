import glob from 'glob';
import path from 'path';
import fs from 'fs';
import cpx from 'cpx';
import mkdirp from 'mkdirp';
import handlebars from 'handlebars';

export function transform(srcPath: string, destPath: string, data?: any) {
  const templateFiles = [...glob.sync('**/*', { cwd: srcPath }), ...glob.sync('**/.*', { cwd: srcPath })];

  if (!fs.existsSync(destPath)) {
    mkdirp.sync(destPath);
  }

  templateFiles
    .filter(name => name.indexOf('.DS_Store') < 0)
    .forEach(templateFile => {
      const inputFile = path.join(srcPath, templateFile);
      const outputDir = path.join(destPath, path.dirname(templateFile));
      const outputFile = path.join(destPath, templateFile);

      if (path.extname(templateFile) === '.hbs') {
        const template = handlebars.compile(fs.readFileSync(inputFile).toString());
        const results = template(data);
        fs.writeFileSync(outputFile.replace(/\.hbs$/, ''), results);
      } else {
        cpx.copySync(inputFile, outputDir);
      }
    });
}
