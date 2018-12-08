import glob from 'glob';
import path from 'path';
import fs from 'fs';
import nodeSass from 'node-sass';
import postcss from 'postcss';
import { resolveCwd } from 'just-task';
import autoprefixer from 'autoprefixer';

const autoprefixerFn = autoprefixer({ browsers: ['> 1%', 'last 2 versions', 'ie >= 11'] });

export function sassTask(createSourceModule: (fileName: string, css: string) => string, postcssPlugins: postcss.AcceptedPlugin[] = []) {
  return function sass() {
    const promises: Promise<void>[] = [];
    const files = glob.sync(path.resolve(process.cwd(), 'src/**/*.scss'));

    if (files.length) {
      files.forEach(fileName => {
        fileName = path.resolve(fileName);

        promises.push(
          new Promise((resolve, reject) => {
            nodeSass.render(
              {
                file: fileName,
                outputStyle: 'compressed',
                importer: patchSassUrl,
                includePaths: [path.resolve(process.cwd(), 'node_modules')]
              },
              (err, result) => {
                if (err) {
                  reject(path.relative(process.cwd(), fileName) + ': ' + err);
                } else {
                  const css = result.css.toString();

                  postcss([autoprefixerFn!, ...postcssPlugins])
                    .process(css, { from: fileName })
                    .then(result => {
                      fs.writeFileSync(fileName + '.ts', createSourceModule(fileName, result.css));
                      resolve();
                    });
                }
              }
            );
          })
        );
      });
    }

    return Promise.all(promises);
  };
}

function requireResolvePackageUrl(packageUrl: string) {
  const fullName = packageUrl + (packageUrl.endsWith('.scss') ? '' : '.scss');

  try {
    return resolveCwd(fullName);
  } catch (e) {
    // try again with a private reference
    return resolveCwd(path.join(path.dirname(fullName), `_${path.basename(fullName)}`));
  }
}

function patchSassUrl(url: string, prev: string, done: any) {
  let newUrl: string = url;

  if (url[0] === '~') {
    newUrl = requireResolvePackageUrl(url.substr(1)) || '';
  } else if (url === 'stdin') {
    newUrl = '';
  }

  return { file: newUrl };
}
