interface IsInterface {
  object: (a: any) => boolean;
  number: (a: any) => boolean;
  string: (a: any) => boolean;
  array: (a: any) => boolean;
  undef: (a: any) => boolean;
  validID: (id: any) => boolean;
}

const is = (function (): IsInterface {
  const obj = (a: any): boolean => {
    return typeof a === "object" && a !== null;
  };

  const num = (a: any): boolean => {
    return typeof a === "number";
  };

  const str = (a: any): boolean => {
    return typeof a === "string";
  };

  const arr = (a: any): boolean => {
    return Array.isArray(a);
  };

  const undef = (a: any): boolean => {
    return typeof a === "undefined";
  };

  const validID = (id: any): boolean => {
    return is.number(id) || is.string(id);
  };
  
  return {
    object: obj,
    number: num,
    string: str,
    array: arr,
    undef,
    validID
  };
}());

const updateProps = (a: Record<string, any>, b: Record<string, any>): boolean => {
  let changed = false;
  if (!is.object(a) || !is.object(b)) {
    return false;
  }
  
  Object.keys(b).forEach(prop => {
    if (is.object(a[prop])) {
      changed = updateProps(a[prop], b[prop]) || changed;
    }
    else if (is.array(a[prop]) && is.array(b[prop])) {
      for (let i = 0, iMax = b[prop].length; i < iMax; i++) {
        if (is.object(a[prop][i])) {
          changed = updateProps(a[prop][i], b[prop][i]) || changed;
        }
        else if (a[prop][i] !== b[prop][i]) {
          a[prop][i] = b[prop][i];
          changed = true;
        }
      }
    }
    else if (a[prop] !== b[prop]) {
      a[prop] = b[prop];
      changed = true;
    }
  });

  return changed;
};

export { is, updateProps };