export function randomString(len: number = 10, an?: 'a' | 'n') {
  let str = '',
    i = 0;
  const min = an && an.toString() === 'a' ? 10 : 0,
    max = an && an.toString() === 'n' ? 10 : 62;
  for (; i++ < len; ) {
    let r = (Math.random() * (max - min) + min) << 0;
    str += String.fromCharCode((r += r > 9 ? (r < 36 ? 55 : 61) : 48));
  }
  return str;
}
