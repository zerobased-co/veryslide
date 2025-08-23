import BaseObject from 'components/objects/BaseObject';

var assert = require('chai').assert;

describe('BaseObject', () => {
  let baseObject;

  beforeEach(() => {
    baseObject = new BaseObject();
  });

  it('should initialize with default properties', () => {
    assert.equal('BaseObject', baseObject.get('type'));
    assert.equal(0, baseObject.get('x'));
    assert.equal(0, baseObject.get('y'));
    assert.equal(100, baseObject.get('width'));
    assert.equal(100, baseObject.get('height'));
    assert.equal(0, baseObject.get('rotation'));
    assert.equal(1, baseObject.get('opacity'));
    assert.equal(true, baseObject.get('visible'));
  });

  it('should have unique uuid', () => {
    const obj1 = new BaseObject();
    const obj2 = new BaseObject();

    assert.notEqual(obj1.uuid, obj2.uuid);
    assert.equal('string', typeof obj1.uuid);
  });

  it('should serialize and deserialize correctly', () => {
    baseObject.set('x', 50);
    baseObject.set('y', 75);
    baseObject.set('width', 200);
    baseObject.set('opacity', 0.5);

    const serialized = baseObject.serialize();
    const newObject = new BaseObject();
    newObject.deserialize(serialized);

    assert.equal(50, newObject.get('x'));
    assert.equal(75, newObject.get('y'));
    assert.equal(200, newObject.get('width'));
    assert.equal(0.5, newObject.get('opacity'));
  });

  it('should calculate correct bounds', () => {
    baseObject.set('x', 10);
    baseObject.set('y', 20);
    baseObject.set('width', 100);
    baseObject.set('height', 50);

    const bounds = baseObject.getBounds();

    assert.equal(10, bounds.left);
    assert.equal(20, bounds.top);
    assert.equal(110, bounds.right);
    assert.equal(70, bounds.bottom);
    assert.equal(100, bounds.width);
    assert.equal(50, bounds.height);
  });

  it('should detect point containment', () => {
    baseObject.set('x', 10);
    baseObject.set('y', 10);
    baseObject.set('width', 100);
    baseObject.set('height', 100);

    assert.equal(true, baseObject.contains(50, 50));  // inside
    assert.equal(true, baseObject.contains(10, 10));  // top-left corner
    assert.equal(true, baseObject.contains(110, 110)); // bottom-right corner
    assert.equal(false, baseObject.contains(5, 50));   // outside left
    assert.equal(false, baseObject.contains(115, 50)); // outside right
    assert.equal(false, baseObject.contains(50, 5));   // outside top
    assert.equal(false, baseObject.contains(50, 115)); // outside bottom
  });

  it('should handle visibility changes', () => {
    assert.equal(true, baseObject.get('visible'));

    baseObject.set('visible', false);
    assert.equal(false, baseObject.get('visible'));

    baseObject.show();
    assert.equal(true, baseObject.get('visible'));

    baseObject.hide();
    assert.equal(false, baseObject.get('visible'));
  });

  it('should handle transformation properties', () => {
    baseObject.set('rotation', 45);
    baseObject.set('opacity', 0.7);

    assert.equal(45, baseObject.get('rotation'));
    assert.equal(0.7, baseObject.get('opacity'));
  });
});