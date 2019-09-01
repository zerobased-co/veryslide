class List {
  constructor(...args) {
    this.__TYPE__ = 'List';
    this.array = new Array();

    if (args != null) {
      for(var i = 0; i < args.length; i++) {
        this.append(args[i]);
      }
    }
  }

  get length() {
    return this.array.length;
  }

  clone() {
    let newList = new List();
    newList.array = this.array.slice(0);
    return newList;
  }
  
  at(index) {
    return this.array[index];
  }

  iter(func) {
    for(var i = 0; i < this.array.length; i++) {
      func(this.array[i], i);
    }
  }

  find(node) {
    for(var i = 0; i < this.array.length; i++) {
      if (this.array[i] === node) return i;
    }
    return -1;
  }

  findby(func) {
    for(var i = 0; i < this.array.length; i++) {
      if (func(this.array[i]) === true) {
        return this.array[i];
      }
    }
    return null;
  }

  prev(node) {
    let at = this.find(node);
    if (at == -1 || at == 0) {
      return null;
    }
    return this.array[at - 1];
  }

  next(node) {
    let at = this.find(node);
    if (at == -1 || at == (this.array.length - 1)) {
      return null;
    }
    return this.array[at + 1];
  }

  append(node) {
    this.array.push(node);
  }

  insert(node, at) {
    this.array.splice(at, 0, node);
  }

  prepend(node) {
    this.array.unshift(node);
  }

  removeAt(at) {
    if (at < 0 || at >= this.array.length) {
      return null;
    }

    this.array = this.array.slice(0, at).concat(this.array.slice(at + 1, this.array.length))
    if (at < this.array.length) {
      return this.array[at];
    } else {
      if (this.array.length > 0) {
        return this.array[this.array.length - 1];
      }
    }
    return null;
  }

  remove(node) {
    let at = this.find(node);
    if (at !== -1) {
      return this.removeAt(at);
    }
    return null;
  }

  removeAll() {
    this.array = new Array();
  }

  makeFirst(node) {
    let at = this.find(node);
    if (at === -1) return -1;

    this.removeAt(at);
    this.prepend(node);

    return 0;
  }

  makeLast(node) {
    let at = this.find(node);
    if (at === -1) return -1;

    this.removeAt(at);
    this.append(node);

    return this.array.length;
  }

  forward(node) {
    let at = this.find(node);
    if (at === -1) return -1;

    let target = at + 1;
    if (target >= this.array.length) return at;

    this.array[at] = this.array[target];
    this.array[target] = node;

    return target;
  }

  backward(node) {
    let at = this.find(node);
    if (at === -1) return -1;

    let target = at - 1;
    if (target < 0) return 0;

    this.array[at] = this.array[target];
    this.array[target] = node;

    return target;
  }
}

export default List
