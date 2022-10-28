import { Component, OnInit, Input, OnChanges, SimpleChanges, ApplicationRef } from '@angular/core';

import { MmBlock, MmLink, MmNode, SystemCommand } from '../DataTypes';

@Component({
  selector: 'app-mm-canvas',
  templateUrl: './mm-canvas.component.html',
  styleUrls: ['./mm-canvas.component.css']
})
export class MmCanvasComponent implements OnInit, OnChanges {

  @Input() drawRequest!: SystemCommand | string;

  activeNodes: MmNode[] = [];
  activeLinks: MmLink[] = [];
  nodeOrigin: MmBlock[][] = [];
  ids: number = 0;
  frameWidth = 1070;
  frameHeight = 750;
  colSize = Math.floor(0.03 * this.frameWidth);
  rowSize = Math.floor(0.05 * this.frameHeight);

  constructor() { 

    // this.activeNodes.push(new MmNode(100, 100, "xD", String(this.ids++)));
    this.initOrigin();

    for (var i = 0; i < 2; i++) {

      this.generateNode(String(i));
    }

    var a = this.activeNodes[0];
    var b = this.activeNodes[1];

    this.generateLink(a, b);
  }

  initOrigin() {

    var a = 75;
    var b = 37;
    var colMargin = 10;
    var rowMargin = 6;

    var frameWidth = this.frameWidth;
    var frameHeight = this.frameHeight;
    var colSize = this.colSize;
    var rowSize = this.rowSize;

    for (var i = 0; i < Math.floor(frameHeight / rowSize); i++) {

      this.nodeOrigin.push([]);
      for (var j = 0; j < Math.floor(frameWidth / colSize); j++) {

        var st = j * (colSize);
        this.nodeOrigin[i].push(new MmBlock(st, st + colSize, rowSize, i));  
      }
    }

    // for (var i = 0; i < Math.floor(frameWidth / colSize); i++) {

    //   for (var j = 0; j < Math.floor(frameHeight / rowSize); j++) {

    //     var x = i * colSize + Math.floor(colSize / 2);
    //     var y = j * rowSize + Math.floor(rowSize / 2);

    //     this.nodeOrigin.push(new MmNode(x, y, '', '-1'));
    //   }
    // }
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {

    if (!changes['drawRequest'].firstChange) {
      this.interpretCmd(changes['drawRequest'].currentValue);
    }
  }

  interpretCmd(sysCmd: SystemCommand | string) {

    // TODO: imp
    // this.collisionAwarePlacement(userCmd[0]);
    
    // while (this.nodeOrigin.length !== 0) {

    //   this.activateNode('test');
    // }

    if (typeof sysCmd === "string") {

      console.log("canvas got string: " + sysCmd);

      this.generateNode(sysCmd);
    } else {

      console.log("canvas got a syscmd obj: ");
      console.log(sysCmd);

      this.traceExecutionTree(sysCmd);
    }
  }

  execute(cmd: SystemCommand, args: any[]) {


  }

  traceExecutionTree(rt: SystemCommand) {

    if (rt.isBaseOpt()) {

      return this.execute(rt, rt.getOperands());
    } else {

      var children = rt.getOperands();
      var operands = [];

      for (var i = 0; i < children.length; i++) {

        operands.push(this.traceExecutionTree(children[i]));
      }

      // case on branch cmd type
      return this.execute(rt, operands);
    }
  }

  allocLink(st: number[], ed: number[]) {

  }

  free(centerPt: number[]) {

    // TODO: imp
  }

  distBetween(parent: MmNode, childCenter: number[]) {

    // TODO: imp
    
    // TODO: normalize bubble dims
    var a = 45;
    var b = 32;

    //divide into 4 regions, vertical y's and 2 x's on the side
  
    var xDist = Math.abs(childCenter[0] - parent.getCx());

    // check for membership e x's first
    if (xDist >= 2 * a) {

      return Math.floor((xDist - 2 * a) / this.colSize);
    } else {

      var yDist = Math.abs(childCenter[1] - parent.getCy());

      return Math.floor((yDist - 2 * b) / this.rowSize);
    }
  }

  relocate(parent: MmNode, child: MmNode) {

    /**
     * pseudo code:
     * 
     * store old cx, cy info
     * call allocSpace() with radial search option around parent node
     * compare new cx, cy with old, if replace, free old, else free new
     * 
     * but, assertion provided by allocSpace, new will be <= old, === old worst case
     * 
     * update child with chosen cx, cy info and termin
     */

    var oldCx = child.getCx();
    var oldCy = child.getCy();

    var newCs: number[] = this.allocSpace('childof', [parent, child]);
    
    this.free([oldCx, oldCy]);

    child.setCx(newCs[0]);
    child.setCy(newCs[1]);
  }

  generateLink(from: MmNode, to: MmNode) {

    /**
     * pseudo code:
     * 
     * relocate():
     * 1. try to relocate child to nearest position around parent
     * 
     *    i. free():
     *      - free child old position
     * 
     *    ii. alloc()?
     *      - alloc space to child new position
     * 
     * return to generateLink() -> allocLink()
     * 2. get link params and use to alloc link space
     * 
     * return to generateLink()
     * 3. reg link in active links collection
     */

    var a = from;
    var b = to;

    this.relocate(a, b);

    var stPack: number[][] = a.getPortLocation(b);
    var edPack: number[][] = b.getPortLocation(a);

    var st: number[] = stPack[0];
    var stAngle: number[] = stPack[1];
    var edAngle: number[] = edPack[1];
    var ed: number[] = edPack[0];

    // this.allocLink(st, ed);

    this.activeLinks.push(new MmLink(st, stAngle, edAngle, ed));

    // var xOffset = 30;
    // var yOffset = 8;

    // // assert a && b are collision free
    // // ignore a parallel b in x or y axis cases
    // if (a.getCx() > b.getCx()) {

    //   if (a.getCy() > b.getCy()) {

    //     // a is bottom right of b
        
    //     // link a tf corner to b br corner
    //     st = [a.getCx() - xOffset, a.getCy() - yOffset];
    //     ed = [b.getCx() + xOffset, b.getCy() + yOffset];
    //     stAngle = [st[0], st[1] - 50];
    //     edAngle = [ed[0] + 50, ed[1]];
    //   } else {

    //     // a is top right of b

    //     // link a bl to b tr
    //     st = [a.getCx() - xOffset, a.getCy() + yOffset];
    //     ed = [b.getCx() + xOffset, b.getCy() - yOffset];
    //     stAngle = [st[0], st[1] + 50];
    //     edAngle = [ed[0] + 50, ed[1]];
    //   }
    // } else {

    //   if (a.getCy() > b.getCy()) {

    //     // a is bottom left of b

    //     // link a tr to b bl
    //     st = [a.getCx() + xOffset, a.getCy() - yOffset];
    //     ed = [b.getCx() - xOffset, b.getCy() + yOffset];
    //     stAngle = [st[0] + 50, st[1]];
    //     edAngle = [ed[0], ed[1] + 50];
    //   } else {

    //     // a is top left of b

    //     // link a br to b tl
    //     st = [a.getCx() + xOffset, a.getCy() + yOffset];
    //     ed = [b.getCx() - xOffset, b.getCy() - yOffset];
    //     stAngle = [st[0] + 50, st[1]];
    //     edAngle = [ed[0], ed[1] - 50];
    //   }
    // }
  }

  generateNode(userInput: string) {

    var nodeCore: number[] = this.allocSpace('node', []);

    this.activeNodes.push(new MmNode(nodeCore[0], nodeCore[1], userInput, String(this.ids++)));
  }

  /**
   * relevance in part:
   * 
   * projection heuristic can provide iteration order in such a way that the provided order
   * is flexible with respect to smallest unit on scale (i.e. if height of unit to alloc for
   * is 2 cell-high, normally
   * the composite rows would be 0-1, 2-3, 4-5, so 1-2 is not avaialble, making the space 
   * allocation not truly flexible, but with projection heuristic, if 1-2 is on the freer side
   * of things in terms of space availablility, then it will be included)
   */
  fillPartitionItrOrder(order: number[], dims: number[]) {

    // projection heuristic on rows first, fallback on cols, return 'row' or 'col to client
    // TODO: imp

    // placeholder, always return rows from 0 to nodeOrigin.length - 1
    // rowWidth = given dims[0]

    for (var i = 0; i < this.nodeOrigin.length - dims[0] - 1; i+=dims[0]) {

      order.push(i);
    }

    return 'row';
  }

  shuffleOrder(original: any[]) {

    var res: any[] = [];

    while (original.length > 1) {

      var pickOne = Math.floor(Math.random() * original.length);
      res.push(original[pickOne]);
      original.splice(pickOne, 1);
    }

    // assert original.length === 1
    res.push(original[0]);

    return res;
  }

  containable(st: MmBlock, width: number, height: number, ori: string) {

    // assert st.isFree is true
    if (ori !== 'tf') {

      window.alert("feature not yet implemented");
    }

    // assert ori === 'tf'
    
    // assert entity placement containing st can exist
    // (at least width - 1 neighbors in major axis, height - 1 in minor)

    // just check all involved neighbors
    var stIdx = -1;
    var rowIdx = -1;

    for (var i = 0; i < this.nodeOrigin.length && stIdx < 0; i++) {

      var tmpIdx = this.nodeOrigin[i].indexOf(st);
      
      if (tmpIdx > -1) {

        stIdx = tmpIdx;
        rowIdx = i;
      }
    }

    var a = this.nodeOrigin[rowIdx][stIdx + 1];
    var b = this.nodeOrigin[rowIdx][stIdx + 2];
    
    var c = this.nodeOrigin[rowIdx + 1][stIdx];
    var d = this.nodeOrigin[rowIdx + 1][stIdx + 1];
    var e = this.nodeOrigin[rowIdx + 1][stIdx + 2];

    if (a.isFree && b.isFree && c.isFree && d.isFree && e.isFree) {

      st.isFree = false;
      a.isFree = false;
      b.isFree = false;
      c.isFree = false;
      d.isFree = false;
      e.isFree = false;

      return true;
    } else {

      return false;
    }
  }

  alloc(scope: MmBlock[], type: string, ori: string): number[] | boolean {

    // for each center coord c typeof number[] with x=number[0], y=number[1] e scope
    // determine if c can host given type of entity
      // if so mark associated cells as occupied and return c
    // if no match found, return false

    // if (type === 'host node') {

    //   // set entity dims -> 2x3
    // } else {

    //   // placeholder
    // }

    // placeholder
    var entityWidth = 3;
    var entityHeight = 2;

    for (var i = 0; i < scope.length; i++) {

      if (ori === 'tf') {

        if (this.containable(scope[i], entityWidth, entityHeight, ori)) {

          var entityCore: number[] = [];
          entityCore[0] = scope[i].getStart() + Math.floor((scope[i].getEnd() - scope[i].getStart()) * entityWidth / 2);
          entityCore[1] = scope[i].blockId * scope[i].dispHeight + Math.floor(scope[i].dispHeight * entityHeight / 2);

          return entityCore;
        }
      } 
      // else if (ori === 'bf') {

      //   // col orientation
      // } else {

      //   // placeholder, probs for link related alloc use case later
      // }
    }

    return false;
  }

  allocSpace(purpose: string, args: any[]) {

    var colSize = this.colSize;
    var rowSize = this.rowSize;

    var nodeWidth = 3 * colSize;
    var nodeHeight = 2 * rowSize;

    // noooooo...gotta change this whole logic
    /**
     * pc:
     * 1. randomly choose 2 adjacent rows (later projection heuristic improvement)
     * 2. check rows for node space
     * 3. mark chosen nodes as occupied
     * 4. compute and return nodeCore to client
     * 
     * pc2:
     * 1. determine use case (basic node alloc, node alloc for linking, etc)
     * 2. determine scope (around given coord, or map wide blind)
     * 3. based on scope -> compose order of rows or cols or n/a if for linking
     * 4. for each item e order
     *  i. generate all possible spots
     *  ii. pass spot col to spot checker
     *    - if spot checker returns core -> process and return to client
     *    - if return is boolean fail -> proceed to next item e order or throw no space err
     * 
     * def: spot checker
     * def: order generator
     */

    // assert purpose === 'node' || 'childof'

    // assert nodes as 2x3 entities in space
    var dims = [2, 3];
    
    if (purpose === 'node') {

      var itrOrder: number[] = [];
      var fillRes: string = 'row';

      fillRes = this.fillPartitionItrOrder(itrOrder, dims);

      // hehe, randomize order
      itrOrder = this.shuffleOrder(itrOrder);

      if (fillRes === 'row') {

        // row wise itr
        for (var i = 0; i < itrOrder.length; i++) {
  
          var cands: MmBlock[] = [];

          for (var j = 0; j < this.nodeOrigin[itrOrder[i]].length - dims[1] - 1; j++) {
  
            if (this.nodeOrigin[itrOrder[i]][j].isFree) {
  
              cands.push(this.nodeOrigin[itrOrder[i]][j]);
            }
          }
  
          cands = this.shuffleOrder(cands);
  
          var ret: number[] | boolean = this.alloc(cands, 'host node', 'tf');
  
          if (typeof ret !== "boolean") {
  
            // handle returns
            return ret;
          }
        }  
      }
    }

    if (purpose === 'childof') {

      var parent: MmNode = args[0];
      var child: MmNode = args[1];
      var childCenter: number[] = [child.getCx(), child.getCy()];

      // compute radial search limit from old child position
      var lim = this.distBetween(parent, childCenter);

      var pLeftCol = Math.floor(parent.getCx() / colSize) - 1;
      var pRightCol = pLeftCol + 2;
      var pTopRow = Math.floor(parent.getCy() / rowSize) - 1;
      var pBotRow = pTopRow + 1;

      // for each radial layer, fill candidates list, try to alloc, case on res to itr or ret
      for (var i = 1; i < lim; i++) {

        var cands: MmBlock[] = [];

        // fill cands list
        
        // get bound dims
        var topBoundRow = pTopRow - i - dims[0];
        var botBoundRow = pBotRow + i + 1;
        var leftBoundCol = pLeftCol - i - dims[1];
        var rightBoundCol = pRightCol + i + 1;

        // for each bound dim in range -> fill cands respectively
        if (topBoundRow >= 0) {

          var start = Math.max(0, leftBoundCol);
          var end = Math.min(this.nodeOrigin[0].length - dims[1], rightBoundCol);

          for (var i = start; i <= end; i++) {

            var blk = this.nodeOrigin[topBoundRow][i];

            if (blk.isFree) {

              cands.push(blk);
            }
          }
        }

        if (botBoundRow <= this.nodeOrigin.length - dims[0]) {

          var start = Math.max(0, leftBoundCol);
          var end = Math.min(this.nodeOrigin[0].length - dims[1], rightBoundCol);

          for (var i = start; i <= end; i++) {

            var blk = this.nodeOrigin[botBoundRow][i];

            if (blk.isFree) {

              cands.push(blk);
            }
          }
        }

        if (leftBoundCol >= 0) {

          var start = Math.max(0, topBoundRow) + 1;
          var end = Math.min(this.nodeOrigin.length - dims[0], botBoundRow) - 1;

          for (var i = start; i <= end; i++) {

            var blk = this.nodeOrigin[i][leftBoundCol];

            if (blk.isFree) {

              cands.push(blk);
            }
          }
        }

        if (rightBoundCol <= this.nodeOrigin[0].length - dims[1]) {

          var start = Math.max(0, topBoundRow) + 1;
          var end = Math.min(this.nodeOrigin.length - dims[0], botBoundRow) - 1;

          for (var i = start; i <= end; i++) {

            var blk = this.nodeOrigin[i][rightBoundCol];

            if (blk.isFree) {

              cands.push(blk);
            }
          }
        }

        // shuffle order
        cands = this.shuffleOrder(cands);

        var ret: number[] | boolean = this.alloc(cands, 'host node', 'tf');

        if (typeof ret !== "boolean") {

          return ret;
        }
      }

      return childCenter;
    }

    return [0, 0];
  }
}
// ignore purpose param for now, assume alloc for node
    // var pickRow!: MmBlock[];
    // var foundRow = false;

    // var chosenBlock!: MmBlock;
    // var foundBlock = false;

    // while (!foundRow) {

    //   var rowId = Math.floor(Math.random() * this.nodeOrigin.length);

    //   for (var i = 0; i < this.nodeOrigin[rowId].length && !foundBlock; i++) {

    //     var block = this.nodeOrigin[rowId][i];
  
    //     if (block.getEnd() - block.getStart() >= nodeWidth) {
  
    //       chosenBlock = block;
    //       foundBlock = true;
    //     }
    //   }

    //   if (foundBlock) {

    //     pickRow = this.nodeOrigin[rowId];
    //     foundRow = true;
    //   }
    // }

    // if (foundBlock) {

    //   var blockSize = chosenBlock.getEnd() - chosenBlock.getStart();
    //   var nodePosition = 0;

    //   if (blockSize > nodeWidth) {

    //     var nodeSizeContainerCount = Math.floor(blockSize / nodeWidth);

    //     nodePosition = Math.floor(Math.random() * nodeSizeContainerCount);
    //   }

    //   var nodeCore = [];
    //   nodeCore[0] = chosenBlock.getStart() + nodeWidth * nodePosition + Math.floor(nodeWidth / 2);
    //   nodeCore[1] = chosenBlock.blockId * chosenBlock.dispHeight + Math.floor(chosenBlock.dispHeight / 2);

    //   if (blockSize === nodeWidth || nodePosition === 0) {

    //     chosenBlock.setStart(chosenBlock.getStart() + nodeWidth);
    //   } else {

    //     var splitBlock = new MmBlock(chosenBlock.getStart(), chosenBlock.getStart() + nodeWidth * nodePosition, chosenBlock.dispHeight, chosenBlock.blockId);
    //     chosenBlock.setStart(chosenBlock.getStart() + nodeWidth * (nodePosition + 1));

    //     pickRow.splice(pickRow.indexOf(chosenBlock), 0, splitBlock);
    //   }

    //   return nodeCore;
    // } else {

    //   return [0, 0];
    // }

  // activateNode(userInput: string) {

  //   var baseNode: MmNode = this.nodeOrigin[Math.floor(Math.random() * this.nodeOrigin.length)];
  
  //   this.nodeOrigin.splice(this.nodeOrigin.indexOf(baseNode), 1);

  //   baseNode.setTxt(userInput);
  //   baseNode.setId(String(this.ids++));

  //   this.activeNodes.push(baseNode);
  // }

  // collisionAwarePlacement(userInput: string) {

  //   var x = 0;
  //   var y = 0;
  //   var temp = new MmNode(x, y, 'dummy', '1');
  //   var myId = 0;

  //   while (!this.inBounds(x, y) || !this.collisionFree(x, y)) {
      
  //     x = Math.random() * 1000;
  //     y = Math.random() * 600;

  //     var tmpId = String(myId++);
  //     temp = new MmNode(x, y, 'bad ' + userInput + " " + tmpId, tmpId);
  //     this.bubbles.push(temp);
  //   }

  //   this.bubbles.splice(this.bubbles.indexOf(temp), 1);

  //   this.bubbles.push(new MmNode(x, y, userInput, String(this.ids++)));
  // }

  // inBounds(x: number, y: number): boolean {

  //   var corners = this.getCorners(x, y);
  //   var bounds = [0, 0, 1300, 700];  // x left, y top, x right, y bottom

  //   for (var j = 0; j < corners.length; j++) {

  //     for (var i = 0; i < 4; i++) {

  //       if (i < 2) {

  //         if (corners[j][i % 2] < bounds[i]) {

  //           return false;
  //         }
  //       } else {

  //         if (corners[j][i % 2] > bounds[i]) {

  //           return false;
  //         }
  //       }
  //     }
  //   }

  //   return true;
  // }

  // collisionFree(x: number, y: number): boolean {

  //   var corners = this.getCorners(x, y);

  //   for (var j = 0; j < this.bubbles.length; j++) {

  //     for (var i = 0; i < corners.length; i++) {

  //       if (this.bubbles[j].contains(corners[i])) {

  //         window.alert('bubble numba ' + this.bubbles[j].getId() + ' protests!');
  //         return false;
  //       }
  //     }
  //   }

  //   return true;
  // }

  // getCorners(x: number, y: number) {

  //   var a = 75;
  //   var b = 37;

  //   var res: number[][] = [];

  //   res.push([x - a, y + b]);
  //   res.push([x - a, y - b]);
  //   res.push([x + a, y + b]);
  //   res.push([x + a, y - b]);

  //   return res;
  // }

