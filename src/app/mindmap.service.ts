import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CommandDef, OptionDef, SystemCommand, TrieNode } from './DataTypes';

@Injectable({
  providedIn: 'root'
})
export class MindmapService {

  private symbolSrc = "/assets/internal/MmSystemCommands.json";
  private extraOptsMarker = "--";

  private symPrefRoot!: TrieNode;
  
  constructor(private http: HttpClient) {

    this.loadSymbols();
  }

  printTrie(rt: TrieNode) {

    console.log(rt.val);

    if (rt.next.length === 0) {

      console.log(rt.commandInfo);
    } else {

      rt.next.forEach((child: TrieNode) => {this.printTrie(child);});
    }
  }

  async loadSymbols() {

    var src = this.http.get<CommandDef[]>(this.symbolSrc);
    var symbols: CommandDef[] = await lastValueFrom(src);
    
    this.buildPrefixTree(symbols);
  }

  buildPrefixTree(symbols: CommandDef[]) {

    this.symPrefRoot = new TrieNode('', false, null);

    for (var i = 0; i < symbols.length; i++) {

      this.trieInsert(this.symPrefRoot, symbols[i].symbol, symbols[i]);
    }

    // console.log(this.defaultOpt);
    // console.log(this.extraOptsMarker);
    // this.printTrie(this.symPrefRoot);
  }

  trieInsert(rt: TrieNode, src: string, cmdDef: CommandDef) {

    // base case, at command node
    // assert -> no two commands have same symbol
    if (src === '') {

      rt.isCommand = true;
      rt.commandInfo = cmdDef;
    } else {

      // get next prefix char
      // check if already exists
        // if so, navigate substr
        // else, create and navigate substr

      var nxtChar = src.substring(0, 1);
      var nextNode = rt.next.find((nd: TrieNode) => {nd.val === nxtChar});

      if (nextNode === undefined) {

        nextNode = new TrieNode(nxtChar, false, null);
        rt.next.push(nextNode);
      }

      this.trieInsert(nextNode, src.substring(1), cmdDef);
    }
  }

  format(userInput: string) {

    // TODO: imp
    return userInput;
  }

  parse(userInput: string) {

    // TODO: imp
    // return [userInput];

    return this.buildExecutionTree(this.symPrefRoot, userInput);
  }

  // TODO: resolve the data structure support issues around this method
  // how would the interpreter unwrap the ExecutionTree obj?
  buildExecutionTree(rt: TrieNode, src: string) {

    var cmdDef: CommandDef | null = null;
    var idx = -1;
    var curNode = rt;

    for (var i = 0; i < src.length && cmdDef === null; i++) {

      if (curNode.next.length === 0) {

        // mark cmd
        cmdDef = curNode.commandInfo;
        idx = i + 1;
      } else {

        var nxtChar = src.charAt(i);
        var nextNode = curNode.next.find((nd: TrieNode) => {nd.val === nxtChar});

        if (nextNode === undefined) {

          curNode = rt;

          nextNode = curNode.next.find((nd: TrieNode) => {nd.val === nxtChar});

          if (nextNode !== undefined) {

            curNode = nextNode;
          }
        } else {

          curNode = nextNode;
        }
      }
    }

    if (cmdDef === null) {

      // base case, return string given as operand for parent
      return src;
    } else {

      var optName = cmdDef.name;
      var isBaseOpt!: boolean;
      var operands!: string | string[] | SystemCommand[] | any[];
      var tmpOperands = [];

      // found cmd, case on cmd type unary or binary
      if (cmdDef.type === 'binary') {

        tmpOperands.push(this.buildExecutionTree(rt, src.substring(0, idx - cmdDef.symbol.length)));
        tmpOperands.push(this.buildExecutionTree(rt, src.substring(idx)));

        if (typeof tmpOperands[0] === "string" && typeof tmpOperands[1] === "string") {

          isBaseOpt = true;
        }
      } else {

        // assert type === 'unary'
        tmpOperands.push(this.buildExecutionTree(rt, src.substring(idx)));

        if (typeof tmpOperands[0] === "string") {

          isBaseOpt = true;
        }
      }

      return new SystemCommand(optName, isBaseOpt, operands);
    }
  }
}
