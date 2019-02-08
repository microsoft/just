const path = require('path');
const fse = require('fs-extra');
const glob = require('glob');
const json = require('json5');
const { applyTemplate } = require('just-scripts-utils');

describe('stack snapshot', () => {
  const snapshotPath = path.resolve(__dirname, 'temp');
  const templatePath = path.resolve(__dirname, 'template');
  let jsonFiles;

  afterAll(() => {
    fse.removeSync(snapshotPath);
  });

  beforeAll(() => {
    applyTemplate(templatePath, snapshotPath, { name: 'testproject' });
    jsonFiles = glob.sync('**/*.json', { cwd: snapshotPath });
  });

  it('has legal json files', () => {
    jsonFiles.forEach(jsonFile => {
      if (jsonFile.includes('rush')) {
        expect(
          () => json.parse(fse.readFileSync(path.resolve(snapshotPath, jsonFile)).toString()),
          `${jsonFile} cannot be parsed as JSON (with comments).`
        ).not.toThrow();
      } else {
        expect(
          () => JSON.parse(fse.readFileSync(path.resolve(snapshotPath, jsonFile)).toString()),
          `${jsonFile} cannot be parsed as JSON.`
        ).not.toThrow();
      }
    });
  });
});
