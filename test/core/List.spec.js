import List from 'core/List';

var assert = require('chai').assert;

describe('List', () => {
  it('should be empty when begin', () => {
    let list = new List();
    assert.equal(0, list.array.length);
  });

  it('length should be 1 when an item appended', () => {
    let list = new List();
    list.append(1);
    assert.equal(1, list.length);
  });

  it('length should return array length', () => {
    let list = new List();
    list.append(1);
    list.append(2);
    list.append(3);
    assert.equal(list.length, list.array.length);
  });

  it('items should be appended sequantilly', () => {
    let list = new List();
    for(let i = 0; i < 5; i++) {
      list.append(i);
    }
    assert.equal(5, list.length);
    assert.deepEqual([0, 1, 2, 3, 4], list.array);
  });

  it('items should be prepended in right way', () => {
    let list = new List();
    for(let i = 0; i < 5; i++) {
      list.prepend(i);
    }
    assert.equal(5, list.length);
    assert.deepEqual([4, 3, 2, 1, 0], list.array);
  });

  it('should be initialized with given arguments', () => {
    let list = new List(0, 1, 2, 3, 4);
    assert.deepEqual([0, 1, 2, 3, 4], list.array);
  });

  it('items should be inserted in right positions', () => {
    let list = new List(0, 1, 2, 3, 4);
    list.insert(0.5, 1);
    assert.deepEqual([0, 0.5, 1, 2, 3, 4], list.array);
    list.insert(-1, 0);
    assert.deepEqual([-1, 0, 0.5, 1, 2, 3, 4], list.array);
    list.insert(3.5, -1);
    assert.deepEqual([-1, 0, 0.5, 1, 2, 3, 3.5, 4], list.array);
    list.insert(1.5, 4);
    assert.deepEqual([-1, 0, 0.5, 1, 1.5, 2, 3, 3.5, 4], list.array);
  });

  it('at function should return the right item by zero-based index', () => {
    let list = new List(0, 1, 2, 3, 4);
    assert.equal(2, list.at(2));
  });

  it('iter function should be called by right times as same as length', () => {
    let list = new List(0, 1, 2, 3, 4);
    let count = 0;
    list.iter((item) => {
      count++;
    });
    assert.equal(count, list.length);
  });

  it('find function should return the right index', () => {
    let list = new List(0, 1, 2, 3, 4);
    assert.equal(3, list.find(3));
  });

  it('find function should return -1 when no object found', () => {
    let list = new List(0, 1, 2, 3, 4);
    assert.equal(-1, list.find(6));
  });

  it('findby function should work properly', () => {
    let list = new List(0, 1, 2, 3, 4);
    assert.equal(3, list.findby((item) => {
      return item == 3;
    }));
    assert.equal(null, list.findby((item) => {
      return item == 100;
    }));
  });

  it('items should be removed properly by its position', () => {
    let list = new List(0, 1, 2, 3, 4);

    let next = list.removeAt(100);
    assert.deepEqual([0, 1, 2, 3, 4], list.array);
    assert.equal(null, next);

    next = list.removeAt(-1);
    assert.deepEqual([0, 1, 2, 3, 4], list.array);
    assert.equal(null, next);

    next = list.removeAt(2);
    assert.deepEqual([0, 1, 3, 4], list.array);
    assert.equal(3, next);

    next = list.removeAt(1);
    assert.deepEqual([0, 3, 4], list.array);
    assert.equal(3, next);

    next = list.removeAt(2);
    assert.deepEqual([0, 3], list.array);
    assert.equal(3, next);

    next = list.removeAt(0);
    assert.deepEqual([3], list.array);
    assert.equal(3, next);

    next = list.removeAt(0);
    assert.deepEqual([], list.array);
    assert.equal(null, next);
  });

  it('items should be removed properly by its value', () => {
    let list = new List(0, 1, 2, 3, 4);

    let next = list.remove(100);
    assert.deepEqual([0, 1, 2, 3, 4], list.array);
    assert.equal(null, next);

    next = list.remove(-1);
    assert.deepEqual([0, 1, 2, 3, 4], list.array);
    assert.equal(null, next);

    next = list.remove(2);
    assert.deepEqual([0, 1, 3, 4], list.array);
    assert.equal(3, next);

    next = list.remove(1);
    assert.deepEqual([0, 3, 4], list.array);
    assert.equal(3, next);

    next = list.remove(4);
    assert.deepEqual([0, 3], list.array);
    assert.equal(3, next);
  });

  it('should be empty after removeAll', () => {
    let list = new List(0, 1, 2, 3, 4);
    list.removeAll();
    assert.equal(0, list.length);
  });

  it('makeFirst should be place a item at the first', () => {
    let list = new List(0, 1, 2, 3, 4);

    list.makeFirst(4);
    assert.deepEqual([4, 0, 1, 2, 3], list.array);

    list.makeFirst(4);
    assert.deepEqual([4, 0, 1, 2, 3], list.array);

    list.makeFirst(2);
    assert.deepEqual([2, 4, 0, 1, 3], list.array);
  });

  it('makeLast should be place a item at the end', () => {
    let list = new List(0, 1, 2, 3, 4);

    list.makeLast(0);
    assert.deepEqual([1, 2, 3, 4, 0], list.array);

    list.makeLast(0);
    assert.deepEqual([1, 2, 3, 4, 0], list.array);

    list.makeLast(3);
    assert.deepEqual([1, 2, 4, 0, 3], list.array);
  });

  it('Forward should move a item one step forward', () => {
    let list = new List(0, 1, 2, 3, 4);

    let pos = list.forward(0);
    assert.deepEqual([1, 0, 2, 3, 4], list.array);
    assert.equal(1, pos);

    pos = list.forward(100);
    assert.deepEqual([1, 0, 2, 3, 4], list.array);
    assert.equal(-1, pos);

    pos = list.forward(4);
    assert.deepEqual([1, 0, 2, 3, 4], list.array);
    assert.equal(4, pos);

    pos = list.forward(2);
    assert.deepEqual([1, 0, 3, 2, 4], list.array);
    assert.equal(3, pos);
  });

  it('Backword should move a item one step backword', () => {
    let list = new List(0, 1, 2, 3, 4);

    let pos = list.backward(3);
    assert.deepEqual([0, 1, 3, 2, 4], list.array);
    assert.equal(2, pos);

    pos = list.backward(0);
    assert.deepEqual([0, 1, 3, 2, 4], list.array);
    assert.equal(0, pos);

    pos = list.backward(100);
    assert.deepEqual([0, 1, 3, 2, 4], list.array);
    assert.equal(-1, pos);

    pos = list.backward(4);
    assert.deepEqual([0, 1, 3, 4, 2], list.array);
    assert.equal(3, pos);
  });
});
