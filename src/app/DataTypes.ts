export class SystemCommand {

  
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