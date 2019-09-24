import State from 'core/State';

const HISTORY_QUEUE_LIMIT = 240;

class History extends State {
  constructor(state) {
    super({
      queue: [],
      current: null,
      marker: -1,
    });

    this.prepare();
  }

  prepare() {
    this.current = {};
    this.current['type'] = '';
    this.current['before'] = {};
    this.current['after'] = {};
  }

  insertBeforeList(object) {
    this.current.before[object.uuid] = object.serialize();
  }

  insertAfterList(object) {
    this.current.after[object.uuid] = object.serialize();
  }

  record(type) {
    // slice queue before recording (wipe out previous redo nodes)
    this.queue = this.queue.slice(0, this.marker + 1);

    this.current.type = type;
    this.queue.push(this.current);
    this.prepare();
    this.marker++;

    this.send('Menu:historyChanged', this.undoable(), this.redoable());
  }

  redoable() {
    return (this.queue.length > 0 && this.marker < (this.queue.length - 1));
  }

  redo() {
    if (this.marker + 1 >= this.queue.length) return;
    this.marker++;

    let w = this.queue[this.marker];
    this.send('Controller:deselect');

    switch(w.type) {
      case 'ADD':
        Object.entries(w.after).forEach(([key, value]) => {
          value = JSON.parse(value);
          let obj = null;
          if (value.type === 'Page') { 
            obj = this.send('Controller:addPage', value.order, value, true)[0];
          } else {
            obj = this.send('Controller:addObject', value.type, value.order, value, null, true)[0];
          }
          this.send('Controller:select', obj, true);
        });
        break;
      case 'REMOVE':
        Object.entries(w.before).forEach(([key, value]) => {
          const obj = this.send('Document:find', key)[0];
          if (obj != null) {
            if (obj.type === 'Page') { 
              obj.doc.removePage(obj);
            } else {
              obj.page.removeObject(obj);
            }
          }
        });
        break;
      case 'MODIFY':
        Object.entries(w.after).forEach(([key, value]) => {
          value = JSON.parse(value);
          const obj = this.send('Document:find', key)[0];
          if (obj != null) {
            obj.deserialize(value);
            this.send('Controller:select', obj, true);
          }
        });
        break;
    }
    this.send('Menu:historyChanged', this.undoable(), this.redoable());
  }

  undoable() {
    return (this.marker >= 0);
  }

  undo() {
    if (this.marker < 0) return;

    let w = this.queue[this.marker];
    this.send('Controller:deselect');

    switch(w.type) {
      case 'ADD':
        Object.entries(w.after).forEach(([key, value]) => {
          const obj = this.send('Document:find', key)[0];
          if (obj != null) {
            if (obj.type === 'Page') { 
              obj.doc.removePage(obj);
            } else {
              obj.page.removeObject(obj);
            }
          }
        });
        break;
      case 'REMOVE':
        Object.entries(w.before).forEach(([key, value]) => {
          value = JSON.parse(value);
          let obj = null;
          if (value.type === 'Page') { 
            obj = this.send('Controller:addPage', value.order, value, true)[0];
          } else {
            obj = this.send('Controller:addObject', value.type, value.order, value, null, true)[0];
          }
          this.send('Controller:select', obj, true);
        });
        break;
      case 'MODIFY':
        Object.entries(w.before).forEach(([key, value]) => {
          value = JSON.parse(value);
          const obj = this.send('Document:find', key)[0];
          if (obj != null) {
            obj.deserialize(value);
            this.send('Controller:select', obj, true);
          }
        });
        break;
    }

    this.marker--;
    this.send('Menu:historyChanged', this.undoable(), this.redoable());
  }
}

export default History
