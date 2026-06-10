// This config is basically a big E2E test for just-scripts
import fs from 'fs';
import {
  apiExtractorUpdateTask,
  apiExtractorVerifyTask,
  cleanTask,
  copyInstructions,
  copyInstructionsTask,
  copyTask,
  createTarTask,
  esbuildTask,
  eslintTask,
  extractTarTask,
  jestTask,
  logger,
  nodeExecTask,
  parallel,
  prettierCheckTask,
  sassTask,
  series,
  task,
  tscTask,
  watch,
  webpackCliTask,
  webpackDevServerTask,
  webpackTask,
} from 'just-scripts';
import path from 'path';

task('typescript', tscTask({}));
task('typescript:watch', tscTask({ watch: true }));

// creates src/style2.scss.ts
task(
  'sass',
  sassTask({
    createSourceModule: (fileName, css) => {
      logger.info(`processing ${fileName} with sassTask`);
      return `/* eslint-disable */\nexport default ${JSON.stringify(css)};`;
    },
  }),
);

task('build', series('sass', 'typescript'));

task('clean', cleanTask());

task('api', apiExtractorVerifyTask({}));
task('api:update', apiExtractorUpdateTask({}));

task('eslint', eslintTask());
task(
  'prettier:check',
  // newlines cause issues on windows
  process.platform === 'win32'
    ? done => done()
    : prettierCheckTask({
        files: ['src'],
        configPath: path.resolve(__dirname, '../../prettier.config.js'),
        ignorePath: path.resolve(__dirname, '../../.prettierignore'),
      }),
);

task('lint', series('eslint', 'prettier:check'));

task('customNodeTask', nodeExecTask({ enableTypeScript: true, args: ['./src/customTask.ts'] }));

task('bundle:fake', () => {
  const someVar = Math.random();

  return done => {
    logger.info('fake bundle', someVar);
    setTimeout(done, 10);
  };
});

task('bundle:fake:promise', () => {
  return () =>
    new Promise(resolve => {
      logger.info('fake promise bundling files');
      setTimeout(resolve, 10);
    });
});

task('bundle:webpack', webpackTask({ output: { filename: 'index.webpack.js' } }));
task(
  'bundle:webpack:cli',
  webpackCliTask({ webpackCliArgs: ['--output-filename', 'index.webpack-cli.js', '--mode', 'development'] }),
);

task(
  'bundle:esbuild',
  esbuildTask({
    entryPoints: ['./src/index.ts'],
    outfile: './dist/index.esbuild.js',
    bundle: true,
    // The css/scss imports will have warnings about "Ignoring this import" which is fine in context
    // (this bundle is never loaded, so a CSS plugin isn't configured)
    loader: { '.css': 'file', '.scss': 'file', '.jpg': 'dataurl' },
  }),
);

task(
  'bundle',
  parallel(
    series('bundle:fake', 'bundle:fake:promise'),
    series('bundle:webpack', 'bundle:webpack:cli'),
    'bundle:esbuild',
  ),
);

const tarFile = path.join(__dirname, 'dist/sample.tar.gz');
task('tar:create', createTarTask({ file: tarFile, cwd: path.join(__dirname, 'lib') }));
task('tar:extract', extractTarTask({ file: tarFile, cwd: path.join(__dirname, 'dist/extracted') }));

task('tar', series('tar:create', 'tar:extract'));

task('test:jest', jestTask());

task(
  'copy',
  copyTask({
    paths: [path.join(__dirname, 'src/clippy.jpg'), path.join(__dirname, 'src/*.css')],
    dest: path.join(__dirname, 'dist/copied'),
  }),
);

task(
  'copy:instructions',
  copyInstructionsTask({
    copyInstructions: copyInstructions.copyFileToDestinationDirectoryWithRename({
      sourceFilePath: path.join(__dirname, 'src/style1.css'),
      destinationDirectory: path.join(__dirname, 'dist'),
      destinationName: 'renamed-style1.css',
    }),
  }),
);

task('copy:verify', done => {
  const expected = ['dist/renamed-style1.css', 'dist/copied/clippy.jpg', 'dist/copied/style1.css'];
  const missing = expected.filter(file => !fs.existsSync(path.join(__dirname, file)));
  if (missing.length) {
    done(new Error(`Missing expected copied files: ${missing.join(', ')}`));
  }
  logger.info('All expected files copied successfully');
  done();
});

task('copy:all', series('copy', 'copy:instructions', 'copy:verify'));

// Lump bundle and the other random tasks under "test" since they're really tests
task('test', series(parallel('test:jest', 'customNodeTask'), 'bundle', 'tar', 'copy:all'));

task(
  'watch1',
  parallel(
    () => watch(['./src/**/*.js'], pth => console.log('js update', pth)),
    () => watch(['./src/**/*.ts'], pth => console.log('ts update', pth)),
  ),
);

task('watch2', () => {
  const watcher = watch(['./src/**/*.js']);
  watcher.on('change', (evt, file) => {
    console.log(file, 'is changed', evt);
  });
});

task('start', webpackDevServerTask());
