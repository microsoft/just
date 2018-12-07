import { task } from 'just-task';
import { tscTask } from './tscTask';

task('typescript', tscTask({}));
task('typescript:watch', tscTask({ watch: true }));

export { tscTask };
