import { AbbrPipe } from "./abbr.pipe";

it('should throw with invalid values', () => {
  const pipe = new AbbrPipe();
  expect(() => pipe.transform(undefined as any)).toThrow();
  expect(() => pipe.transform(null as any)).toThrowError('Value is not a string');
});

it('should return null if an empty string is passed', () => {
  const pipe = new AbbrPipe();
  expect(pipe.transform('')).toEqual(null);
});

it('should abbreviate names', () => {
  const pipe = new AbbrPipe();
  expect(pipe.transform('Simon Hischier')).toEqual('SH');
});
