import format from 'date-fns/format';

export function now(dateString = Date.now()): Date {
  const date = new Date(dateString);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  );
}

export function nowAsString(): string {
  return format(now(), 'yyyyMMddHHmmss');
}
