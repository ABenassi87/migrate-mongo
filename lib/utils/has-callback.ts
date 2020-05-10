import fnArgs from 'fn-args';

export default function (func: any): boolean {
  const argNames: string[] = fnArgs(func);
  const lastIdx: number = argNames?.length - 1 ?? -1;
  const lastArgName = argNames[lastIdx] ?? null;

  return ['callback', 'callback_', 'cb', 'cb_', 'next', 'next_', 'done', 'done_'].includes(lastArgName);
}
