export class MmBlock {

  private st: number;
  private ed: number;
  private dispHeight: number;
  private rowId: number;
  private blkId: number;
  private owner: MmNode | MmLink | null;

  constructor(st: number, ed: number, dispHeight: number, rowId: number, blkId: number) {

    this.st = st;
    this.ed = ed;
    this.dispHeight = dispHeight;
    this.rowId = rowId;
    this.blkId = blkId;

    this.owner = null;
  }

  getDispHeight() {

    return this.dispHeight;
  }

  getRowId() {

    return this.rowId;
  }

  getBlkId() {

    return this.blkId;
  }

  isFree() {

    return this.owner === null;
  }

  getOwner() {

    return this.owner;
  }

  setOwner(newOwner: MmNode | MmLink) {

    this.owner = newOwner;
  }

  free() {

    this.owner = null;
  }

  getStart() {

    return this.st;
  }

  setStart(newSt: number) {

    this.st = newSt;
  }

  getEnd() {

    return this.ed;
  }

  setEnd(newEd: number) {

    this.ed = newEd;
  }
}

export class MmNode {

  private cx: number;
  private cy: number;
  private txt: string;
  private id: string;

  private parentLink: MmLink | null;
  private childrenLinks: MmLink[];

  private blks: MmBlock[];

  private clusterSize: number;

  constructor(parentLink: MmLink | null, x: number, y: number, txt: string, id: string) {

    this.parentLink = parentLink;

    this.cx = x;
    this.cy = y;
    this.txt = txt;
    this.id = id;

    this.childrenLinks = [];
    this.blks = [];

    this.clusterSize = 1;
  }

  getClusterSize() {

    return this.clusterSize;
  }

  setClusterSize(newSize: number) {

    this.clusterSize = newSize;
  }

  getBlks() {

    return this.blks;
  }

  setBlks(blks: MmBlock[]) {

    this.blks = blks;
  }

  getParentLink() {

    return this.parentLink;
  }

  setParentLink(newLink: MmLink | null) {

    this.parentLink = newLink;
  }

  getChildrenLinks() {

    return this.childrenLinks;
  }

  getCx() {

    return this.cx;
  }

  setCx(newX: number) {

    this.cx = newX;
  }

  getCy() {

    return this.cy;
  }

  setCy(newY: number) {

    this.cy = newY;
  }

  getTxt() {

    return this.txt;
  }

  setTxt(newTxt: string) {

    this.txt = newTxt;
  }

  getId() {

    return this.id;
  }

  setId(newId: string) {

    this.id = newId;
  }
}

export class MmLink {

  private parent: MmNode;
  private child: MmNode;

  private st: number[];
  private ed: number[];

  private blks: MmBlock[] = [];

  constructor(child: MmNode, parent: MmNode, st: number[], ed: number[]) {

    this.parent = parent;
    this.child = child;

    this.st = st;
    this.ed = ed;
  }

  getParent() {

    return this.parent;
  }

  setParent(newParent: MmNode) {

    this.parent = newParent;
  }

  getChild() {

    return this.child;
  }

  setChild(newChild: MmNode) {

    this.child = newChild;
  }

  getBlks() {

    return this.blks;
  }

  setBlks(blk: MmBlock[]) {

    this.blks = blk;
  }

  getSt() {
    
    return this.st;
  }

  getStStr() {

    return this.st[0] + "," + this.st[1];
  }

  setSt(a: number, b: number) {

    this.st[0] = a;
    this.st[1] = b;
  }

  getEd() {

    return this.ed;
  }

  getEdStr() {

    return this.ed[0] + "," + this.ed[1];
  }

  setEd(a: number, b: number) {

    this.ed[0] = a;
    this.ed[1] = b;
  }
}