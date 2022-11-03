import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CommandDef, OptionDef, SystemCommand, TrieNode, OperatorName, getOptName, getOperatorLevel } from './DataTypes';
import { PercentPipe } from '@angular/common';

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

    var ret: SystemCommand[] = [];
    
    this.buildExecutionTree(this.symPrefRoot, userInput, ret, null);

    return ret[0];
  }

  // TODO: imp order of operations by hierarchy
  // set root to be highest operator found in user input, split from there
  // keep partial order state, restore order after introducing new operator at each encounter 
  buildExecutionTree(rt: TrieNode, src: string, head: SystemCommand[], prev: SystemCommand | null): SystemCommand {

      /**
       * separating out ordering from producing the execution tree
       * 
       * pseudo code:
       * 
       * 1. case on finding operator in src
       *  - if not found -> base case return
       *  - else -> create self sys cmd obj, then:
       *  
       *  -case on cmd type for left/right option enable, then:
       *    - if prev !== null -> compare self cmd lvl to prev cmd lvl
       *        - if self is child -> use left operand for self
       *        - else
       *          - provide left operand as return eventually to parent
       *          - set return of child as own left operand 
       *          - check if self is head worthy
       *        - set return of right call as right operand
       *        - return self or left operand based on prev decision
       * 
       *    - if prev === null
       *      - set left operand as self left operand
       *      - use right return as right operand
       *      - return self or left operand in the same sense as above case
       * 
       *  - if cmd type is binary:
       *    - case on if prev !== null to set left operand and return value
       *    - if prev !== null -> check self is head worthy
       *   
       *  - for both binary and unary cmd types:
       *    - use right return as right operand
       *    - return preset value upward
       */

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
      var ret: SystemCommand = new SystemCommand(OperatorName.generate, getOperatorLevel(OperatorName.generate), [src]);

      if (prev === null) {

        head[0] = ret;
      }

      return ret;
    } else {

       var optName: OperatorName = getOptName(cmdDef.name);
       var cmdLvl: number = getOperatorLevel(optName);
       var operands: SystemCommand[] = [];

       var selfObj: SystemCommand = new SystemCommand(optName, cmdLvl, operands);
       selfObj.setIndex(idx);
       
       if (prev === null) {

        head[0] = selfObj;
       }

       var ret!: SystemCommand;

      // make decisions about left operand
      if (cmdDef.type === 'binary') {

        if (prev !== null) {

          var leftOpt: SystemCommand = new SystemCommand(OperatorName.generate, getOperatorLevel(OperatorName.generate), [src.substring(0, idx - cmdDef.symbol.length).trim()]);

          if (prev.getCmdLvl() > cmdLvl) {

            // self is child, use left operand for self, set self as return for parent
            operands.push(leftOpt);
            ret = selfObj;
          } else {

            // self is parent, give left operand as return, use child for own return
            operands.push(prev);
            ret = leftOpt;

            // check if self head worthy
            if (head.length === 0) {

              head.push(selfObj);
            } else {

              if (head[0].getCmdLvl() <= selfObj.getCmdLvl()) {

                head[0] = selfObj;
              }
            }
          }
        } else {

          // prev === null, use leftOpt for self, return self
          operands.push(new SystemCommand(OperatorName.generate, getOperatorLevel(OperatorName.generate), [src.substring(0, idx - cmdDef.symbol.length).trim()]));
          ret = selfObj;
        }
      } else {

        ret = selfObj;
      }

      // set right return as right operand
      operands.push(this.buildExecutionTree(rt, src.substring(idx).trim(), head, selfObj));

      // return self as ret val
      return ret;

      // // found cmd, case on cmd type unary or binary
      // if (cmdDef.type === 'binary') {

      //   operands.push(this.buildExecutionTree(rt, src.substring(0, idx - cmdDef.symbol.length).trim()));
      //   operands.push(this.buildExecutionTree(rt, src.substring(idx).trim()));
      // } else {

      //   // assert type === 'unary'
      //   operands.push(this.buildExecutionTree(rt, src.substring(idx).trim()));
      // }

      // return new SystemCommand(optName, cmdLvl, operands);
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

