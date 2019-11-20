import State from 'core/State';

const HISTORY_QUEUE_LIMIT = 240; // TBD: not applied yet

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
    this.current['pageUuid'] = null;
    this.current['selectedObjects'] = [];
    this.current['reorder'] = false;
  }

  setReorder(target) {
    this.current['reorder'] = true;
  }

  insertBeforeList(object) {//, selected) {
    if (object.uuid in this.current.before) return;

    this.current.before[object.uuid] = {
      uuid: object.uuid,
      order: object.order,
      data: object.serialize(),
      //selected: selected,
    };
  }

  insertAfterList(object) {//, selected) {
    if (object.uuid in this.current.after) return;

    this.current.after[object.uuid] = {
      uuid: object.uuid,
      order: object.order,
      data: object.serialize(),
      //selected: selected,
    };
  }

  record(type, selectedObjects, focusedPage) {
    // slice queue before recording (wipe out previous redo nodes)
    this.queue = this.queue.slice(0, this.marker + 1);

    // sort items by order
    this.current.pageUuid = focusedPage.uuid;
    this.current.after = sortObject(this.current.after, 'order');
    this.current.before = sortObject(this.current.before, 'order');
    this.current.selectedObjects = selectedObjects.map((obj) => { return obj.uuid });
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
    // Deselect before doing something
    this.send('Controller:deselect');
    // Select the right page
    if (w.pageUuid != null) {
      const page = this.send('Document:find', w.pageUuid)[0];
      if (page) {
        this.send('Controller:focusPage', page);
      }
    }

    switch(w.type) {
      case 'ADD':
        w.after.forEach(item => {
          const data = JSON.parse(item['data']);
          let obj = null;
          if (data.type === 'Page') {
            obj = this.send('Controller:addPage', data.order, {uuid: data.uuid}, true)[0];
            obj.deserialize(data);
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

        // Select recorded previous selection
        this.send('Controller:deselect');
        w.selectedObjects.forEach(uuid => {
          const obj = this.send('Document:find', uuid)[0];
          if (obj != null) {
            this.send('Controller:select', obj, true);
          }
        });
        break;
      case 'MODIFY':
        w.after.forEach(item => {
          const data = JSON.parse(item['data']);
          const obj = this.send('Document:find', item['uuid'])[0];
          if (obj != null) {
            obj.deserialize(data);
            if (item['selected'] === true) {
              this.send('Controller:select', obj, true);
            }
          }
        });
        if (w.reorder) {
          w.reorder.rebuild();
        }
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
    // Deselect before doing something
    this.send('Controller:deselect');
    // Select the right page
    if (w.pageUuid != null) {
      const page = this.send('Document:find', w.pageUuid)[0];
      if (page) {
        this.send('Controller:focusPage', page);
      }
    }

    switch(w.type) {
      case 'ADD':
        w.after.forEach(item => {
          const obj = this.send('Document:find', item['uuid'])[0];
          if (obj != null) {
            this.send('Controller:select', obj, true);
          }
        });
        this.send('Controller:remove', true);

        // Select recorded previous selection
        this.send('Controller:deselect');
        w.selectedObjects.forEach(uuid => {
          const obj = this.send('Document:find', uuid)[0];
          if (obj != null) {
            this.send('Controller:select', obj, true);
          }
        });
        break;
      case 'REMOVE':
        w.before.forEach(item => {
          const data = JSON.parse(item['data']);
          let obj = null;
          if (data.type === 'Page') {
            obj = this.send('Controller:addPage', data.order, {uuid: data.uuid}, true)[0];
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
            if (item['selected'] === true) {
              this.send('Controller:select', obj, true);
            }
          }
        });
        if (w.reorder) {
          w.reorder.rebuild();
        }
        break;
    }

    this.marker--;
    this.send('Menu:historyChanged', this.undoable(), this.redoable());
  }
}

export default History
