class List {
  constructor(type) {
    this.type = type;
    this.head = null;
    this.tail = null;
    this.count = 0;
  }
  
  spawn(...args) {
    let node = new this.type(...args);
    node.prev = null;
    node.next = null;
    node.parent = this;
    return node;
  }
  
  at(index) {
    /* not implemented yet */
  }

  append(node) {
    if (this.tail !== null) {
      this.tail.next = node;
    }
    if (this.head === null) {
      this.head = node;
    }
    node.prev = this.tail;
    this.tail = node;
    this.count++;
  }

  prepend(node) {
    if (this.head !== null) {
      this.head.prev = node;
    }
    if (this.tail === null) {
      this.tail = node;
    }
    node.next = this.head;
    this.head = node;
    this.count++;
  }

  remove(node) {
    if (this.head === node) {
      this.head = node.next;
    }
    if (this.tail === node) {
      this.tail = node.prev;
    }
    if (node.prev !== null) {
      node.prev.next = node.next;
    }
    if (node.next !== null) {
      node.next.prev = node.prev;
    }
    node = undefined;
    this.count--;
  }

  removeAll() {
    /* not implemented yet */
  }
}

export default List
