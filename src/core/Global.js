class Global {
  constructor() {
    this.snap = false;
    this.snapSize = 16;
    this.grabbing = false;
    this.editingObject = null;
    this.ambiguous = '?';
  }
}

global = new Global();

export default global;
