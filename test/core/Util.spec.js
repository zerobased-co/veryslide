import { uuid, escapeHtml, unescapeHtml } from 'core/Util';

var assert = require('chai').assert;

describe('Util', () => {
  describe('uuid', () => {
    it('should generate unique identifiers', () => {
      const uuid1 = uuid();
      const uuid2 = uuid();
      
      assert.notEqual(uuid1, uuid2);
      assert.equal('string', typeof uuid1);
      assert.equal('string', typeof uuid2);
    });

    it('should generate UUIDs of consistent format', () => {
      const id = uuid();
      
      // Should be a string with dashes in UUID format
      assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
      
      assert.equal(expected, escapeHtml(input));
    });

    it('should escape ampersands', () => {
      const input = 'Tom & Jerry';
      const expected = 'Tom &amp; Jerry';
      
      assert.equal(expected, escapeHtml(input));
    });

    it('should handle empty strings', () => {
      assert.equal('', escapeHtml(''));
    });

    it('should escape quotes and equals', () => {
      const input = 'name="value"';
      const expected = 'name&#x3D;&quot;value&quot;';
      
      assert.equal(expected, escapeHtml(input));
    });
  });

  describe('unescapeHtml', () => {
    it('should unescape HTML entities', () => {
      const input = '&lt;div&gt;Hello&lt;/div&gt;';
      const expected = '<div>Hello</div>';
      
      assert.equal(expected, unescapeHtml(input));
    });

    it('should handle mixed content', () => {
      const input = 'Tom &amp; Jerry &lt;3';
      const expected = 'Tom & Jerry <3';
      
      assert.equal(expected, unescapeHtml(input));
    });
  });
});