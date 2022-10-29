export enum OperatorName {

  merge = "merge",
  link = "link",
  unlink = "unlink",
  generate = "generate",
  edit = "edit",
  remove = "remove",
  highlight = "highlight",
  unknown = "unknown"
}

export function getOptName(name: string) {

  if (name === 'merge') {

    return OperatorName.merge;
  } else if (name === 'link') {

    return OperatorName.link;
  } else if (name === 'unlink') {

    return OperatorName.unlink;
  } else if (name === 'edit') {

    return OperatorName.edit;
  } else if (name === 'remove') {

    return OperatorName.remove;
  } else if (name === 'highlight') {

    return OperatorName.highlight;
  } else {

    return OperatorName.unknown;
  }
}

export function getOperatorLevel(name: OperatorName) {

  if (name === OperatorName.merge) {

    return 3;
  } else if (name === OperatorName.link || name === OperatorName.unlink) {

    return 2;
  } else if (name === OperatorName.generate) {

    return 0;
  } else {

    // edit, remove, or highlight
    return 1;
  }
}

export class TrieNode {

  val: string;
  next: TrieNode[];
  isCommand: boolean;
  commandInfo: CommandDef | null;

  constructor(val: string, isCommand: boolean, commandInfo: CommandDef | null) {

    this.val = val;
    this.next = [];
    this.isCommand = isCommand;
    this.commandInfo = commandInfo;
  }

  append(child: TrieNode) {

    this.next.push(child);
  }
}

export interface CommandDef {

  name: string;
  symbol: string;
  type: string;
  options: OptionDef[];
}

export interface OptionDef {

  name: string;
  default: string;
  values: string[];
}

export class SystemCommand {

  private operatorName: OperatorName;
  private cmdLvl: number;
  private operands: string[] | SystemCommand[];

  constructor(optName: OperatorName, cmdLvl: number, operands: string[] | SystemCommand[]) {

    this.operatorName = optName;
    this.cmdLvl = cmdLvl;
    this.operands = operands;
  }

  getOperatorName() {

    return this.operatorName;
  }

  getCmdLvl() {

    return this.cmdLvl;
  }

  getOperands() {

    return this.operands;
  }
}

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

  parent: MmNode;
  child: MmNode;

  st: number[];
  ed: number[];
  // stAngle: number[];
  // edAngle: number[];

  constructor(child: MmNode, parent: MmNode, st: number[], ed: number[]) {

    this.parent = parent;
    this.child = child;

    this.st = st;
    // this.stAngle = stAngle;
    // this.edAngle = edAngle;
    this.ed = ed;
  }

  getStStr() {

    return this.st[0] + "," + this.st[1];
  }

  getEdStr() {

    return this.ed[0] + "," + this.ed[1];
  }

  // getStAnStr() {

  //   return this.stAngle[0] + "," + this.stAngle[1];
  // }

  // getEdAnStr() {

  //   return this.edAngle[0] + "," + this.edAngle[1];
  // }
}

export class MmNode {

  private cx: number;
  private cy: number;
  private txt: string;
  private id: string;
  
  private parentLink: MmLink | null;
  private childrenLinks: MmLink[] = [];

  constructor(parentLink: MmLink | null, x: number, y: number, txt: string, id: string) {

    this.parentLink = parentLink;

    this.cx = x;
    this.cy = y;
    this.txt = txt;
    this.id = id;
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

  contains(point: number[]) {

    return Math.abs(point[0] - this.cx) < 75 && Math.abs(point[1] - this.cy) < 37;
  }

  // getPortLocation(to: MmNode): number[] {

    // case on location of to relative to self
    // separate x/y gives 2 checks -> find assertion

    /**
     * model links as straight lines between self and to: node
     * 
     * to obtain port location on self:
     * 
     * - set self as origin
     * - solve for interaction between self and line connecting self to to: node
     *    - case on relation positioning to get specific coord solution
     * - translate solution back to grid coordinates by applying self coord as offset
     * 
     * note on scope of this function:
     * - might not be appropriate as object function anymore
     *    - high chance being able to reuse computation to resolve neighbor port as well
     */


    // var res: number[] = [];
    // return res;

    // normalize the sizing parameters later

    // var xOffset = 35;
    // var yOffset = 20;
    // var xCtrlPtOffset = 50;
    // var yCtrlPtOffset = 25;

    // var ret: number[][] = [];
    // var resAn: number[] = [];

    // if (this.cx < to.getCx()) {

    //   res.push(this.cx + xOffset);
    //   resAn.push(res[0] + xCtrlPtOffset);
    // } else if (this.cx > to.getCx()) {

    //   res.push(this.cx - xOffset);
    //   resAn.push(res[0] - xCtrlPtOffset);
    // } else {

    //   res.push(this.cx);
    //   resAn.push(res[0]);
    // }

    // resAn.push(this.cy);

    // if (this.cy < to.getCy()) {

    //   res.push(this.cy + yOffset);
    // } else if (this.cy > to.getCy()) {

    //   res.push(this.cy - yOffset);
    // } else {

    //   res.push(this.cy);
    // }
  // }
}

export interface RecordEntry {

  generateRecord(): string;
}

/**
 * typescript doesnt support static signature in interfaces
 * 
 * static decorator is experimental...
 * 
 * well, this is what i would have used:
 * 
 * export interface RecordEntryStatic {
 * 
 *  entryType: string;
 * 
 *  fromRecord(record: string): RecordEntry;
 * }
 */
export class ListEntry implements RecordEntry {

  static entryType: string = 'ListEntry';
  
  static fromRecord(record: string): ListEntry {

    // i can write this recursively or with loop, but i need custom arr of decision maker functions
    var id = Number(record.substring(0, record.indexOf(')')));
    record = record.substring(record.indexOf(')') + 1);

    var completed = record.substring(0, record.indexOf(')')) === 'true';
    record = record.substring(record.indexOf(')') + 1);

    return new ListEntry(id, record, completed);
  }

  private id: number;
  private todoText: string;
  private completed: boolean;
  private openForEdit: boolean = false;

  constructor(id: number, todoText: string, completed: boolean) {

    this.id = id;
    this.todoText = todoText;
    this.completed = completed;
  }

  getId() {

    return this.id;
  }

  getText() {

    return this.todoText;
  }

  isComplete() {

    return this.completed;
  }

  isOpenForEdit() {

    return this.openForEdit;
  }

  setText(newItemTxt: string) {

    // TODO: imp
    this.todoText = newItemTxt;
  }

  setStatus(newStatus: boolean) {

    // TODO: imp
    this.completed = newStatus;
  }

  setEditFlag(newFlag: boolean) {

    this.openForEdit = newFlag;
  }

  generateRecord(): string {
    
    // super basic meta info packaging
    return ListEntry.entryType + ')' + this.id + ")" + this.completed + ")" + this.todoText;
  }
}