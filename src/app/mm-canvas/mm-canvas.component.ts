import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

import { MmBlock, MmLink, MmNode } from '../data/DefMindmapStructs';
import { OperatorName, SystemCommand } from '../data/DefSysCmd'

@Component({
  selector: 'app-mm-canvas',
  templateUrl: './mm-canvas.component.html',
  styleUrls: ['./mm-canvas.component.css']
})
export class MmCanvasComponent implements OnInit, OnChanges {

  @Input() drawRequest!: SystemCommand;

  activeNodes: MmNode[] = [];
  activeLinks: MmLink[] = [];
  nodeOrigin: MmBlock[][] = [];
  testPoints: number[][] = [];

  ids: number = 0;
  frameWidth = 1070;
  frameHeight = 750;
  colSize = Math.floor(0.03 * this.frameWidth);
  rowSize = Math.floor(0.05 * this.frameHeight);
  estimateLayerSize = 8; // estimate 8 child nodes per layer for RBSS search depth recommendation

  constructor() { 

    this.initOrigin();

    var testPoolSize = 15;
    var testLinkCnt = 10;

    for (var i = 0; i < testPoolSize; i++) {

      this.generate(String(i));
    }

    for (var j = 0; j < testLinkCnt; j++) {

      var idxA = Math.floor(Math.random() * this.activeNodes.length);
      var idxB = Math.floor(Math.random() * this.activeNodes.length);

      this.generateLink(this.activeNodes[idxA], this.activeNodes[idxB]);
    }
  }

  initOrigin() {

    var frameWidth = this.frameWidth;
    var frameHeight = this.frameHeight;
    var colSize = this.colSize;
    var rowSize = this.rowSize;

    for (var i = 0; i < Math.floor(frameHeight / rowSize); i++) {

      this.nodeOrigin.push([]);
      for (var j = 0; j < Math.floor(frameWidth / colSize); j++) {

        var st = j * (colSize);
        this.nodeOrigin[i].push(new MmBlock(st, st + colSize, rowSize, i, j));  
      }
    }
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {

    if (!changes['drawRequest'].firstChange) {
      this.interpretCmd(changes['drawRequest'].currentValue);
    }
  }

  interpretCmd(sysCmd: SystemCommand) {

    // testing
    console.log(sysCmd);
    this.traceExecutionTree(sysCmd);
  }

  traceExecutionTree(rt: SystemCommand) {

    if (rt.getCmdLvl() === 0) {

      return this.execute(rt, rt.getOperands());
    } else {

      var children: SystemCommand[] = rt.getOperands() as SystemCommand[];
      var operands: any[] = [];

      for (var i = 0; i < children.length; i++) {

        operands.push(this.traceExecutionTree(children[i]));
      }

      return this.execute(rt, operands);
    }
  }

  execute(cmd: SystemCommand, args: any[]) {

    /**
     * pseudo code
     * 
     * 0. inv
     *  - execute return value depends on context of the command
     *    - undefined as err code
     * 
     * 1. imp plan
     *  - switch on cmd.name
     */
    
    // switch on cmd.name
    var cName: OperatorName = cmd.getOperatorName();

    if (cName === OperatorName.generate) {

      return this.generate(args[0] as string);
    } else if (cName === OperatorName.edit) {

      return this.edit(args[0] as string, args[1] as string);
    } else if (cName === OperatorName.highlight) {

      return this.highlight(args[0] as string);
    } else if (cName === OperatorName.remove) {

      return this.remove(args[0] as string);
    } else if (cName === OperatorName.link) {

      return this.link(args[0] as MmNode, args[1] as MmNode);
    } else if (cName === OperatorName.unlink) {

      return this.unlink(args[0] as MmNode, args[1] as MmNode);
    } else if (cName === OperatorName.merge) {

      return this.merge(args[0] as MmNode, args[1] as MmNode);
    } else {

      return undefined;
    }
  }

  generate(id: string) {

    /**
     * pseudo code:
     * 
     * 0. mats & inv:
     *  - the to be gen'ed node does not alr exist
     *  - cmd + args contain sufficient info to gen node
     * 
     * 2. plan
     *  - get node txt from params and check no entry alr exist
     *  - if no entry, gen node, else return found entry
     */
    var nd: MmNode | undefined = this.activeNodes.find((nd: MmNode) => nd.getId() === id);

    if (nd === undefined) {

      // gen node
      var nd: MmNode | undefined = this.createOrphan(id, String(this.ids++));

      if (nd === undefined) {

        throw new Error('unable to allocate space for node');
      }

      this.activeNodes.push(nd);
    }
    
    return nd;
  }

  edit(id: string, newTxt: string) {

    /**
     * pseudo code:
     * 
     * 0. mats & inv:
     *  - node to be edited has id args[0] as string
     *  - node with id exists or will be created 
     * - args[1] as string is new txt for such node
     * 
     * 2. plan
     *  - try to find node by id, if not found create such node
     *  - edit node text
     *  - return node itself
     */
    var nd: MmNode = this.generate(id);

    nd.setTxt(newTxt);

    return nd;
  }

  highlight(txtIdentifier: string) {

  }

  remove(txtIdentifier: string) {

    // TODO: imp, also remem to remove from activeNodes col
  }

  link(child: MmNode, parent: MmNode) {

    /**
     * pseudo code:
     * 
     * 0. mats & inv:
     *  - args[0] is child node
     *  - args[1] is parent node
     *  - both child & parent confirmed to exist
     *  - child does not alr have link to parent
     *  - child will have link to parent by end of this method
     *  - parent will have child in child list
     *  - child and des will relocate to satisfy linking reqs
     * 
     * 2. plan
     *  - check if link alr exists
     *  - if so do nothing
     *  - else generate link recursively
     *  - return parent node
     */

    // assert every node can only have 1 parent
    this.generateLink(child, parent);

    return parent;
  }

  unlink(child: MmNode, parent: MmNode) {

    // assert pLink !== null here
    var pLink: MmLink = child.getParentLink() as MmLink;

    this.freeLink(pLink);

    child.setParentLink(null);

    var children: MmLink[] = parent.getChildrenLinks();
  
    children.splice(children.indexOf(pLink), 1);

    // update parent cluster size
    parent.setClusterSize(parent.getClusterSize() - child.getClusterSize());

    // remove link from active links col
    this.activeLinks.splice(this.activeLinks.indexOf(pLink), 1);
  }

  merge(clusterA: MmNode, clusterB: MmNode) {

  }

  /**
   * TODO: imp
   * 
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

    // placeholder, always return rows from 0 to nodeOrigin.length - 1
    // rowWidth = given dims[0]

    for (var i = 0; i < this.nodeOrigin.length - dims[0] - 1; i+=dims[0]) {

      order.push(i);
    }

    return 'row';
  }

  createOrphan(txt: string, id: string): MmNode | undefined {

    // assert nodes as 2x3 entities in space
    var dims = [2, 3];
    
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

          if (this.nodeOrigin[itrOrder[i]][j].isFree()) {

            cands.push(this.nodeOrigin[itrOrder[i]][j]);
          }
        }

        cands = this.shuffleOrder(cands);

        var ret: MmNode | undefined = this.allocOrphan(cands, txt, id);

        if (ret !== undefined) {

          return ret;
        }
      }  
    }

    return undefined;
  }

  allocOrphan(scope: MmBlock[], nodeTxt: string, nodeId: string): MmNode | undefined {

    var entityWidth = 3;
    var entityHeight = 2;

    // containable sets blk col
    var nd: MmNode = new MmNode(null, -1, -1, nodeTxt, nodeId);

    for (var i = 0; i < scope.length; i++) {

      if (this.containable(scope[i], nd, entityWidth, entityHeight)) {

        // fill cx, cy -> return
        var cx = scope[i].getStart() + Math.floor((scope[i].getEnd() - scope[i].getStart()) * entityWidth / 2);
        var cy = scope[i].getRowId() * scope[i].getDispHeight() + Math.floor(scope[i].getDispHeight() * entityHeight / 2);

        nd.setCx(cx);
        nd.setCy(cy);

        return nd;
      }
    }

    return undefined;
  }

  generateLink(child: MmNode, parent: MmNode) {

    /**
     * pseudo code:
     * 
     * 0. mats & inv:
     *  - no link alr exists between child and parent
     * 
     * 1. goals:
     *  - gen new link child -> parent
     *  - reasonably distribute child content centered on child, child around parent
     * 
     * 3. imp plan
     *  - RBSS(parent) -> RBSS(child) -> fill descendant spaces
     */

    var pLink = child.getParentLink();

    if (pLink === null || pLink.getParent() !== parent) {

      if (pLink !== null) {

        this.unlink(child, pLink.getParent());
      }

      var newLink = new MmLink(child, parent, [], []);
      child.setParentLink(newLink);
      parent.getChildrenLinks().push(newLink);

      if (!this.radialBlockSpaceSearch([newLink], parent)) {

        throw new Error('unable to allocate space for a child type node');
      }

      // add to active links col
      this.activeLinks.push(newLink);

      // give child cluster size to parent
      parent.setClusterSize(parent.getClusterSize() + child.getClusterSize());
    }
  }

  /**
   * 
   * possible optimizations:
   * 
   * 1. sort or remain sort order for children to place largest cluster first
   * 2. set search order away from linear 1->lim, base on child cluster size perhaps
   * 
   * @param children 
   * @param parent 
   * @returns 
   */
  radialBlockSpaceSearch(children: MmLink[], parent: MmNode): boolean {

    /**
     * pseudo code
     * 
     *  0. mats & inv:
     *  - no link alr between child & parent
     *  - means of estimating child family size
     *    - introduced clusterSize inv -> MmNode
     *  - means of articulating best effort policy
     *  - parent location is fixed
     * 
     * 1. goals
     *  - gen new link from child to parent
     *  - relocate child and child descendants to reasonable spaces around the parent
     * 
     * 2. plan
     *  - relocate child to close by the parent with link generated
     *    - dist should depend on size of child family
     *  - relocate descendants of child recursively, update links
     *    - try to find locations where descendant to child dist is close to original
     *  - if unable to find space for descendant, free upward and try again
     *  - if exhaust child level options, return error
     */

    // assert nodes as 3x2 entities in space
    var dims = [3, 2];

    var colSize = this.colSize;
    var rowSize = this.rowSize;

    var pLeftCol = Math.floor(parent.getCx() / colSize) - 1;
    var pRightCol = pLeftCol + 2;
    var pTopRow = Math.floor(parent.getCy() / rowSize) - 1;
    var pBotRow = pTopRow + 1;

    for (var i = 0; i < children.length; i++) {

      var child: MmNode = children[i].getChild();

      var lim = this.computeLim(child, parent);

      var k = 1;
      var relocationComplete = false;

      while (k <= lim && !relocationComplete) {

        // in order of top, bot, left, right
        var bounds: number[] = [pTopRow - k - dims[0], pBotRow + k + 1, pLeftCol - k - dims[1], pRightCol + k + 1];

        var cands: MmBlock[] = this.getRadialLayer(bounds, dims);

        var j = 0;

        while (j < cands.length && !relocationComplete) {

          if (this.migrate(cands[j], child, parent, dims)) {

            // recurse to children layer
            relocationComplete = this.radialBlockSpaceSearch(child.getChildrenLinks(), child);
          }

          j++;
        }

        k++;
      }

      if (!relocationComplete) {

        // this child exhausted 1->lim but couldnt relocate, give up
        return false;
      }
    }

    return true;
  }

  computeLim(child: MmNode, parent: MmNode): number {

    return Math.max(this.distBetween(child, parent), this.recommendLim(child));
  }

  distBetween(child: MmNode, parent: MmNode) {
    
    // TODO: normalize bubble dims
    var entityWidth = 3 * this.colSize;
    var entityHeight = 2 * this.rowSize;

    //divide into 4 regions, vertical y's and 2 x's on the side

    var xDist = Math.abs(child.getCx() - parent.getCx());
    var yDist = Math.abs(child.getCy() - parent.getCy());

    // case on which axis is further away
    if (xDist > yDist) {

      return Math.floor((xDist - entityWidth) / this.colSize);
    } else {

      return Math.floor((yDist - entityHeight) / this.rowSize);
    }
  }

  recommendLim(node: MmNode) {

    return 1 + Math.floor(node.getClusterSize() / this.estimateLayerSize);
  }

  getRadialLayer(bounds: number[], dims: number[]): MmBlock[] {

    var cands: MmBlock[] = [];

    // unfold bounds
    var topBoundRow = bounds[0];
    var botBoundRow = bounds[1];
    var leftBoundCol = bounds[2];
    var rightBoundCol = bounds[3];

    if (topBoundRow >= 0) {

      var start = Math.max(0, leftBoundCol);
      var end = Math.min(this.nodeOrigin[0].length - dims[0], rightBoundCol);

      for (var i = start; i <= end; i++) {

        var blk = this.nodeOrigin[topBoundRow][i];

        if (blk.isFree()) {

          cands.push(blk);
        }
      }
    }

    if (botBoundRow <= this.nodeOrigin.length - dims[1]) {

      var start = Math.max(0, leftBoundCol);
      var end = Math.min(this.nodeOrigin[0].length - dims[0], rightBoundCol);

      for (var i = start; i <= end; i++) {

        var blk = this.nodeOrigin[botBoundRow][i];

        if (blk.isFree()) {

          cands.push(blk);
        }
      }
    }

    if (leftBoundCol >= 0) {

      var start = Math.max(0, topBoundRow) + 1;
      var end = Math.min(this.nodeOrigin.length - dims[1], botBoundRow) - 1;

      for (var i = start; i <= end; i++) {

        var blk = this.nodeOrigin[i][leftBoundCol];

        if (blk.isFree()) {

          cands.push(blk);
        }
      }
    }

    if (rightBoundCol <= this.nodeOrigin[0].length - dims[0]) {

      var start = Math.max(0, topBoundRow) + 1;
      var end = Math.min(this.nodeOrigin.length - dims[1], botBoundRow) - 1;

      for (var i = start; i <= end; i++) {

        var blk = this.nodeOrigin[i][rightBoundCol];

        if (blk.isFree()) {

          cands.push(blk);
        }
      }
    }

    return cands;
  }

  migrate(st: MmBlock, child: MmNode, parent: MmNode, dims: number[]): boolean {

    // first check for containable
    if (this.containable(st, child, dims[0], dims[1])) {

      // move child to containable location
      var cx = st.getStart() + Math.floor((st.getEnd() - st.getStart()) * dims[0] / 2);
      var cy = st.getRowId() * st.getDispHeight() + Math.floor(st.getDispHeight() * dims[1] / 2);

      child.setCx(cx);
      child.setCy(cy);

      return this.linkable(child, parent, dims);
    } else {

      return false;
    }
  }

  containable(st: MmBlock, nd: MmNode, width: number, height: number): boolean {

    // assert st.isFree() is true
    // assert orientation is 'tf'

    // assert entity placement containing st can exist
    // (at least width - 1 neighbors in major axis, height - 1 in minor)

    // itr check all involved neighbors
    
    var blks: MmBlock[] = [];
    var stRow = st.getRowId();
    var boundRow = stRow + height;
    var boundCol = st.getBlkId() + width;

    while (stRow < boundRow) {

      var stCol = st.getBlkId();

      while (stCol < boundCol) {

        var curBlk = this.nodeOrigin[stRow][stCol];

        if (!curBlk.isFree()) {

          return false;
        } else {

          blks.push(curBlk);
        }

        stCol++;
      }
      stRow++;
    }

    // double link blks and node
    this.freeNode(nd);
    nd.setBlks(blks);
    blks.forEach((bk: MmBlock) => bk.setOwner(nd));

    return true;
    // var stIdx = -1;
    // var rowIdx = -1;

    // for (var i = 0; i < this.nodeOrigin.length && stIdx < 0; i++) {

    //   var tmpIdx = this.nodeOrigin[i].indexOf(st);
      
    //   if (tmpIdx > -1) {

    //     stIdx = tmpIdx;
    //     rowIdx = i;
    //   }
    // }

    // var a = this.nodeOrigin[rowIdx][stIdx + 1];
    // var b = this.nodeOrigin[rowIdx][stIdx + 2];
    
    // var c = this.nodeOrigin[rowIdx + 1][stIdx];
    // var d = this.nodeOrigin[rowIdx + 1][stIdx + 1];
    // var e = this.nodeOrigin[rowIdx + 1][stIdx + 2];

    // if (a.isFree() && b.isFree() && c.isFree() && d.isFree() && e.isFree()) {

    //   st.isFree = false;
    //   a.isFree = false;
    //   b.isFree = false;
    //   c.isFree = false;
    //   d.isFree = false;
    //   e.isFree = false;

    //   return true;
    // } else {

    //   return false;
    // }
  }

  linkable(child: MmNode, parent: MmNode, dims: number[]): boolean {

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
    var entityWidth = dims[0];
    var entityHeight = dims[1];

    // get port locations
    var portLocationPack = this.getPortLocations(child, parent);
    var st = portLocationPack[0];
    var ed = portLocationPack[1];

    // handle dX = 0 case
    if (child.getCx() === parent.getCx()) {

      // TODO: imp
      return false;
    } else {

      // compute slope m
      var m = (child.getCy() - parent.getCy()) / (child.getCx() - parent.getCx());

      var xDir!: number;
      var yDir!: number;

      if (child.getCx() > parent.getCx()) {

        xDir = -1;
      } else {

        xDir = 1;
      }

      if (child.getCy() > parent.getCy()) {

        yDir = -1;
      } else {

        yDir = 1;
      }

      // find intersection between ports and host node frame lines
      // ports e line: y - st[1] = m (x - st[0])
      // host node frame lines: y = dummy.getCy() + yDir * b and y = parent.getCy() + -1 * yDir * b
      var stY = child.getCy() + yDir * this.rowSize;
      var stX = (stY + m * st[0] - st[1]) / m;

      var edY = parent.getCy() + -1 * yDir * this.rowSize;
      var edX = (edY + m * st[0] - st[1]) / m;

      // this.testPoints.push([stX, stY]);
      // this.testPoints.push([edX, edY]);

      var blks: MmBlock[] = [];

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

      // complete link setup
      var link: MmLink = child.getParentLink() as MmLink;
      
      this.freeLink(link);

      link.setBlks(blks);
      blks.forEach((blk: MmBlock) => blk.setOwner(link));

      link.setSt(st[0], st[1]);
      link.setEd(ed[0], ed[1]);

      return true;
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

    // console.log(xMag + " is x mag");
    // console.log(yMag + " is y mag");
    // translate raw x/y back to system coord by applying host node's offset with direction modifiers
    ret.push([from.getCx() + fromXDir * xMag, from.getCy() + fromYDir * yMag]);
    ret.push([to.getCx() + -1 * fromXDir * xMag, to.getCy() + -1 * fromYDir * yMag]);

    // console.log(ret);

    return ret;
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

        if (!this.nodeOrigin[Math.floor(i / this.rowSize)][cId].isFree()) {
  
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

        if (!this.nodeOrigin[rId][cId].isFree()) {
  
          return false;
        } else {
  
          blks.push(this.nodeOrigin[rId][cId]);
        }
      }
    }

    return true;
  }

  toAnchorLine(stX: number, xDir: number) {

    if (xDir > 0) {

      return stX + (this.colSize - stX % this.colSize);
    } else {

      return stX - stX % this.colSize;
    }
  }

  freeLink(link: MmLink) {

    link.getBlks().forEach((blk: MmBlock) => {blk.free();});
  }

  // TODO: more responsible free imp
  freeNode(node: MmNode) {

    node.getBlks().forEach((blk: MmBlock) => blk.free());
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
}

