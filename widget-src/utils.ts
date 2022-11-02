// Borrowed from https://www.figma.com/plugin-docs/editing-properties

export function clone<T>(val: T): T {
  const type = typeof val
  if (val === null) {
    return null as T;
  } else if (type === 'undefined' || type === 'number' ||
             type === 'string' || type === 'boolean') {
    return val
  } else if (type === 'object') {
    if (val instanceof Array) {
      return val.map(x => clone(x)) as T;
    } else if (val instanceof Uint8Array) {
      return new Uint8Array(val) as T;
    } else {
      let o: any = {}
      for (const key in val) {
        o[key] = clone(val[key])
      }
      return o
    }
  }
  throw 'unknown'
}
