import chalk from 'chalk';

export function signalStdout (text: string) {
  console.info(chalk.blue(text));
}

export function systemStdout (text: string) {
  console.info(chalk.yellow(text));
}

export function playerStdout (text: string) {
  console.info(chalk.cyan(text));
}
