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

export class LinkPath {

  private sampleAxis: string;
  private st: number[];
  private ed: number[];
  private rowSize: number;
  private colSize: number;
  
  private mjAxDir: number;
  private minAxDir: number;
  private slope: number;
  private intercept: number;
  private dxToNxt: number;
  private dyToNxt: number;

  private edBlk: number[];

  constructor(sampleAxis: string, st: number[], ed: number[], rowSize: number, colSize: number, child: MmNode, parent: MmNode) {

    this.sampleAxis = sampleAxis;
    this.st = st;
    this.ed = ed;
    this.rowSize = rowSize;
    this.colSize = colSize;

    if (sampleAxis === 'x') {

      this.mjAxDir = st[0] > ed[0] ? -1 : 1;
      this.minAxDir = st[1] > ed[1] ? -1 : 1;
      this.slope = (st[1] - ed[1]) / (st[0] - ed[0]);
      this.intercept = st[1] - this.slope * st[0];
      
      this.dyToNxt = this.xGetNextDy();
      this.dxToNxt = this.xGetNextDx();
    } else {

      this.mjAxDir = st[1] > ed[1] ? -1 : 1;
      this.minAxDir = 1;
      this.slope = 0;
      this.intercept = st[0];
      
      this.dyToNxt = this.yGetNextDy();
      this.dxToNxt = 999;
    }

    this.edBlk = this.coordToBlkId(ed);

    // provide offset to st to init premise for next()
    while (by peek, if child contains next blk) {

      next block = this.next();
    }

    // update has next to check for parent blk ownership instead
  }

  private yGetNextDy() {

    if (this.mjAxDir > 0) {

      return this.rowSize - this.st[1] % this.rowSize;
    } else {

      return this.st[1] % this.rowSize;
    }
  }

  private xGetNextDy() {

    /**
     * 1. set current y coord
     * 2. compute y coord of anchor line
     * 3. dy is diff(anchor_y, cur_y)
     * 
     * case on direction
     */

    // assert current y === st[1]
    if (this.minAxDir > 0) {

      var anchorY = this.rowSize - this.st[1] % this.rowSize;
      
      return anchorY - this.st[1];
    } else {

      return this.st[1] % this.rowSize;
    }
  }

  private xGetNextDx() {

    if (this.mjAxDir > 0) {

      return this.colSize - this.st[0] % this.colSize;
    } else {

      return this.st[0] % this.colSize;
    }
  }

  private coordToBlkId(pt: number[]): number[] {

    var rowId = Math.floor(pt[1] / this.rowSize);
    var colId = Math.floor(pt[0] / this.colSize);

    return [rowId, colId];
  }

  // assert st is alr next would-be, check if st is in same block as ed
  hasNext(): boolean {

    var stBlk: number[] = this.coordToBlkId(this.st);

    return stBlk[0] === this.edBlk[0] && stBlk[1] === this.edBlk[1];
  }

  // assert next val is alr ready, prepping for next next, returning next
  next(): number[] {

    var ret: number[] = this.coordToBlkId(this.st);

    // prep for next st, case on sampling axis
    if (this.sampleAxis === 'x') {

      this.incX();
    } else {

      this.incY();
    }

    return ret;
  }

  incY() {

    // dx === 0 special case, edit st[1] to progress
    this.st[1] += this.mjAxDir * (this.dyToNxt + 1);

    // update dyToNxt
    this.dyToNxt = this.yGetNextDy();
  }

  incX() {

    // edit st[0] or st[1] based on min(dxToNxt, dyToNxt)
    if (this.dxToNxt < this.dyToNxt) {

      // update st[0], update st[1] from st[0]
      this.st[0] += this.mjAxDir * this.dxToNxt;
      this.st[1] = this.slope * this.st[0] + this.intercept;
    } else {

      // update st[1], update st[0] from st[1]
      this.st[1] += this.minAxDir * this.dyToNxt;
      this.st[0] = (this.st[1] - this.intercept) / this.slope;
    }

    // update dxToNxt, dyToNxt
    this.dxToNxt = this.xGetNextDx();
    this.dyToNxt = this.xGetNextDy();
  }
}