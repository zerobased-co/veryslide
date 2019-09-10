class Global {
  constructor() {
    this.snap = false;
    this.snapSize = 16;
    this.handling = false;
    this.ambiguous = '?';
  }
}

global = new Global();

export default global;
