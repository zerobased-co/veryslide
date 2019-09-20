import History from 'components/History';
import Document from 'components/Document';

const assert = require('chai').assert;

describe('History', () => {
  let doc, page, history;

  beforeEach(() => {
    doc = new Document();
    page = doc.addPage();

    history = new History();
  });

  afterEach(() => {
  });


  it('should be prepared when initialize', () => {
    let newHistory = new History();
    assert.notEqual(newHistory.current, null);
    assert.equal(newHistory.redoable(), false);
    assert.equal(newHistory.undoable(), false);
  });

  it('should be recorded well', () => {
    let object = page.addObject('TextBox');
    history.insertAfterList(object);
    history.record('ADD');

    history.insertBeforeList(object);
    object.text = 'much';
    history.insertAfterList(object);
    history.record('MODIFY');

    assert.equal(history.marker, 1);
    assert.equal(history.queue.length, 2);
    assert.equal(history.redoable(), false);
    assert.equal(history.undoable(), true);
  });

  it('should run undo', () => {
    let object = page.addObject('TextBox');
    history.insertAfterList(object);
    history.record('ADD');
    const defaultText = object.text;

    history.insertBeforeList(object);
    object.text = 'Much';
    history.insertAfterList(object);
    history.record('MODIFY');

    history.undo();
    assert.equal(object.text, defaultText);

    history.undo();
    assert.equal(page.objects.length, 0);
  });

  it('should run redo', () => {
    let object = page.addObject('TextBox');
    history.insertAfterList(object);
    history.record('ADD');

    history.insertBeforeList(object);
    object.text = 'Much';
    history.insertAfterList(object);
    history.record('MODIFY');

    history.undo();
    history.redo();
    assert.equal(object.text, 'Much');
  });

  it('should strip history queue', () => {
    let object = page.addObject('TextBox');
    history.insertAfterList(object);
    history.record('ADD');

    history.insertBeforeList(object);
    object.text = 'Much';
    history.insertAfterList(object);
    history.record('MODIFY');

    history.insertBeforeList(object);
    object.text = 'So';
    history.insertAfterList(object);
    history.record('MODIFY');

    history.undo();
    history.undo();
    assert.equal(object.text, 'Very');

    history.insertBeforeList(object);
    object.text = 'Again';
    history.insertAfterList(object);
    history.record('MODIFY');

    assert.equal(history.redoable(), false);
  });
});
