import chalk from 'chalk';

const l = msg => console.log(`${new Date().toLocaleTimeString()} - ${msg}`);

export const log = {
  info: message => l(message),
  error: message => l(`${chalk.red('Error: ')} ${message}`),
  fileInfo: (filename, message) => l(`${chalk.green(filename)} - ${message}`),
  fileError: (filename, message) => l(`${chalk.red(filename)} - ${message}`),
};
