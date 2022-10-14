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

  setText(newItemTxt: string) {

    // TODO: imp
  }

  setStatus(newStatus: boolean) {

    // TODO: imp
  }

  generateRecord(): string {
    
    // super basic meta info packaging
    return ListEntry.entryType + ')' + this.id + ")" + this.completed + ")" + this.todoText;
  }
}