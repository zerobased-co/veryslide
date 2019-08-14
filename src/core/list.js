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
  
  at(index) {
    return this.array[index];
  }

  iter(func) {
    for(var i = 0; i < this.array.length; i++) {
      func(this.array[i]);
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
    this.array = this.array.slice(0, at - 1).concat(this.array.slice(at, this.array.length))
    if (at <= this.array.length) {
      return this.array[at];
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

  makeHead(node) {
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
    if (target > this.array.length) return -1;

    this.array[at] = this.array[target];
    this.array[target] = node;

    return target;
  }

  backward(node) {
    let at = this.find(node);
    if (at === -1) return -1;

    let target = at - 1;
    if (target < 0) return -1;

    this.array[at] = this.array[target];
    this.array[target] = node;

    return target;
  }
}

export default List
