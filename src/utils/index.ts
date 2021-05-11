export const getDuplicatedElement = <T>(arr: T[]) => {
  const r: T[] = [];

  for (let i = 0; i < arr.length; i++) {
    let count = 0;

    for (let j = 0; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        count++;
      }
    }

    if (count > 1 && r.indexOf(arr[i]) === -1) {
      r.push(arr[i]);
    }
  }

  return r;
};
