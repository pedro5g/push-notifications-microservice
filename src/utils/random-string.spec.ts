import { randomString } from './random-string';

describe('RandomString Function', () => {
  it('should return a string of default length 10', () => {
    const result = randomString();
    expect(result).toBeTypeOf('string');
    expect(result).toHaveLength(10);
  });

  it('should return a string with specified length', () => {
    const len = 20;
    const result = randomString(len);
    expect(result).toHaveLength(len);
  });

  it('should contain only letters when "a" is passed', () => {
    const result = randomString(15, 'a');

    expect(/^[A-Za-z]+$/.test(result)).toBe(true);
  });

  it('should contain only numbers when "n" is passed', () => {
    const result = randomString(15, 'n');
    expect(/^[0-9]+$/.test(result)).toBe(true);
  });

  it('should contain alphanumeric characters by default', () => {
    const result = randomString(50);

    expect(/^[A-Za-z0-9]+$/.test(result)).toBe(true);
  });

  it('should return an empty string when length is 0', () => {
    const result = randomString(0);
    expect(result).toBe('');
  });
});
