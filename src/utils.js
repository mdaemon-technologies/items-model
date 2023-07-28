const is = (function () {
  const obj = (a) => {
    return typeof a === "object" && a !== null;
  };

  const num = (a) => {
    return typeof a === "number";
  };

  const str = (a) => {
    return typeof a === "string";
  };

  const arr = (a) => {
    return Array.isArray(a);
  };

  const undef = (a) => {
    return typeof a === "undefined";
  };

  return {
    object: obj,
    number: num,
    string: str,
    array: arr,
    undef
  };
}());

const updateProps = (a, b) => {
  let changed = false;
  if (!is.object(a) || !is.object(b)) {
    return false;
  }
  
  Object.keys(b).forEach(prop => {
    if (is.object(a[prop])) {
      changed = updateProps(a[prop], b[prop]);
    }
    else if (is.array(a[prop]) && is.array(b[prop])) {
      for (var i = 0, iMax = b[prop].length; i < iMax; i++) {
        if (is.object(a[prop][i])) {
          changed = updateProps(a[prop][i], b[prop][i]);
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

const isValidID = (id) => {
  return is.number(id) || is.string(id);
};

export { is, updateProps, isValidID };