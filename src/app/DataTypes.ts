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

  private operatorName: string;
  private baseOpt: boolean;
  private operands: string | string[] | SystemCommand[];

  constructor(optName: string, baseOpt: boolean, operands: string | string[] | SystemCommand[]) {

    this.operatorName = optName;
    this.baseOpt = baseOpt;
    this.operands = operands;
  }

  getOperatorName() {

    return this.operatorName;
  }

  isBaseOpt() {

    return this.baseOpt;
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

  st: number[];
  ed: number[];
  stAngle: number[];
  edAngle: number[];

  constructor(st: number[], stAngle: number[], edAngle: number[], ed: number[]) {

    this.st = st;
    this.ed = ed;
    this.stAngle = stAngle;
    this.edAngle = edAngle;
  }

  getStStr() {

    return this.st[0] + "," + this.st[1];
  }

  getEdStr() {

    return this.ed[0] + "," + this.ed[1];
  }

  getStAnStr() {

    return this.stAngle[0] + "," + this.stAngle[1];
  }

  getEdAnStr() {

    return this.edAngle[0] + "," + this.edAngle[1];
  }
}

export class MmNode {

  private cx: number;
  private cy: number;
  private txt: string;
  private id: string;

  constructor(x: number, y: number, txt: string, id: string) {

    this.cx = x;
    this.cy = y;
    this.txt = txt;
    this.id = id;
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