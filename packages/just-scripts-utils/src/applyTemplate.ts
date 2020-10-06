import * as glob from 'glob';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as handlebars from 'handlebars';
import { logger } from './logger';

export interface ApplyTemplateResult {
  /** Whether a fatal error occurred */
  error?: boolean;
  /** Number of files/folders processed successfully (not counting warnings) */
  processed?: number;
  /** Number of files/folders for which processing was unsuccessful */
  warnings?: number;
}

/**
 * Apply a template to a project directory. If the directory doesn't exist, it will be created.
 * If the directory exists, contents will be merged with the files/folders from the template.
 *
 * @param templateDir Path to the directory containing the template
 * @param projectDir Path to the destination project to create/update
 * @param templateData If the template contains any handlebars files, this will be passed to them
 * when compiling
 * @returns Object indicating whether the template application was successful
 */
export function applyTemplate(templateDir: string, projectDir: string, templateData?: any): ApplyTemplateResult {
  let templateFiles: string[];
  try {
    templateFiles = glob.sync('**/*', { cwd: templateDir, dot: true, nodir: true, ignore: ['node_modules/**/*', '**/.DS_Store'] });
  } catch (ex) {
    logger.error(`Error finding template files under ${templateDir}: ${ex}`);
    return { error: true, processed: 0, warnings: 0 };
  }

  if (!fse.existsSync(projectDir)) {
    try {
      fse.mkdirpSync(projectDir);
    } catch (ex) {
      logger.error(`Couldn't create directory ${projectDir}: ${ex}`);
      return { error: true, processed: 0, warnings: 0 };
    }
  }

  let processed = 0;
  let warnings = 0;
  templateFiles.forEach(templateFile => {
    if (_processFileFromTemplate(templateFile, templateDir, projectDir, templateData)) {
      ++processed;
    } else {
      ++warnings;
    }
  });

  return { processed, warnings };
}

/**
 * Exported for testing only. Processes a file or folder from a template.
 * @param templateFile Path to a file/folder that's part of a template, relative to template root
 * @param templateDir Path to the folder the template is being copied from
 * @param projectDir Path to the folder the template is being copied to
 * @param templateData If the file is a handlebars template, this will be passed to it when compiling
 * @returns true if no errors occur
 */
export function _processFileFromTemplate(templateFile: string, templateDir: string, projectDir: string, templateData?: any): boolean {
  const inputFilePath = path.join(templateDir, templateFile);
  const outputFilePath = path.join(projectDir, templateFile);

  if (!fse.existsSync(inputFilePath)) {
    logger.warn(`File ${inputFilePath} does not exist. Skipping.`);
    return false;
  }

  try {
    const inputStat = fse.statSync(inputFilePath);
    const inputIsDir = inputStat.isDirectory();
    if (fse.existsSync(outputFilePath)) {
      const outputIsDir = fse.statSync(outputFilePath).isDirectory();
      if (inputIsDir !== outputIsDir) {
        logger.warn(
          `Template ${templateFile} is a ${inputIsDir ? 'directory' : 'file'} ` +
            `in source but a ${outputIsDir ? 'directory' : 'file'} in destination. Skipping.`
        );
        return false;
      }
    }

    if (inputIsDir) {
      fse.mkdirpSync(outputFilePath);
    } else {
      if (path.extname(templateFile) === '.hbs') {
        _writeHbsFile(inputFilePath, outputFilePath, templateData);
      } else {
        fse.copySync(inputFilePath, outputFilePath, { overwrite: true });
      }
    }
  } catch (ex) {
    logger.warn(`Error processing template ${templateFile} (skipping): ${ex}`);
    return false;
  }
  return true;
}

/**
 * Exported for testing only. Process a handlebars template.
 * @param inputFile Full path to the handlebars template
 * @param outputFile Full path to the destination file
 * @param templateData Data passed to the template when compiling
 */
export function _writeHbsFile(inputFile: string, outputFile: string, templateData?: any) {
  // Intentionally allowing exceptions to propagate and be handled by caller
  const fileContents = fse.readFileSync(inputFile).toString();
  const template = handlebars.compile(fileContents);
  const results = template(templateData);
  fse.writeFileSync(outputFile.replace(/\.hbs$/, ''), results);
}
