export class MmBlock {

  private st: number;
  private ed: number;
  public dispHeight: number;
  public blockId: number;
  public isFree: boolean;

  constructor(st: number, ed: number, dispHeight: number, blockId: number) {

    this.st = st;
    this.ed = ed;
    this.dispHeight = dispHeight;
    this.blockId = blockId;
    this.isFree = true;
  }

  getStart() {

    return this.st;
  }

  getEnd() {

    return this.ed;
  }

  setStart(newSt: number) {

    this.st = newSt;
  }

  setEnd(newEd: number) {

    this.ed = newEd;
  }
}

export class MmLink {

  blks: MmBlock[] = [];

  parent: MmNode;
  child: MmNode;

  st: number[];
  ed: number[];

  constructor(child: MmNode, parent: MmNode, st: number[], ed: number[]) {

    this.parent = parent;
    this.child = child;

    this.st = st;
    this.ed = ed;
  }

  setBlks(blk: MmBlock[]) {

    this.blks = blk;
  }

  getStStr() {

    return this.st[0] + "," + this.st[1];
  }

  getEdStr() {

    return this.ed[0] + "," + this.ed[1];
  }
}

export class MmNode {

  private cx: number;
  private cy: number;
  private txt: string;
  private id: string;
  private blks: MmBlock[] = [];

  private parentLink: MmLink | null;
  private childrenLinks: MmLink[] = [];

  constructor(parentLink: MmLink | null, x: number, y: number, txt: string, id: string) {

    this.parentLink = parentLink;

    this.cx = x;
    this.cy = y;
    this.txt = txt;
    this.id = id;
  }

  getBlks() {

    return this.blks;
  }

  setBlks(blks: MmBlock[]) {

    this.blks = blks;
  }

  setParentLink(newLink: MmLink) {

    this.parentLink = newLink;
  }

  getParentLink() {

    return this.parentLink;
  }

  getChildrenLinks() {

    return this.childrenLinks;
  }

  getCx() {

    return this.cx;
  }

  getCy() {

    return this.cy;
  }

  getTxt() {

    return this.txt;
  }

  getId() {

    return this.id;
  }

  setCx(newX: number) {

    this.cx = newX;
  }

  setCy(newY: number) {

    this.cy = newY;
  }

  setTxt(newTxt: string) {

    this.txt = newTxt;
  }

  setId(newId: string) {

    this.id = newId;
  }
}