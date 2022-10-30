import { TmplAstBoundAttribute, Xmb } from '@angular/compiler';
import { Component, OnInit, Input, OnChanges, SimpleChanges, ApplicationRef } from '@angular/core';

import { MmBlock, MmLink, MmNode, OperatorName, SystemCommand } from '../DataTypes';

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
  testPoints: number[][] = [];
  tmpLinkBlk: MmBlock[] = [];

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

  interpretCmd(sysCmd: SystemCommand) {

    // TODO: imp
    // this.collisionAwarePlacement(userCmd[0]);
    
    // while (this.nodeOrigin.length !== 0) {

    //   this.activateNode('test');
    // }

    console.log(sysCmd);
    this.traceExecutionTree(sysCmd);
  }

  execute(cmd: SystemCommand, args: any[]) {

    if (cmd.getCmdLvl() === 0) {

      // assert name === generate
      var userInput: string = args[0] as string;
      
      var existNode = this.activeNodes.find((val: MmNode) => val.getId() === userInput);

      if (existNode !== undefined) {

        return existNode;
      } else {

        return this.generateNode(userInput);
      }
    } else if (cmd.getCmdLvl() === 1) {

      // switch: edit, remove, highlight
      if (cmd.getOperatorName() === OperatorName.edit) {


      } else if (cmd.getOperatorName() === OperatorName.remove) {


      } else {

        // assert name === highlight
      }
    } else if (cmd.getCmdLvl() === 2) {

      // switch: link, unlink
      if (cmd.getOperatorName() === OperatorName.link) {

        var child: MmNode = args[0] as MmNode;
        var parent: MmNode = args[1] as MmNode;

        // check if link alr exists
        var findLink = parent.getChildrenLinks().find((link: MmLink) => link.child.getId() === child.getId());

        if (findLink !== undefined) {

          // do nothing xD
        } else {

          this.generateLink(child, parent);

          // recursively generate all related links
          this.tmpRecLinkGen(child);
        }

        return parent;
      } else {

        // assert name === unlink
      }
    } else {

      // merge is only lvl3 so far

    }

    // for all unimplemented
    return undefined;
  }

  tmpRecLinkGen(rt: MmNode) {

    // base case, leaf node
    if (rt.getChildrenLinks().length === 0) {

      // do nothing
    } else {

      // set links for all direct children
      var children: MmLink[] = rt.getChildrenLinks();

      for (var i = 0; i < children.length; i++) {

        var link: MmLink = children[i];
        
        // relocate child to around new parent location
        this.relocate(rt, link.child);

        // update link params: st, stAn, edAn, ed
        var portLocationPack: number[][] = this.getPortLocations(link.child, rt);

        link.st = portLocationPack[0];
        link.ed = portLocationPack[1];

        this.freeLink(link);
        link.setBlks(this.tmpLinkBlk);

        // rec to child
        this.tmpRecLinkGen(link.child);
      }
    }
  }

  traceExecutionTree(rt: SystemCommand) {

    if (rt.getCmdLvl() <= 1) {

      // <= atomic level commands: 0-generate, 1-edit, remove, highlight
      return this.execute(rt, rt.getOperands());
    } else {

      // branch level commands: link, unlink, merge
      var children: SystemCommand[] = rt.getOperands() as SystemCommand[];
      var operands: any[] = [];

      for (var i = 0; i < children.length; i++) {

        operands.push(this.traceExecutionTree(children[i]));
      }

      return this.execute(rt, operands);
    }
  }

  allocLink(st: number[], ed: number[]) {


  }

  freeLink(link: MmLink) {

    link.blks.forEach((blk: MmBlock) => {blk.isFree = true;});
  }

  free(node: MmNode) {

    var centerPt: number[] = [node.getCx(), node.getCy()];

    var nodeLeftCol = Math.floor(centerPt[0] / this.colSize) - 1;
    var nodeTopRow = Math.floor(centerPt[1] / this.rowSize) - 1;

    this.nodeOrigin[nodeTopRow][nodeLeftCol].isFree = true;
    this.nodeOrigin[nodeTopRow][nodeLeftCol + 1].isFree = true;
    this.nodeOrigin[nodeTopRow][nodeLeftCol + 2].isFree = true;

    this.nodeOrigin[nodeTopRow + 1][nodeLeftCol].isFree = true;
    this.nodeOrigin[nodeTopRow + 1][nodeLeftCol + 1].isFree = true;
    this.nodeOrigin[nodeTopRow + 1][nodeLeftCol + 2].isFree = true;
  }

  distBetween(parent: MmNode, childCenter: number[]) {

    // TODO: imp
    
    // TODO: normalize bubble dims
    var entityWidth = 3 * this.colSize;
    var entityHeight = 2 * this.rowSize;

    //divide into 4 regions, vertical y's and 2 x's on the side
  
    var xDist = Math.abs(childCenter[0] - parent.getCx());
    var yDist = Math.abs(childCenter[1] - parent.getCy());

    // case on which axis is further away
    if (xDist > yDist) {

      return Math.floor((xDist - entityWidth) / this.colSize);
    } else {

      return Math.floor((yDist - entityHeight) / this.rowSize);
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

    var newCs: number[] = this.allocSpace('childof', [child, parent]);
    
    // TODO: imp special return for no result change
    if (newCs[0] !== oldCx || newCs[1] !== oldCy) {

      this.free(child);

      child.setCx(newCs[0]);
      child.setCy(newCs[1]);
    }
  }

  getPortLocations(from: MmNode, to: MmNode): number[][] {

    /**
     * pseudo code:
     * 
     * 1. set self as origin, compute x^2
     * 2. from x^2, compute y's magnitude
     * 3. sqrt(x^2) to obtain x's magnitude
     * 4. translate solution back to base coord system by applying self as offset
     * 5. case on relation positioning to assign direction modifiers to raw x/y
     * 
     * 6. return solutions in order of parameters given
     */

    var a = 45;
    var b = 32;
    
    var ret: number[][] = [];

    // handle from vertical align to: node case first
    if (from.getCx() === to.getCx()) {

      if (from.getCy() > to.getCy()) {

        ret.push([from.getCx(), from.getCy() + b]);
        ret.push([to.getCx(), to.getCy() - b]);
      } else {

        ret.push([from.getCx(), from.getCy() - b]);
        ret.push([to.getCx(), to.getCy() + b]);
      }

      return ret;
    }

    // assert from.cx !== to.cx, so slope is defined
    var m = (from.getCy() - to.getCy()) / (from.getCx() - to.getCx());

    var c = a * b;
    var d = m * a;

    // obtain x^2 value
    var xSq = (c * c) / (b * b + d * d);

    // obtain y's magnitude
    var yMag = Math.sqrt(b * b * (1 - xSq / (a * a)));

    // obtain x's magnitude
    var xMag = Math.sqrt(xSq);

    // set from: node direction modifier by casing on relative positioning
    // to: node variant is simply from's flipped
    var fromXDir!: number;
    var fromYDir!: number;

    if (from.getCx() > to.getCx()) {

      fromXDir = -1;
    } else {

      fromXDir = 1;
    }

    if (from.getCy() > to.getCy()) {

      fromYDir = -1;
    } else {

      fromYDir = 1;
    }

    console.log(xMag + " is x mag");
    console.log(yMag + " is y mag");
    // translate raw x/y back to system coord by applying host node's offset with direction modifiers
    ret.push([from.getCx() + fromXDir * xMag, from.getCy() + fromYDir * yMag]);
    ret.push([to.getCx() + -1 * fromXDir * xMag, to.getCy() + -1 * fromYDir * yMag]);

    console.log(ret);

    return ret;
  }

  generateLink(child: MmNode, parent: MmNode) {

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

    this.relocate(parent, child);

    var portLocationPack: number[][] = this.getPortLocations(child, parent);
    var st: number[] = portLocationPack[0];
    var ed: number[] = portLocationPack[1];

    // var stPack: number[][] = child.getPortLocation(parent);
    // var edPack: number[][] = parent.getPortLocation(child);

    // var st: number[] = stPack[0];
    // var stAngle: number[] = stPack[1];
    // var edAngle: number[] = edPack[1];
    // var ed: number[] = edPack[0];

    // this.allocLink(st, ed);

    var newLink = new MmLink(child, parent, st, ed);
    newLink.setBlks(this.tmpLinkBlk);

    this.activeLinks.push(newLink);
    child.setParentLink(newLink);
    parent.getChildrenLinks().push(newLink);

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
    var res = new MmNode(null, nodeCore[0], nodeCore[1], userInput, String(this.ids++));

    this.activeNodes.push(res);
    
    return res;
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

  toAnchorLine(stX: number, xDir: number) {

    if (xDir > 0) {

      return stX + (this.colSize - stX % this.colSize);
    } else {

      return stX - stX % this.colSize;
    }
  }

  projectLink(stX: number, stY: number, src: number[], xDir: number, m: number, fX: number, yDir: number, blks: MmBlock[]) {

    var fY = m * (fX - src[0]) + src[1];
    var cId = Math.floor(fX / this.colSize);

    if (xDir > 0) {

      cId--;
    }

    // this.testPoints.push([fX, fY]);

    if (yDir > 0) {

      for (var i = stY; i <= fY; i = i + this.rowSize) {

        if (!this.nodeOrigin[Math.floor(i / this.rowSize)][cId].isFree) {
  
          return false;
        } else {
  
          blks.push(this.nodeOrigin[Math.floor(i / this.rowSize)][cId]);
        }
      }
    } else {

      for (var i = stY; i >= fY; i = i - this.rowSize) {

        var rId = Math.floor(i / this.rowSize);

        if (i % this.rowSize === 0) {

          rId--;
        }

        if (!this.nodeOrigin[rId][cId].isFree) {
  
          return false;
        } else {
  
          blks.push(this.nodeOrigin[rId][cId]);
        }
      }
    }

    return true;
  }

  checkLinkSpace(type: string, parent: MmNode, tfBlk: MmBlock, blks: MmBlock[]): boolean {

    if (type !== 'child node') {

      return true;
    }

    /**
     * - assert link type -> straightline
     * - assert port location within bounds of host nodes
     * 
     * pseudo code:
     * 
     * 1. obtain port locations
     * 2. handle dX = 0 case, if otherwise, compute slope m from ports
     * 3. find intersection between hode node frame line and port, set as start/end points
     * 4. for each progression in x from start_x -> end_x
     *      - compare current y val to anchor line's y val for dY
     *          - itr over blocks contained in dY's worth of change
     *              - if not free -> early return false
     *              - if free -> do nothing
     * 5. if not return by end -> return true
     */

    // normalize entity params later
    var a = 45;
    var b = 32;
    var entityWidth = 3;
    var entityHeight = 2;

    // create dummy node
    var entityCore: number[] = [];

    entityCore[0] = tfBlk.getStart() + Math.floor((tfBlk.getEnd() - tfBlk.getStart()) * entityWidth / 2);
    entityCore[1] = tfBlk.blockId * tfBlk.dispHeight + Math.floor(tfBlk.dispHeight * entityHeight / 2);

    var dummy = new MmNode(null, entityCore[0], entityCore[1], '', '');

    // get port locations
    var portLocationPack = this.getPortLocations(dummy, parent);
    var st = portLocationPack[0];
    var ed = portLocationPack[1];

    // handle dX = 0 case
    if (dummy.getCx() === parent.getCx()) {

      // TODO: imp
      return false;
    } else {

      // compute slope m
      var m = (dummy.getCy() - parent.getCy()) / (dummy.getCx() - parent.getCx());

      var xDir!: number;
      var yDir!: number;

      if (dummy.getCx() > parent.getCx()) {

        xDir = -1;
      } else {

        xDir = 1;
      }

      if (dummy.getCy() > parent.getCy()) {

        yDir = -1;
      } else {

        yDir = 1;
      }

      // find intersection between ports and host node frame lines
      // ports e line: y - st[1] = m (x - st[0])
      // host node frame lines: y = dummy.getCy() + yDir * b and y = parent.getCy() + -1 * yDir * b
      var stY = dummy.getCy() + yDir * this.rowSize;
      var stX = (stY + m * st[0] - st[1]) / m;

      var edY = parent.getCy() + -1 * yDir * this.rowSize;
      var edX = (edY + m * st[0] - st[1]) / m;

      this.testPoints.push([stX, stY]);
      this.testPoints.push([edX, edY]);

      // handle end points first
      if (!this.projectLink(stX, stY, st, xDir, m, this.toAnchorLine(stX, xDir), yDir, blks) || 
            !this.projectLink(edX, edY, st, -1 * xDir, m, this.toAnchorLine(edX, -1 * xDir), -1 * yDir, blks)) {

        return false;
      }

      // check anchor lines in between
      if (xDir > 0) {

        for (var i = this.toAnchorLine(stX, xDir); i < this.toAnchorLine(edX, -1 * xDir); i = i + this.colSize) {

          if (!this.projectLink(i, m * (i - st[0]) + st[1], st, xDir, m, i + this.colSize, yDir, blks)) {

            return false;
          }
        }
      } else {

        for (var i = this.toAnchorLine(stX, xDir); i > this.toAnchorLine(edX, -1 * xDir); i = i - this.colSize) {

          if (!this.projectLink(i, m * (i - st[0]) + st[1], st, xDir, m, i - this.colSize, yDir, blks)) {

            return false;
          }
        }
      }
    }

    return true;
    // var entityWidth = 3;
    // var entityHeight = 2;



    // // get would-be link params
    // var stPack: number[][] = dummy.getPortLocation(parent);
    // var edPack: number[][] = parent.getPortLocation(dummy);

    // var st = stPack[0];
    // var stAn = stPack[1];
    // var edAn = edPack[1];
    // var ed = edPack[0];

    // // move ports out of host bubble
    // if (st[0] > ed[0]) {

    //   st[0] -= this.colSize;
    //   ed[0] += this.colSize;
    // } else if (st[0] < ed[0]) {

    //   st[0] += this.colSize;
    //   ed[0] -= this.colSize;
    // } else {

    // }

    // if (st[1] > ed[1]) {

    //   st[1] -= this.rowSize;
    //   ed[1] += this.rowSize;
    // } else if (st[1] < ed[1]) {

    //   st[1] += this.rowSize;
    //   ed[1] -= this.rowSize;
    // } else {


    // }

    // // raw pixel params
    // var xDiff = Math.abs(st[0] - ed[0]);
    // var yDiff = Math.abs(st[1] - ed[1]);
    // var h = ed[1];

    // // convert link params to col and row ID's
    // st[0] = Math.floor(st[0] / this.colSize);
    // st[1] = Math.floor(st[1] / this.rowSize);

    // ed[0] = Math.floor(ed[0] / this.colSize);
    // ed[1] = Math.floor(ed[1] / this.rowSize);

    // // trace link from parent to would be child location

    // // set direction modifiers
    // var xDir: number = ed[0] < st[0] ? 1 : -1;
    // var yDir: number = ed[1] < st[1] ? 1 : -1;

    // // case on parent and child being horizontal parallels or not
    // if (ed[0] === st[0]) {

    //   // use y-direction instead
    //   var i = ed[1];
    //   var hRow = ed[1];


    //   while (i !== st[1]) {

    //     if (!this.nodeOrigin[hRow][ed[0]].isFree) {

    //       return false;
    //     }

    //     i = i + (1 * yDir);
    //     h = h + (this.rowSize * yDir);
    //     hRow = Math.floor(h / this.rowSize);
    //   }
      
    //   return true;
    // } else {

    //   var slope = yDiff / xDiff;
    //   var i = ed[0];
    //   var hRow = ed[1];

    //   // window.alert("slope is " + slope + " checking " + i + ", " + hRow);

    //   while (i !== st[0]) {

    //     // for column i, check would be link block
    //     if (!this.nodeOrigin[hRow][i].isFree) {

    //       return false;
    //     }

    //     i = i + (1 * xDir);
    //     h = Math.floor(h + (slope * yDir));
    //     hRow = Math.floor(h / this.rowSize);
    //   }

    //   return true;
    // }
  }

  alloc(scope: MmBlock[], type: string, ori: string, args: any[]): number[] | boolean {

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

        //this.testPoints.push([scope[i].getStart(), scope[i].blockId * scope[i].dispHeight])

        var linkBlks: MmBlock[] = [];

        if (this.checkLinkSpace(type, args[0] as MmNode, scope[i], linkBlks)
            && this.containable(scope[i], entityWidth, entityHeight, ori)) {

          if (type === "child node") {

            linkBlks.forEach((blk: MmBlock) => {blk.isFree = false});
            this.tmpLinkBlk = linkBlks;
          }

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
  
          var ret: number[] | boolean = this.alloc(cands, 'host node', 'tf', []);
  
          if (typeof ret !== "boolean") {
  
            // handle returns
            return ret;
          }
        }  
      }
    }

    if (purpose === 'childof') {

      var child: MmNode = args[0];
      var parent: MmNode = args[1];
      var childCenter: number[] = [child.getCx(), child.getCy()];

      // compute radial search limit from old child position
      var lim = this.distBetween(parent, childCenter);

      // window.alert(lim);

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

        // // shuffle order
        // cands = this.shuffleOrder(cands);

        // cands.forEach((blk: MmBlock) => {this.testPoints.push([blk.getStart(), blk.blockId * blk.dispHeight])});

        var ret: number[] | boolean = this.alloc(cands, 'child node', 'tf', [parent]);

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

