import channel from 'core/Channel';

var assert = require('chai').assert;

describe('Channel', () => {
  beforeEach(() => {
    channel.cleanup();
  });

  it('should initialize with empty listeners', () => {
    assert.equal(0, Object.keys(channel.listeners).length);
  });

  it('should add listeners for events', () => {
    const mockListener = {};
    const mockHandler = () => {};
    channel.listen(mockListener, 'testEvent', mockHandler);
    
    assert.equal(1, channel.listeners['testEvent'].length);
    assert.equal(mockListener, channel.listeners['testEvent'][0].listener);
  });

  it('should trigger listeners when event is emitted', (done) => {
    const testData = { message: 'test' };
    
    channel.on('testEvent', (data) => {
      assert.deepEqual(testData, data);
      done();
    });
    
    channel.trigger('testEvent', testData);
  });

  it('should trigger multiple listeners for same event', () => {
    let callCount = 0;
    
    channel.on('testEvent', () => callCount++);
    channel.on('testEvent', () => callCount++);
    
    channel.trigger('testEvent');
    
    assert.equal(2, callCount);
  });

  it('should remove specific listener', () => {
    const listener1 = () => {};
    const listener2 = () => {};
    
    channel.on('testEvent', listener1);
    channel.on('testEvent', listener2);
    
    assert.equal(2, channel.listeners['testEvent'].length);
    
    channel.off('testEvent', listener1);
    
    assert.equal(1, channel.listeners['testEvent'].length);
    assert.equal(listener2, channel.listeners['testEvent'][0]);
  });

  it('should remove all listeners for an event', () => {
    channel.on('testEvent', () => {});
    channel.on('testEvent', () => {});
    
    assert.equal(2, channel.listeners['testEvent'].length);
    
    channel.off('testEvent');
    
    assert.equal(0, channel.listeners['testEvent'].length);
  });

  it('should handle triggering non-existent events gracefully', () => {
    // Should not throw error
    channel.trigger('nonExistentEvent', {});
    assert.equal(true, true); // Test passes if no error thrown
  });
});