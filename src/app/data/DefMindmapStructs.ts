import { NonNullableFormBuilder } from "@angular/forms";

export interface Stateful {

  blks: MmBlock[];

  getBlks(): MmBlock[];
  setBlks(newBlks: MmBlock[]): void;
}

export interface Highlightable {

  lightOn: boolean;
  lightColor: string;

  hasSpotlight(): boolean;
  spotlightOff(): void;
  spotlightOn(color: string): void;
  getSpotlight(): string;
}

export class MmBlock {

  private st: number;
  private ed: number;
  private dispHeight: number;
  private rowId: number;
  private blkId: number;
  private owner: Stateful | null;

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

  setOwner(newOwner: Stateful) {

    this.owner = newOwner;
  }

  free() {

    this.owner = null;
    this.isFree();
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

export class MmNode implements Highlightable, Stateful {

  private a: number;
  private b: number;

  private cx: number;
  private cy: number;
  private txt: string;
  private id: string;

  private parentLink: MmLink | null;
  private childrenLinks: MmLink[];

  private clusterSize: number;

  public blks: MmBlock[];

  public lightOn: boolean;
  public lightColor: string;

  constructor(parentLink: MmLink | null, x: number, y: number, txt: string, id: string, a: number, b: number) {

    this.a = a;
    this.b = b;

    this.parentLink = parentLink;

    this.cx = x;
    this.cy = y;
    this.txt = txt;
    this.id = id;

    this.childrenLinks = [];
    this.blks = [];

    this.clusterSize = 1;

    this.lightOn = false;
    this.lightColor = "black";
  }

  getRadiusX() {

    return this.a;
  }

  getRadiusY() {

    return this.b;
  }

  hasSpotlight(): boolean {

    return this.lightOn;
  }

  spotlightOff() {

    this.lightOn = false;
  }

  spotlightOn(color: string) {

    this.lightColor = color;
    this.lightOn = true;
  }

  getSpotlight(): string {

    if (this.lightOn) {

      return this.lightColor;
    } else {

      return "black";
    }
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

export class MmLink implements Highlightable, Stateful {

  private parent: MmNode;
  private child: MmNode;

  private st: number[];
  private ed: number[];

  public blks: MmBlock[] = [];

  public lightOn: boolean;
  public lightColor: string;

  constructor(child: MmNode, parent: MmNode, st: number[], ed: number[]) {

    this.parent = parent;
    this.child = child;

    this.st = st;
    this.ed = ed;

    this.lightOn = false;
    this.lightColor = "black";
  }

  hasSpotlight(): boolean {
    
    return this.lightOn;
  }

  spotlightOff(): void {
    
    this.lightOn = false;
  }

  spotlightOn(color: string): void {
    
    this.lightColor = color;
    this.lightOn = true;
  }

  getSpotlight(): string {
    
    if (this.lightOn) {

      return this.lightColor;
    } else {

      return "black";
    }
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
  private rowSize: number;
  private colSize: number;
  
  private mjAxDir: number;
  private minAxDir: number;
  private slope: number;
  private intercept: number;
  private dxToNxt: number;
  private dyToNxt: number;

  private parent: MmNode;

  private curPt: number[];

  constructor(sampleAxis: string, st: number[], ed: number[], rowSize: number, colSize: number, child: MmNode, parent: MmNode) {

    this.sampleAxis = sampleAxis;
    this.rowSize = rowSize;
    this.colSize = colSize;

    this.parent = parent;

    this.curPt = [st[0], st[1]];

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

    // provide offset to st to init premise for next()
    while (this.contains(child, this.curPt)) {

      this.next();
    }

    // assert this.st is first blk outside starting zone
  }

  private yGetNextDy() {

    if (this.mjAxDir > 0) {

      return this.rowSize - this.curPt[1] % this.rowSize;
    } else {

      return this.curPt[1] % this.rowSize;
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

      return this.rowSize - this.curPt[1] % this.rowSize;
    } else {

      return this.curPt[1] % this.rowSize;
    }
  }

  // assert scaledDy is a magnitude value (>= 0)
  private xGetScaledDy():number {

    var ret = this.dyToNxt / this.slope;

    return ret < 0 ? ret * -1 : ret;
  }

  private xGetNextDx() {

    if (this.mjAxDir > 0) {

      return this.colSize - this.curPt[0] % this.colSize;
    } else {

      return this.curPt[0] % this.colSize;
    }
  }

  private coordToBlkId(pt: number[]): number[] {

    var rowId = Math.floor(pt[1] / this.rowSize);
    var colId = Math.floor(pt[0] / this.colSize);

    return [rowId, colId];
  }

  private contains(stNode: MmNode, curPt: number[]) {

    var curBlk: number[] = this.coordToBlkId(curPt);
    
    var findBlk: MmBlock | undefined = stNode.getBlks().find((blk: MmBlock) => blk.getRowId() === curBlk[0] && blk.getBlkId() === curBlk[1]);

    return findBlk !== undefined;
  }

  // assert st is alr next would-be, check if st is in same block as ed
  hasNext(): boolean {

    return !this.contains(this.parent, this.curPt);
  }

  // assert next val is alr ready, prepping for next next, returning next
  next(): number[] {

    var ret: number[] = this.coordToBlkId(this.curPt);

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
    this.curPt[1] += this.mjAxDir * (this.dyToNxt + 1);

    // update dyToNxt
    this.dyToNxt = this.yGetNextDy();
  }

  incX() {

    // edit st[0] or st[1] based on min(dxToNxt, scaled dy)
    if (this.dxToNxt < this.xGetScaledDy()) {

      // update st[0], update st[1] from st[0]
      this.curPt[0] += this.mjAxDir * ((this.dxToNxt) + 1);
      this.curPt[1] = this.slope * this.curPt[0] + this.intercept;
    } else {

      // update st[1], update st[0] from st[1]
      this.curPt[1] += this.minAxDir * (this.dyToNxt + 1);
      this.curPt[0] = (this.curPt[1] - this.intercept) / this.slope;
    }

    // update dxToNxt, dyToNxt
    this.dxToNxt = this.xGetNextDx();
    this.dyToNxt = this.xGetNextDy();
  }
}