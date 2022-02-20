import chalk from 'chalk';

const l = msg => console.log(`${new Date().toLocaleTimeString()} - ${msg}`);

export const log = {
  info: message => l(message),
  error: message => l(`${chalk.red('Error: ')} ${message}`),
  fileChanged: filename => l(`${chalk.green('Changed:')} ${filename}`),
  fileAdded: filename => l(`${chalk.magenta('Added:')} ${filename}`),
};
