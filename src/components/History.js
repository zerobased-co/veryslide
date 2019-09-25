import State from 'core/State';

const HISTORY_QUEUE_LIMIT = 240;

function sortObject(obj, key) {
  return Object.values(obj).sort((a, b) => (a[key] > b[key]) ? 1 : -1)
}

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
    this.current.before[object.uuid] = {uuid: object.uuid, order: object.order, data: object.serialize()};
  }

  insertAfterList(object) {
    this.current.after[object.uuid] = {uuid: object.uuid, order: object.order, data: object.serialize()};
  }

  record(type) {
    // slice queue before recording (wipe out previous redo nodes)
    this.queue = this.queue.slice(0, this.marker + 1);

    // sort items by order
    this.current.after = sortObject(this.current.after, 'order');
    this.current.before = sortObject(this.current.before, 'order');
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
        w.after.forEach(item => {
          const data = JSON.parse(item['data']);
          let obj = null;
          if (data.type === 'Page') {
            obj = this.send('Controller:addPage', data.order, data, true)[0];
          } else {
            obj = this.send('Controller:addObject', data.type, data.order, data, null, true)[0];
          }
          this.send('Controller:select', obj, true);
        });
        break;
      case 'REMOVE':
        w.before.forEach(item => {
          const obj = this.send('Document:find', item['uuid'])[0];
          if (obj != null) {
            this.send('Controller:select', obj, true);
          }
        });
        this.send('Controller:remove', true);
        break;
      case 'MODIFY':
        w.after.forEach(item => {
          const data = JSON.parse(item['data']);
          const obj = this.send('Document:find', item['uuid'])[0];
          if (obj != null) {
            obj.deserialize(data);
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
        w.after.forEach(item => {
          const obj = this.send('Document:find', item['uuid'])[0];
          if (obj != null) {
            this.send('Controller:select', obj, true);
          }
        });
        this.send('Controller:remove', true);
        break;
      case 'REMOVE':
        w.before.forEach(item => {
          const data = JSON.parse(item['data']);
          let obj = null;
          if (data.type === 'Page') {
            obj = this.send('Controller:addPage', data.order, null, true)[0];
            obj.deserialize(data);
          } else {
            obj = this.send('Controller:addObject', data.type, data.order, data, null, true)[0];
          }
          this.send('Controller:select', obj, true);
        });
        break;
      case 'MODIFY':
        w.before.forEach(item => {
          const data = JSON.parse(item['data']);
          const obj = this.send('Document:find', item['uuid'])[0];
          if (obj != null) {
            obj.deserialize(data);
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
