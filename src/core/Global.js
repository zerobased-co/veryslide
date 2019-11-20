class Global {
  constructor() {
    this.debug = process.env.MODE === 'development';

    this.snap = false;
    this.snapSize = 16;
    this.grabbing = false;
    this.editingObject = null;
    this.ambiguous = '?';
    this.temporary = false;
  }
}

global = new Global();

export default global;
