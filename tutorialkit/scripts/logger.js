import chalk from 'chalk';

export function success(text) {
  console.log(`${chalk.bgGreen(chalk.black(' SUCCESS '))} ${text}`);
}

export function info(text) {
  console.log(`${chalk.bgBlue(chalk.black(' INFO '))} ${text}`);
}

export function warn(text) {
  console.log(`${chalk.bgYellow(chalk.black(' WARN '))} ${text}`);
}

export function error(text) {
  console.log(`${chalk.bgRed(chalk.black(' ERROR '))} ${text}`);
}
