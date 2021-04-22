import { add } from '@/index';

describe('index.ts file tests', function () {
  test('Given 2 and 4, should get 6, when call add method', function () {
    expect(add(2, 4)).toBe(6);
  });
});
