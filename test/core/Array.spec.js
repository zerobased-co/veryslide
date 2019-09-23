import A from 'core/Array';

var assert = require('chai').assert;

describe('Array', () => {
  it('items should be prepended in right way', () => {
    let array = [];
    for(let i = 0; i < 5; i++) {
      A.prepend(array, i);
    }
    assert.equal(5, array.length);
    assert.deepEqual([4, 3, 2, 1, 0], array);
  });

  it('items should be inserted in right positions', () => {
    let array = [0, 1, 2, 3, 4];
    A.insert(array, 0.5, 1);
    assert.deepEqual([0, 0.5, 1, 2, 3, 4], array);
    A.insert(array, -1, 0);
    assert.deepEqual([-1, 0, 0.5, 1, 2, 3, 4], array);
    A.insert(array, 3.5, -1);
    assert.deepEqual([-1, 0, 0.5, 1, 2, 3, 3.5, 4], array);
    A.insert(array, 1.5, 4);
    assert.deepEqual([-1, 0, 0.5, 1, 1.5, 2, 3, 3.5, 4], array);
  });

  it('items should be removed properly by its position', () => {
    let array = [0, 1, 2, 3, 4];

    let next = A.removeAt(array, 100);
    assert.deepEqual([0, 1, 2, 3, 4], array);
    assert.equal(null, next);

    next = A.removeAt(array, -1);
    assert.deepEqual([0, 1, 2, 3, 4], array);
    assert.equal(null, next);

    next = A.removeAt(array, 2);
    assert.deepEqual([0, 1, 3, 4], array);
    assert.equal(3, next);

    next = A.removeAt(array, 1);
    assert.deepEqual([0, 3, 4], array);
    assert.equal(3, next);

    next = A.removeAt(array, 2);
    assert.deepEqual([0, 3], array);
    assert.equal(3, next);

    next = A.removeAt(array, 0);
    assert.deepEqual([3], array);
    assert.equal(3, next);

    next = A.removeAt(array, 0);
    assert.deepEqual([], array);
    assert.equal(null, next);
  });

  it('items should be removed properly by its value', () => {
    let array = [0, 1, 2, 3, 4];

    let next = A.remove(array, 100);
    assert.deepEqual([0, 1, 2, 3, 4], array);
    assert.equal(null, next);

    next = A.remove(array, -1);
    assert.deepEqual([0, 1, 2, 3, 4], array);
    assert.equal(null, next);

    next = A.remove(array, 2);
    assert.deepEqual([0, 1, 3, 4], array);
    assert.equal(3, next);

    next = A.remove(array, 1);
    assert.deepEqual([0, 3, 4], array);
    assert.equal(3, next);

    next = A.remove(array, 4);
    assert.deepEqual([0, 3], array);
    assert.equal(3, next);
  });

  it('makeFirst should place a item at the first', () => {
    let array = [0, 1, 2, 3, 4];

    A.makeFirst(array, 4);
    assert.deepEqual([4, 0, 1, 2, 3], array);

    A.makeFirst(array, 4);
    assert.deepEqual([4, 0, 1, 2, 3], array);

    A.makeFirst(array, 2);
    assert.deepEqual([2, 4, 0, 1, 3], array);
  });

  it('makeLast should place a item at the end', () => {
    let array = [0, 1, 2, 3, 4];

    A.makeLast(array, 0);
    assert.deepEqual([1, 2, 3, 4, 0], array);

    A.makeLast(array, 0);
    assert.deepEqual([1, 2, 3, 4, 0], array);

    A.makeLast(array, 3);
    assert.deepEqual([1, 2, 4, 0, 3], array);
  });

  it('Forward should move a item one step forward', () => {
    let array = [0, 1, 2, 3, 4];

    let pos = A.forward(array, 0);
    assert.deepEqual([1, 0, 2, 3, 4], array);
    assert.equal(1, pos);

    pos = A.forward(array, 100);
    assert.deepEqual([1, 0, 2, 3, 4], array);
    assert.equal(-1, pos);

    pos = A.forward(array, 4);
    assert.deepEqual([1, 0, 2, 3, 4], array);
    assert.equal(4, pos);

    pos = A.forward(array, 2);
    assert.deepEqual([1, 0, 3, 2, 4], array);
    assert.equal(3, pos);
  });

  it('Backward should move a item one step backward', () => {
    let array = [0, 1, 2, 3, 4];

    let pos = A.backward(array, 3);
    assert.deepEqual([0, 1, 3, 2, 4], array);
    assert.equal(2, pos);

    pos = A.backward(array, 0);
    assert.deepEqual([0, 1, 3, 2, 4], array);
    assert.equal(0, pos);

    pos = A.backward(array, 100);
    assert.deepEqual([0, 1, 3, 2, 4], array);
    assert.equal(-1, pos);

    pos = A.backward(array, 4);
    assert.deepEqual([0, 1, 3, 4, 2], array);
    assert.equal(3, pos);
  });

  it('prev should return the previous item', () => {
    let array = [0, 1, 2, 3, 4];

    assert.equal(3, A.prev(array, 4));
    assert.equal(1, A.prev(array, 2));
    assert.equal(null, A.prev(array, 0));
  });

  it('next should return the next item', () => {
    let array = [0, 1, 2, 3, 4];

    assert.equal(4, A.next(array, 3));
    assert.equal(2, A.next(array, 1));
    assert.equal(null, A.next(array, 4));
  });
});
