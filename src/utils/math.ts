export const C = <T>(arr: T[], num: number) => {
  let r = [];

  (function f (t: T[], a, n) {
    if (n == 0) return r.push(t);

    for (let i = 0, l = a.length; i <= l - n; i++) {
      f(t.concat(a[i]), a.slice(i + 1), n - 1);
    }
  })([], arr ,num);

  return r;
};
