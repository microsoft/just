import { Arguments } from 'yargs';
import path from 'path';

const yargs = jest.genMockFromModule<Arguments>('yargs');
yargs.argv = {
  config: path.join(__dirname, 'just-task.js')
};

yargs.demandCommand = function() {
  return yargs;
};

yargs.help = function() {
  return yargs;
};

module.exports = yargs;
