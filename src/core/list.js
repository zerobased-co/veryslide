class List {
  constructor(type) {
    this.type = type;
    this.head = null;
    this.tail = null;
    this.array = new Array();
    this.count = 0;
  }
  
  spawn(...args) {
    let node = new this.type(...args);
    node.prev = null;
    node.next = null;
    node.order = null;
    node.parent = this;
    return node;
  }
  
  at(index) {
    return this.array[index];
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

    console.log('after append ', typeof this.type, this.array);
    console.log('count', this.count);
  }

  prepend(node) {
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

    this.reorder(1);
  }

  reorder(from) {
    console.log('reordering ', typeof this.type, ' from ', from, ' to ', this.array.length);
    for(var i = from; i < this.array.length; i++) {
      this.array[i].order = i;
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
    console.log('after splice ', typeof this.type, this.array);
    console.log('count', this.count);

    this.reorder(node.order);

    node = undefined;
    this.count--;
    
    return nextnode;
  }

  removeAll() {
    /* not implemented yet */
  }
}

export default List
