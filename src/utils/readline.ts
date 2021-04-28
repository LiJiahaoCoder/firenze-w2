import { createInterface } from 'readline';

const _rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question (query: string): Promise<string> {
  return new Promise((resolve) => {
    _rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

function close () {
  _rl.close();
}

export const rl = {
  close,
  question,
};
