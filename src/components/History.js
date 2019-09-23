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
    console.log('RECORD', this.queue.length, this.current);
    this.prepare();
    this.marker++;
    console.log('NOW MARKET AT', this.marker);

    this.send('Menu:historyChanged', this.undoable(), this.redoable());
  }

  redoable() {
    return (this.queue.length > 0 && this.marker < (this.queue.length - 1));
  }

  redo() {
    if (this.marker + 1 >= this.queue.length) return;
    this.marker++;

    let w = this.queue[this.marker];

    switch(w.type) {
      case 'ADD':
        Object.entries(w.after).forEach(([key, value]) => {
          console.log('REDO:ADD', value);
          value = JSON.parse(value);
          if (value.type === 'Page') { 
            this.send('Controller:addPage', value.order, value, true);
          } else {
            this.send('Controller:addObject', value.type, value.order, value, null, true);
          }
        });
        break;
      case 'REMOVE':
        Object.entries(w.before).forEach(([key, value]) => {
          console.log('REDO:REMOVE', value);
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

    switch(w.type) {
      case 'ADD':
        Object.entries(w.after).forEach(([key, value]) => {
          console.log('UNDO:ADD', value);
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
          console.log('UNDO:REMOVE', value);
          value = JSON.parse(value);
          if (value.type === 'Page') { 
            this.send('Controller:addPage', value.order, value, true);
          } else {
            this.send('Controller:addObject', value.type, value.order, value, null, true);
          }
        });
        break;
      case 'MODIFY':
        Object.entries(w.before).forEach(([key, value]) => {
          value = JSON.parse(value);
          const obj = this.send('Document:find', key)[0];
          if (obj != null) {
            obj.deserialize(value);
          }
        });
        break;
    }

    this.marker--;
    this.send('Menu:historyChanged', this.undoable(), this.redoable());
  }
}

export default History
