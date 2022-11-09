import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CommandDef, OptionDef, SystemCommand, TrieNode, OperatorName, OperatorLevel, OperatorType } from './data/DefSysCmd';

@Injectable({
  providedIn: 'root'
})
export class MindmapService {

  private symbolSrc = "app/data/MmSystemCommands.json";
  private extraOptsMarker = "--";

  private symPrefRoot!: TrieNode;
  
  constructor(private http: HttpClient) {

    this.loadSymbols();
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
  }

  // optimization options: trim param count, check if substring is expensive
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
      var nxtChar = src.charAt(0);
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

    var ret: SystemCommand[] = [];
    
    this.buildExecutionTree(this.symPrefRoot, userInput, ret, null);

    return ret[0];
  }

  /**
   * separating out ordering from producing the execution tree
   * 
   * pseudo code:
   * 
   * 0. mats & invariants:
   *  - return either self or left operand as generate wrapper
   *  - pass ref to prev neighbor
   *  - param passing global head
   *    - init with first cmd no prev case
   *    - after operands finished, check self for head update
   * 
   * 1. goals are to produce user input into operator cmds and
   *    set execution order of cmds by lvl of cmd
   * 
   * for producing cmds:
   *  1. try to find operator in user input
   *  2. if not found, return base case generate wrapper
   *  3. if found, process operator into sys cmd:
   *      - get operator name, cmd lvl
   *      - get operands with ordering in consideration
   *      - switch on opt typing cases
   *
   * for ordering:
   *  1. use parameter passing for global head
   *  2. setting return values between neighboring cmds by comp cmd lvl
   *        - return value is either self, or string in between cmds with generate wrapper
   *        - handle first cmd no previous case
   *
   * -----------------
   * param: rt, src, head, prev
   * 
   * 1. string search with trie on user input 'src'
   * 
   * init: idx var, sys cmd var, cur trie node var
   * 
   * while (not at end of src && sys cmd empty) 
   *  - base case check if cur node is leaf node -> found opt
   *    - create system cmd obj & fill with placeholders
   *  - check if cur src char e cur.next
   *    - if so move to next trie node
   *    - else reset cur -> rt and check cur src char again
   * 
   * 2. switch on sys cmd is empty
   *  - if empty -> return base case generate wrapper
   *  - else
   * 
   * init: left opt, return val variables
   * 
   *    - case on prev === null
   *      - case on self opt typing
   *        - if prev === null -> type = binary then left opt for self, recurse for right opt
   *          -> type = unary then simply recurse for right opt
   *      - init global head here
   *    - if prev !== null
   *      - case on self opt typing
   *        - if prev !== null -> typing = binary then case on prev vs self cmd lvl
   *          - if self cmd lvl >= prev cmd lvl -> use prev for left opt, ret left opt to prev
   *          - if self cmd lvl < prev cmd lvl -> use left opt for left opt, return self
   *        - if typing = unary -> recursve for right operand
   *    - after operands feathered out, check self for head update
   */
  buildExecutionTree(rt: TrieNode, src: string, head: SystemCommand[], prev: SystemCommand | null): SystemCommand {

    var cur: TrieNode = rt;
    var cmdDef: CommandDef | null = null;
    var idx: number = 0;

    while (idx < src.length && cmdDef === null) {

      if (cur.isCommand) {

        // generate system command
        cmdDef = cur.commandInfo as CommandDef;
        cmdDef.index = idx;
      } else {

        var curSrcChar = src.charAt(idx);
        var nextNode: TrieNode | undefined = cur.next.find((nd: TrieNode) => nd.val === curSrcChar);

        if (nextNode !== undefined) {

          // found next node, move there
          cur = nextNode;
        } else {

          cur = rt;

          nextNode = cur.next.find((nd: TrieNode) => nd.val === curSrcChar);

          if (nextNode !== undefined) {

            cur = nextNode;
          }
        }
      }
      idx++;
    }

    if (cmdDef === null) {

      // base case, return generate wrapper
      var ret = new SystemCommand(OperatorName.generate, OperatorLevel.generate, [src.trim()]);

      if (prev === null) {

        head[0] = ret;
      }

      return ret;
    } else {

      // create system command container with info from cmdDef
      var operands: SystemCommand[] = [];

      var sysCmd = new SystemCommand(cmdDef.name, cmdDef.cmdLvl, operands);
      
      // case return on various things
      var leftOpt = new SystemCommand(OperatorName.generate, OperatorLevel.generate, [src.substring(0, cmdDef.index - cmdDef.symbol.length).trim()]);
      var retVal = leftOpt;

      if (prev === null) {

        if (cmdDef.type === OperatorType.binary) {
          operands.push(leftOpt);
          retVal = sysCmd;
        }

        head[0] = sysCmd;
      } else {

        // assert prev !== null here
        if (cmdDef.type === OperatorType.binary) {

          if (sysCmd.getCmdLvl() >= prev.getCmdLvl()) {

            operands.push(prev);

            // check for head update here
            if (sysCmd.getCmdLvl() >= head[0].getCmdLvl()) {

              head[0] = sysCmd;
            }
          } else {

            operands.push(leftOpt);
            retVal = sysCmd;
          }
        }
      }

      operands.push(this.buildExecutionTree(rt, src.substring(cmdDef.index).trim(), head, sysCmd));

      return retVal;
    }
  }

  printTrie(rt: TrieNode) {

    console.log(rt.val);

    if (rt.next.length === 0) {

      console.log(rt.commandInfo);
    } else {

      rt.next.forEach((child: TrieNode) => {this.printTrie(child);});
    }
  }
}

