import { Arguments } from 'yargs';

const yargs = jest.genMockFromModule<Arguments>('yargs');
yargs.argv = {};

module.exports = yargs;
