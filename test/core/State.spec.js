import State from 'core/State';

var assert = require('chai').assert;

describe('State', () => {
  let testState;

  beforeEach(() => {
    testState = new State({});
  });

  it('should initialize with empty state', () => {
    assert.equal(0, Object.keys(testState.state).length);
  });

  it('should set and get properties correctly', () => {
    testState.set('testProp', 'testValue');
    assert.equal('testValue', testState.get('testProp'));
  });

  it('should trigger updateState callback when property changes', (done) => {
    testState.updateState = () => {
      done();
    };
    
    testState.set('testProp', 'testValue');
  });

  it('should bind properties with getters and setters', () => {
    testState.bind('boundProp', 'initialValue');
    
    assert.equal('initialValue', testState.boundProp);
    
    testState.boundProp = 'newValue';
    assert.equal('newValue', testState.get('boundProp'));
  });

  it('should serialize state to JSON', () => {
    testState.set('prop1', 'value1');
    testState.set('prop2', 42);
    testState.set('prop3', true);
    
    const serialized = testState.serialize();
    const parsed = JSON.parse(serialized);
    
    assert.equal('value1', parsed.prop1);
    assert.equal(42, parsed.prop2);
    assert.equal(true, parsed.prop3);
  });

  it('should deserialize state from JSON', () => {
    const jsonData = JSON.stringify({
      prop1: 'value1',
      prop2: 42,
      prop3: true
    });
    
    testState.deserialize(jsonData);
    
    assert.equal('value1', testState.get('prop1'));
    assert.equal(42, testState.get('prop2'));
    assert.equal(true, testState.get('prop3'));
  });

  it('should handle pairs for two-way binding', () => {
    const targetState = new State();
    targetState.bind('targetProp', 'initial');
    
    testState.pair('sourceProp', targetState, 'targetProp');
    testState.set('sourceProp', 'syncedValue');
    
    assert.equal('syncedValue', targetState.get('targetProp'));
  });
});