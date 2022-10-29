import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CommandDef, OptionDef, SystemCommand, TrieNode, OperatorName, getOptName, getOperatorLevel } from './DataTypes';

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
      var nextNode = rt.next.find((nd: TrieNode) => nd.val === nxtChar);

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

  // TODO: imp order of operations by hierarchy
  // set root to be highest operator found in user input, split from there
  // keep partial order state, restore order after introducing new operator at each encounter 
  buildExecutionTree(rt: TrieNode, src: string): SystemCommand {

    var cmdDef: CommandDef | null = null;
    var idx = -1;
    var curNode = rt;

    for (var i = 0; i < src.length && cmdDef === null; i++) {

      if (curNode.next.length === 0) {

        // mark cmd
        cmdDef = curNode.commandInfo;
        idx = i;
      } else {

        var nxtChar = src.charAt(i);
        var nextNode = curNode.next.find((nd: TrieNode) => nd.val === nxtChar);

        if (nextNode === undefined) {

          curNode = rt;

          nextNode = curNode.next.find((nd: TrieNode) => nd.val === nxtChar);

          if (nextNode !== undefined) {

            curNode = nextNode;
          }
        } else {

          curNode = nextNode;
        }
      }
    }

    if (cmdDef === null) {

      // base case, return lvl0 generate command for string
      return new SystemCommand(OperatorName.generate, getOperatorLevel(OperatorName.generate), [src]);
    } else {

      var optName: OperatorName = getOptName(cmdDef.name);
      var cmdLvl: number = getOperatorLevel(optName);
      var operands = [];

      // found cmd, case on cmd type unary or binary
      if (cmdDef.type === 'binary') {

        operands.push(this.buildExecutionTree(rt, src.substring(0, idx - cmdDef.symbol.length).trim()));
        operands.push(this.buildExecutionTree(rt, src.substring(idx).trim()));
      } else {

        // assert type === 'unary'
        operands.push(this.buildExecutionTree(rt, src.substring(idx).trim()));
      }

      return new SystemCommand(optName, cmdLvl, operands);
    }
  }
}
