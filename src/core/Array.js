class A {
  static clone(array) {
    return array.slice(0);
  }

  static prev(array, node) {
    let at = array.indexOf(node);
    if (at == -1 || at == 0) {
      return null;
    }
    return array[at - 1];
  }

  static next(array, node) {
    let at = array.indexOf(node);
    if (at == -1 || at == (array.length - 1)) {
      return null;
    }
    return array[at + 1];
  }

  static insert(array, node, at) {
    array.splice(at, 0, node);
  }

  static append(array, node) {
    array.push(node);
  }

  static prepend(array, node) {
    array.unshift(node);
  }

  static findby(array, func) {
    for(let i = 0, l = array.length; i < l; i++) {
      if (func(array[i]) === true) {
        return array[i];
      }
    }
    return null;
  }

  static removeAt(array, at) {
    if (at < 0 || at >= array.length) {
      return null;
    }

    array.splice(at, 1);
    if (at < array.length) {
      return array[at];
    } else {
      if (array.length > 0) {
        return array[array.length - 1];
      }
    }
    return null;
  }

  static remove(array, node) {
    let at = array.indexOf(node);
    if (at !== -1) {
      return this.removeAt(array, at);
    }
    return null;
  }

  static makeFirst(array, node) {
    let at = array.indexOf(node);
    if (at === -1) return -1;

    this.removeAt(array, at);
    this.prepend(array, node);

    return 0;
  }

  static makeLast(array, node) {
    let at = array.indexOf(node);
    if (at === -1) return -1;

    this.removeAt(array, at);
    this.append(array, node);

    return array.length;
  }

  static forward(array, node) {
    let at = array.indexOf(node);
    if (at === -1) return -1;

    let target = at + 1;
    if (target >= array.length) return at;

    array[at] = array[target];
    array[target] = node;

    return target;
  }

  static backward(array, node) {
    let at = array.indexOf(node);
    if (at === -1) return -1;

    let target = at - 1;
    if (target < 0) return 0;

    array[at] = array[target];
    array[target] = node;

    return target;
  }
}

export default A
