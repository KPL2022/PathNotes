import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CommandDef, OptionDef, SystemCommand, TrieNode } from './DataTypes';

@Injectable({
  providedIn: 'root'
})
export class MindmapService {

  private symbolSrc = "/assets/internal/MmSystemCommands.json";
  private symPrefRoot!: TrieNode;
  private defaultOpt!: string;
  private extraOptsMarker!: string;

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

      var cmdDef = symbols[i];

      if (cmdDef.name === 'meta-info') {

        this.defaultOpt = cmdDef.options[0].default;
        this.extraOptsMarker = cmdDef.options[1].default;
      } else {

        this.trieInsert(this.symPrefRoot, cmdDef.symbol, cmdDef);
      }
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
      var nextNode = rt.next.find((nd: TrieNode) => {nd.val === nxtChar;});

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
    return [userInput];

    // return this.buildExecutionTree(this.symPrefRoot, userInput);
  }

  // TODO: resolve the data structure support issues around this method
  // how would the interpreter unwrap the ExecutionTree obj?
  buildExecutionTree(rt: TrieNode, src: string) {

    var exeTreeRt!: SystemCommand;
    var cur = rt;

    for (var i = 0; i < src.length; i++) {

      if (cur.next.length === 0) {

        // var cmdDef: CommandDef = cur.commandInfo;
        

        // exeTreeRt = new SystemCommand(cmdDef.name, false, )
      }
    }
  }
}
