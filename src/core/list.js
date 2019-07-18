class List {
  constructor(...args) {
    this.__TYPE__ = 'List';
    this.head = null;
    this.tail = null;
    this.array = new Array();
    this.count = 0;

    if (args != null) {
      for(var i = 0; i < args.length; i++) {
        this.append(args[i]);
      }
    }
  }
  
  spawn(type, ...args) {
    let node = new type(...args);
    return node;
  }
  
  at(index) {
    return this.array[index];
  }

  iter(func) {
    for(var i = 0; i < this.array.length; i++) {
      func(this.array[i]);
    }
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
    node.prev = null;
    node.next = null;
    node.order = null;
    node.parent = this;

    if (this.tail !== null) {
      this.tail.next = node;
    }
    if (this.head === null) {
      this.head = node;
    }
    node.prev = this.tail;
    node.order = this.count;

    this.array.push(node);
    this.tail = node;
    this.count++;
  }

  put(node, at) {
    // TBD:
  }

  prepend(node) {
    node.prev = null;
    node.next = null;
    node.order = null;
    node.parent = this;

    if (this.head !== null) {
      this.head.prev = node;
    }
    if (this.tail === null) {
      this.tail = node;
    }
    node.next = this.head;
    node.order = 0;

    this.array.unshift(node);
    this.head = node;
    this.count++;

    this.reorder(0);
  }

  reorder(from, to) {
    if (to === undefined) {
      to = this.array.length;
    }

    for(var i = from; i < to; i++) {
      this.array[i].order = i;
    }
  }

  rearray() {
    var node = this.head;
    var order = 0;

    while(node !== null) {
      node.order = order;
      this.array[order] = node;
      
      node = node.next;
      order++;
    }
  }

  remove(node) {
    let nextnode = node.next;

    if (this.head === node) {
      this.head = node.next;
    }
    if (this.tail === node) {
      this.tail = node.prev;
      nextnode = node.prev;
    }
    if (node.prev !== null) {
      node.prev.next = node.next;
    }
    if (node.next !== null) {
      node.next.prev = node.prev;
    }

    this.array.splice(node.order, 1);
    this.reorder(node.order);

    node = undefined;
    this.count--;
    
    return nextnode;
  }

  removeAll() {
    /* not implemented yet */
  }

  makeHead(node) {
    if (this.head === node) return;
    var target = this.head;

    if (this.tail === node) {
      this.tail = node.prev;
    }
    
    if (node.next !== null) {
      node.next.prev = node.prev;
    }
    node.prev.next = node.next;

    target.prev = node;

    node.prev = null;
    node.next = target;
    this.head = node;

    this.rearray(node);

    return node.order;
  }

  makeLast(node) {
    if (this.tail === node) return;
    var target = this.tail;

    if (this.head === node) {
      this.head = node.next;
    }
    
    if (node.prev !== null) {
      node.prev.next = node.next;
    }
    node.next.prev = node.prev;

    target.next = node;

    node.prev = target;
    node.next = null;
    this.tail = node;

    this.rearray();

    return node.order;
  }

  forward(node) {
    if (node.next === null) return;
    var target = node.next;
    
    if (node.prev !== null) {
      node.prev.next = target;
    }

    var _next = target.next;
    target.prev = node.prev;
    target.next = node;
    
    node.prev = target;
    node.next = _next;

    var _order = node.order;
    node.order = target.order;
    target.order = _order;

    this.array[node.order] = node;
    this.array[target.order] = target;

    if (this.tail === target) {
      this.tail = node;
    }

    if (this.head === node) {
      this.head = target;
    }

    return node.order;
  }

  backward(node) {
    if (node.prev === null) return;
    var target = node.prev;
    
    if (node.next !== null) {
      node.next.prev = target;
    }

    var _prev = target.prev;
    target.prev = node;
    target.next = node.next;
    
    node.prev = _prev;
    node.next = target;

    var _order = node.order;
    node.order = target.order;
    target.order = _order;

    this.array[node.order] = node;
    this.array[target.order] = target;

    if (this.head === target) {
      this.head = node;
    }

    if (this.tail === node) {
      this.tail = target;
    }

    return node.order;
  }
}

export default List
