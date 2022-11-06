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

export enum OperatorSymbol {

  merge = "+",
  link = "->",
  unlink = "-x",
  generate = "undef",
  edit = "=",
  remove = "~",
  highlight = "^",
  unknown = "undef"
}

// special command level for generate command to enable recognition by inference
export enum OperatorLevel {

  generate = 0
}

export enum OperatorType {

  binary = "bi",
  unary = "uni"
}

export interface CommandDef {

  name: OperatorName;
  symbol: OperatorSymbol;
  cmdLvl: number;
  type: OperatorType;
  options: OptionDef[];
  index: number;
}

export interface OptionDef {

  name: string;
  default: string;
  values: string[];
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
}

export class SystemCommand {

  private operatorName: OperatorName;
  private cmdLvl: number;
  private operands: string[] | SystemCommand[] = [];

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