import glob from 'glob';
import path from 'path';
import fse from 'fs-extra';
import handlebars from 'handlebars';

export function transform(srcPath: string, destPath: string, data?: any) {
  const templateFiles = [...glob.sync('**/*', { cwd: srcPath }), ...glob.sync('**/.*', { cwd: srcPath })];

  if (!fse.existsSync(destPath)) {
    fse.mkdirpSync(destPath);
  }

  templateFiles
    .filter(name => name.indexOf('.DS_Store') < 0)
    .forEach(templateFile => {
      const inputFile = path.join(srcPath, templateFile);
      const outputFile = path.join(destPath, templateFile);

      if (path.extname(templateFile) === '.hbs') {
        const template = handlebars.compile(fse.readFileSync(inputFile).toString());
        const results = template(data);
        fse.writeFileSync(outputFile.replace(/\.hbs$/, ''), results);
      } else {
        fse.copySync(inputFile, outputFile, { overwrite: true });
      }
    });
}
