import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { Highlightable, LinkPath, MmBlock, MmLink, MmNode, Stateful } from '../data/DefMindmapStructs';
import { OperatorName, SystemCommand } from '../data/DefSysCmd'
import { MindmapService } from '../mindmap.service';

@Component({
  selector: 'app-mm-canvas',
  templateUrl: './mm-canvas.component.html',
  styleUrls: ['./mm-canvas.component.css']
})
export class MmCanvasComponent implements AfterViewInit {

  @ViewChild('gridBkgd') gridFrame!: ElementRef;

  activeNodes: MmNode[] = [];
  activeLinks: MmLink[] = [];
  nodeOrigin: MmBlock[][] = [];
  testPoints: number[][] = [];

  ids: number = 0;
  colSize!: number;
  rowSize!: number;

  // on variable entity sizing, these probs will have to move into entity def
  defaultSearchDist = 8;
  perLayerSearchLim = 3;

  // assert entity as ellipse with mj axis a, min axis b measured in units of pixels
  a = 67;
  b = 48; 
  entityWidth!: number;
  entityHeight!: number;

  entityRadius: number = 2;  // treat entity as circle with such radius for min dist calcs
  borderRadius: number = 1;
  minSearchDist = this.borderRadius + this.entityRadius;
  
  // estimate 3 child nodes per layer for RBSS search depth recommendation
  estimateLayerSize = 3; 

  createThreshold = 90;  // allow create when [0~9] lands < 8
  diceLim = 100;
  nary = 4;  // up to nary number of children for gen example

  spotlightOff = "";
  highLightColor = "orange";
  errorColor = "rgba(255, 0, 0, 0.6)";
  errorColorParent = "rgb(150, 0, 0)";

  pregrabCenter: number[] = [];
  blksMp!: Map<Stateful, MmBlock[]>;
  spotlightNode!: MmNode;
  dragOn: boolean = false;

  showFlag: boolean = true;

  showGrid: boolean = false;

  constructor(private mmCore: MindmapService) {}

  ngAfterViewInit(): void {
    
    // console.log(this.gridFrame.nativeElement.clientWidth);
    // console.log(this.gridFrame.nativeElement.clientHeight);

    this.initOrigin();

    var testDepth = 3;

    this.generateExample(testDepth);
  }

  initOrigin() {

    var frameWidth = this.gridFrame.nativeElement.clientWidth;
    var frameHeight = this.gridFrame.nativeElement.clientHeight;

    this.colSize = Math.floor(0.01 * frameWidth);
    this.rowSize = Math.floor(0.02 * frameHeight);

    this.entityWidth = Math.ceil((2 * this.a) / this.colSize);
    this.entityHeight = Math.ceil((2 * this.b) / this.rowSize);

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

  generateExample(depth: number): MmNode | null {

    var ret: MmNode | null = null;

    // roll dice to gen self
    if (this.hasCreatePermission()) {

      ret = this.generate(String(this.ids++));
      // console.log(ret);
    }

    if (ret !== null && depth > 0) {

      var childCnt = Math.floor(Math.random() * this.nary);
      var children: any[] = [];

      // create child nodes
      for (var i = 0; i < childCnt; i++) {

        children.push(this.generateExample(depth - 1));
      }

      // link child nodes to self
      for (var j = 0; j < children.length; j++) {

        var child = children[j];

        if (child !== null) {

          this.generateLink(child as MmNode, ret);
        }
      }
    }

    return ret;
  }

  hasCreatePermission(): boolean {

    var dice: number = Math.floor(Math.random() * this.diceLim);

    return dice < this.createThreshold; 
  }

  handleMenuEvent(input: string) {

    if (input === "show grid") {

      this.showGrid = !this.showGrid;
    }
  }

  resolveError() {}

  grab(ev: MouseEvent) {

    var tmp: Element | null = document.elementFromPoint(ev.clientX, ev.clientY);

    if (tmp !== null) {

      var nodeId = tmp.getAttribute("nodeId");

      var node: MmNode | undefined = this.activeNodes.find((nd: MmNode) => nd.getId() === nodeId);

      if (node !== undefined) {

        // stop text highlighting with drag
        ev.preventDefault();

        // init drag related vars
        this.pregrabCenter = [node.getCx(), node.getCy()];
        
        this.blksMp = new Map();
        this.blksMp.set(node, node.getBlks());

        this.spotlightNode = node;
        this.freeNode(this.spotlightNode);
        
        node.spotlightOn(this.highLightColor);

        var pLink = node.getParentLink();

        if (pLink !== null) {

          this.freeLink(pLink);
          this.blksMp.set(pLink, pLink.getBlks());
          
          if (!pLink.hasSpotlight()) {

            pLink.spotlightOn(this.highLightColor);
          }
        }

        var children: MmLink[] = node.getChildrenLinks();

        for (var i = 0; i < children.length; i++) {

          this.freeLink(children[i]);
          this.blksMp.set(children[i], children[i].getBlks());
          
          if (!children[i].hasSpotlight()) {

            children[i].spotlightOn(this.highLightColor);
          }
        }

        this.dragOn = true;
      }
    }
  }

  trace(ev: MouseEvent) {

    if (this.dragOn) {

      // stop text highlighting with drag
      ev.preventDefault();

      // trace self node
      this.spotlightNode.setCx(this.spotlightNode.getCx() + ev.movementX);
      this.spotlightNode.setCy(this.spotlightNode.getCy() + ev.movementY);

      // adjust links

      // parent
      var pLink = this.spotlightNode.getParentLink();

      if (pLink !== null) {

        var ports = this.getPortLocations(this.spotlightNode, pLink.getParent());

        pLink.setSt(ports[0][0], ports[0][1]);
        pLink.setEd(ports[1][0], ports[1][1]);
      }

      // children
      var children: MmLink[] = this.spotlightNode.getChildrenLinks();

      for (var i = 0; i < children.length; i++) {

        var ports = this.getPortLocations(children[i].getChild(), this.spotlightNode);

        children[i].setSt(ports[0][0], ports[0][1]);
        children[i].setEd(ports[1][0], ports[1][1]);
      }
    }
  }

  drop(ev: MouseEvent): void {

    if (this.dragOn) {

      this.dragOn = false;

      var a = this.spotlightNode.getRadiusX();
      var b = this.spotlightNode.getRadiusY();

      var leftEdge = this.spotlightNode.getCx() - a;
      var excess = leftEdge % this.colSize;

      this.spotlightNode.setCx(this.spotlightNode.getCx() - excess);

      var topEdge = this.spotlightNode.getCy() - b;

      this.spotlightNode.setCy(this.spotlightNode.getCy() - topEdge % this.rowSize);

      // from cx,cy derive tl st block, then attempt migrate, if fail, revert to pregrab state
      var enWid = this.entityWidth;
      var enHei = this.entityHeight;

      var stBlkLoc = [Math.floor((this.spotlightNode.getCx() - a) / this.colSize), Math.floor((this.spotlightNode.getCy() - b) / this.rowSize)];
      var st: MmBlock = this.nodeOrigin[stBlkLoc[1]][stBlkLoc[0]];

      // first check for containable
      if (this.containable(st, this.spotlightNode, enWid, enHei)) {

        // move child to containable location
        var cx = st.getStart() + Math.floor((st.getEnd() - st.getStart()) * enWid / 2);
        var cy = st.getRowId() * st.getDispHeight() + Math.floor(st.getDispHeight() * enHei / 2);

        this.spotlightNode.setCx(cx);
        this.spotlightNode.setCy(cy);

        // if parent exists, best effort to place parent link
        var pLink: MmLink | null = this.spotlightNode.getParentLink();

        if (pLink !== null) {

          if (!this.linkable(this.spotlightNode, pLink.getParent())) {

            pLink.spotlightOn(this.errorColor);

            var ports = this.getPortLocations(this.spotlightNode, pLink.getParent());
            pLink.setSt(ports[0][0], ports[0][1]);
            pLink.setEd(ports[1][0], ports[1][1]);
          } else {

            pLink.spotlightOff();
          }
        }

        this.spotlightNode.spotlightOff();

        // try best effort to place children links, on fail, only highlight link with error
        var children: MmLink[] = this.spotlightNode.getChildrenLinks();

        for (var i = 0; i < children.length; i++) {

          if (!this.linkable(children[i].getChild(), this.spotlightNode)) {

            // flag child link only
            children[i].spotlightOn(this.errorColor);

            var ports = this.getPortLocations(children[i].getChild(), this.spotlightNode);
            children[i].setSt(ports[0][0], ports[0][1]);
            children[i].setEd(ports[1][0], ports[1][1]);
          } else {

            children[i].spotlightOff();
          }
        }
      } else {

        // revert
        return this.revert();
      }
    }

    return;
  }

  revert(): void {

    // revert spotlight node centers
    this.spotlightNode.setCx(this.pregrabCenter[0]);
    this.spotlightNode.setCy(this.pregrabCenter[1]);

    // revert spotlight node blks
    this.restoreStateful(this.spotlightNode);

    this.spotlightNode.spotlightOff();

    // revert parent link
    var pLink: MmLink | null = this.spotlightNode.getParentLink();

    if (pLink !== null) {

      this.restoreStateful(pLink);

      var ports = this.getPortLocations(this.spotlightNode, pLink.getParent());
      pLink.setSt(ports[0][0], ports[0][1]);
      pLink.setEd(ports[1][0], ports[1][1]);

      pLink.spotlightOff();
    }

    var children: MmLink[] = this.spotlightNode.getChildrenLinks();

    for (var i = 0; i < children.length; i++) {

      this.restoreStateful(children[i]);

      var ports = this.getPortLocations(children[i].getChild(), this.spotlightNode);
      children[i].setSt(ports[0][0], ports[0][1]);
      children[i].setEd(ports[1][0], ports[1][1]);

      children[i].spotlightOff();
    }
  }

  restoreStateful(entity: Stateful) {

    var enBlks: MmBlock[] = this.blksMp.get(entity) as MmBlock[];

    enBlks.forEach((blk: MmBlock) => blk.setOwner(entity));
    entity.setBlks(enBlks);
  }

  parse(userInput: string) {

    this.interpretCmd(this.mmCore.parse(userInput));
  }

  interpretCmd(sysCmd: SystemCommand) {

    // testing
    console.log(sysCmd);
    this.traceExecutionTree(sysCmd);
  }

  traceExecutionTree(rt: SystemCommand) {

    if (rt.getCmdLvl() <= 1) {

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

      // lvl 1 cmds have operands wrapped by generate
      var a: string = (args[0] as SystemCommand).getOperands()[0] as string;
      var b: string = (args[1] as SystemCommand).getOperands()[0] as string;

      return this.edit(a, b);
    } else if (cName === OperatorName.highlight) {

      var a: string = (args[0] as SystemCommand).getOperands()[0] as string;

      return this.highlight(a);
    } else if (cName === OperatorName.remove) {

      var a: string = (args[0] as SystemCommand).getOperands()[0] as string;

      return this.remove(a);
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

  highlight(id: string): MmNode {

    // case on finding relative reference symbol ':'
    var foundRelativeRef: number = id.indexOf(':');

    if (foundRelativeRef !== -1) {

      // resolve id as node -> link
      var ids: string[] = id.split(':');

      var nd: MmNode = this.generate(ids[0]);

      // check parent link
      var pLink = nd.getParentLink();

      if (pLink !== null && pLink.getParent().getId() === ids[1]) {

        // highlight this link
        this.toggleSpotlight(pLink, this.highLightColor);

        return nd;
      }

      // check children link
      var children: MmLink[] = nd.getChildrenLinks();

      for (var i = 0; i < children.length; i++) {

        if (children[i].getChild().getId() === ids[1]) {

          // highlight this link
          this.toggleSpotlight(children[i], this.highLightColor);

          return nd;
        }
      }
    } else {

      // process id only as node
      var nd: MmNode = this.generate(id);

      this.toggleSpotlight(nd, this.highLightColor);
    }

    // silent error treatment
    return nd;
  }

  toggleSpotlight(entity: Highlightable, color: string) {

    if (!entity.hasSpotlight()) {

      entity.spotlightOn(color);
    } else {

      entity.spotlightOff();
    }
  }

  remove(id: string) {

    /**
     * invars involved:
     * 
     * 1. links
     *  - free link space
     *  - update other end of links
     *  - remove links from activeLinks collection
     * 2. self node
     *  - free node space
     *  - remove node from activeNodes collection
     * 
     * 3. how much of unlink is useful here?
     *  - basically all of 1.
     */

    // case on find results
    var nd: MmNode | undefined = this.activeNodes.find((node: MmNode) => node.getId() === id);

    if (nd !== undefined) {

      // if parent, remove self from parent first
      var pLink = nd.getParentLink();

      if (pLink !== null) {

        this.unlink(nd, pLink.getParent());
      }

      // remove self from children
      var children: MmLink[] = nd.getChildrenLinks();

      while (children.length > 0) {

        var child = children[0].getChild();

        this.unlink(child, nd);
      }

      // free self space
      this.freeNode(nd);

      // remove self from activeNodes col
      this.activeNodes.splice(this.activeNodes.indexOf(nd), 1);
    }
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

    var pLink: MmLink | null = child.getParentLink();

    if (pLink === null) {

      return;
    }

    // assert pLink !== null here

    var childClusterSize = child.getClusterSize();

    // recurse upward parent cluster size update
    while (pLink !== null) {

      var pa = pLink.getParent();

      // update parent
      pa.setClusterSize(pa.getClusterSize() - childClusterSize);

      // get parent
      pLink = pa.getParentLink();
    }

    pLink = child.getParentLink() as MmLink;

    this.freeLink(pLink);

    child.setParentLink(null);

    var children: MmLink[] = parent.getChildrenLinks();
  
    children.splice(children.indexOf(pLink), 1);

    // remove link from active links col, if present

    if (this.activeLinks.indexOf(pLink) !== -1) {

      this.activeLinks.splice(this.activeLinks.indexOf(pLink), 1);
    }
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
   fillPartitionItrOrder(order: number[], entityWidth: number, entityHeight: number) {

    // projection heuristic on rows first, fallback on cols, return 'row' or 'col to client

    // placeholder, always return rows from 0 to nodeOrigin.length - 1
    // rowWidth = given dims[0]

    for (var i = 0; i < this.nodeOrigin.length - entityHeight - 1; i+=entityHeight) {

      order.push(i);
    }

    return 'row';
  }

  createOrphan(txt: string, id: string): MmNode | undefined {

    // pull defs from global, not directly using, cuz probs later rid of globals
    var enWid = this.entityWidth;
    var enHei = this.entityHeight;
    
    var itrOrder: number[] = [];
    var fillRes: string = 'row';

    fillRes = this.fillPartitionItrOrder(itrOrder, enWid, enHei);

    // hehe, randomize order
    itrOrder = this.shuffleOrder(itrOrder);

    if (fillRes === 'row') {

      // row wise itr
      for (var i = 0; i < itrOrder.length; i++) {

        var cands: MmBlock[] = [];

        for (var j = 0; j < this.nodeOrigin[itrOrder[i]].length - enWid - 1; j++) {

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

    var entityWidth = this.entityWidth;
    var entityHeight = this.entityHeight;

    // containable sets blk col
    var nd: MmNode = new MmNode(null, -1, -1, nodeTxt, nodeId, this.a, this.b);

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

        throw new Error("unable to alloc space for gen lk purpose");
      }

      // add child cluster size to parent's
      parent.setClusterSize(parent.getClusterSize() + child.getClusterSize());

      // add to active links col
      this.activeLinks.push(newLink);
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

    // pull entity sizing params from globs
    var enWid = this.entityWidth;
    var enHei = this.entityHeight;

    var colSize = this.colSize;
    var rowSize = this.rowSize;

    var pLeftCol = Math.floor(parent.getCx() / colSize) - 1;
    var pRightCol = pLeftCol + 2;
    var pTopRow = Math.floor(parent.getCy() / rowSize) - 1;
    var pBotRow = pTopRow + 1;

    for (var i = 0; i < children.length; i++) {

      if (children[i].hasSpotlight()) {

        var ports = this.getPortLocations(children[i].getChild(), parent);
        children[i].setSt(ports[0][0], ports[0][1]);
        children[i].setEd(ports[1][0], ports[1][1]);

        continue;
      }

      var child: MmNode = children[i].getChild();

      var lim = this.computeLim(child, parent);

      var rangeList = this.shuffleOrder(this.range(this.minSearchDist, lim));
      var k = 0;
      var relocationComplete = false;

      var childCenter = [child.getCx(), child.getCy()];
      var childBlks = child.getBlks();

      this.freeNode(child);
      this.freeLink(children[i]);

      while (k < rangeList.length && !relocationComplete) {

        var m = rangeList[k];

        // in order of top, bot, left, right
        var bounds: number[] = [pTopRow - m - enWid, pBotRow + m + 1, pLeftCol - m - enHei, pRightCol + m + 1];

        var cands: MmBlock[] = this.getRadialLayer(bounds, enWid, enHei);

        var j = 0;

        while (j < cands.length && !relocationComplete) {

          if (this.migrate(cands[j], child, parent, enWid, enHei)) {

            // recurse to children layer
            relocationComplete = this.radialBlockSpaceSearch(child.getChildrenLinks(), child);
          }

          j++;
        }

        k++;
      }

      if (!relocationComplete) {

        // this child exhausted 1->lim but couldnt relocate
        
        // restore child and link to prev stable state
        childBlks.forEach((blk: MmBlock) => blk.setOwner(child));
        child.setBlks(childBlks);

        // restore child centers
        child.setCx(childCenter[0]);
        child.setCy(childCenter[1]);

        // keep link off grid
        var ports = this.getPortLocations(child, children[i].getParent());
        children[i].setSt(ports[0][0], ports[0][1]);
        children[i].setEd(ports[1][0], ports[1][1]);

        // flag link
        children[i].spotlightOn(this.errorColor);
      }
    }

    return true;
  }

  computeLim(child: MmNode, parent: MmNode): number {

    return this.recommendLim(child);
  }

  // is this used anymore?
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

    return this.defaultSearchDist + this.perLayerSearchLim * Math.floor(node.getClusterSize() / this.estimateLayerSize);
  }

  getRadialLayer(bounds: number[], entityWidth: number, entityHeight: number): MmBlock[] {

    var cands: MmBlock[] = [];

    // unfold bounds
    var topBoundRow = bounds[0];
    var botBoundRow = bounds[1];
    var leftBoundCol = bounds[2];
    var rightBoundCol = bounds[3];

    if (topBoundRow >= 0) {

      var start = Math.max(0, leftBoundCol);
      var end = Math.min(this.nodeOrigin[0].length - entityWidth, rightBoundCol);

      for (var i = start; i <= end; i++) {

        var blk = this.nodeOrigin[topBoundRow][i];

        if (blk.isFree()) {

          cands.push(blk);
        }
      }
    }

    if (botBoundRow <= this.nodeOrigin.length - entityHeight) {

      var start = Math.max(0, leftBoundCol);
      var end = Math.min(this.nodeOrigin[0].length - entityWidth, rightBoundCol);

      for (var i = start; i <= end; i++) {

        var blk = this.nodeOrigin[botBoundRow][i];

        if (blk.isFree()) {

          cands.push(blk);
        }
      }
    }

    if (leftBoundCol >= 0) {

      var start = Math.max(0, topBoundRow) + 1;
      var end = Math.min(this.nodeOrigin.length - entityHeight, botBoundRow) - 1;

      for (var i = start; i <= end; i++) {

        var blk = this.nodeOrigin[i][leftBoundCol];

        if (blk.isFree()) {

          cands.push(blk);
        }
      }
    }

    if (rightBoundCol <= this.nodeOrigin[0].length - entityWidth) {

      var start = Math.max(0, topBoundRow) + 1;
      var end = Math.min(this.nodeOrigin.length - entityHeight, botBoundRow) - 1;

      for (var i = start; i <= end; i++) {

        var blk = this.nodeOrigin[i][rightBoundCol];

        if (blk.isFree()) {

          cands.push(blk);
        }
      }
    }

    return cands;
  }

  // assert child and pLink are off the grid pre migrate
  // migrate will only change alloc state if migratable
  migrate(st: MmBlock, child: MmNode, parent: MmNode, entityWidth: number, entityHeight: number): boolean {

    // first check for containable
    if (this.containable(st, child, entityWidth, entityHeight)) {

      // move child to containable location
      var cx = st.getStart() + Math.floor((st.getEnd() - st.getStart()) * entityWidth / 2);
      var cy = st.getRowId() * st.getDispHeight() + Math.floor(st.getDispHeight() * entityHeight / 2);

      child.setCx(cx);
      child.setCy(cy);

      if (!this.linkable(child, parent)) {

        this.freeNode(child);
      } else {

        return true;
      }
    }

    return false;
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
  }

  linkable(child: MmNode, parent: MmNode): boolean {

    /**
     * pseudo code:
     * 
     * 0. mats & inv:
     *  - port location within bounds of host nodes
     *  - link type === straight line
     * 
     * 1. goals:
     *  - check if child node can straight line link parent
     *  - if so, alloc link
     *  - return success as boolean
     * 
     * 2. plan:
     *  - get port locations
     *  - setup equation with 2 points
     *  - sample points at intervals such that every block path crosses will be checked
     *  - check if any block is taken, if so -> return false
     *  - if path is clear, alloc link, do setup -> return true
     */

    // get port locations
    var portLocationPack = this.getPortLocations(child, parent);
    var st = portLocationPack[0];
    var ed = portLocationPack[1];

    // set equation, handle dx = 0 case

    /**
     * LinkPath:
     * - sample direction: x or y
     * - slope
     * - intercept: compute by given point on line
     * - sample frequency
     *  - need to know some info about the grid
     * 
     * methods:
     * - constructor: compose slope, intercept from 2 pts, mem sample dir, with given info compute sample freq
     * - next: give next sample point
     */
    var path!: LinkPath;

    if (child.getCx() === parent.getCx()) {

      // dx = 0, sample in y
      path = new LinkPath('y', st, ed, this.rowSize, this.colSize, child, parent);
    } else {

      path = new LinkPath('x', st, ed, this.rowSize, this.colSize, child, parent);
    }

    var blks: MmBlock[] = [];

    // sample points on line, conv to block ref, early return false if block taken
    while (path.hasNext()) {

      var blkId: number[] = path.next();
      var blkRef: MmBlock = this.nodeOrigin[blkId[0]][blkId[1]];

      if (!blkRef.isFree()) {

        return false;
      } else {

        blks.push(blkRef);
      }
    }

    // path is clear, finish up allocing link
    var link: MmLink = child.getParentLink() as MmLink;

    // trim off beginning and ends to make more port space
    this.trim(child, blks, 0, 0);
    this.trim(parent, blks, blks.length - 1, -1);

    link.setBlks(blks);
    blks.forEach((blk: MmBlock) => blk.setOwner(link));

    link.setSt(st[0], st[1]);
    link.setEd(ed[0], ed[1]);

    return true;
  }

  trim(node: MmNode, blks: MmBlock[], st: number, inc: number) {

    // compute 1 distance container outside node, elim any blk element inside it

    var nodeBlks: MmBlock[] = node.getBlks();

    var minRow = nodeBlks[0].getRowId();
    var maxRow = minRow;
    var minCol = nodeBlks[0].getBlkId();
    var maxCol = minCol;

    for (var i = 1; i < nodeBlks.length; i++) {

      var nxtRow = nodeBlks[i].getRowId();
      var nxtCol = nodeBlks[i].getBlkId();

      if (nxtRow < minRow) {

        minRow = nxtRow;
      }

      if (nxtRow > maxRow) {

        maxRow = nxtRow;
      }

      if (nxtCol < minCol) {

        minCol = nxtCol;
      }

      if (nxtCol > maxCol) {

        maxCol = nxtCol;
      }
    }

    // add 1 to range
    minRow = minRow === 0 ? minRow : minRow - this.borderRadius;
    maxRow = maxRow === this.nodeOrigin.length - 1 ? maxRow : maxRow + this.borderRadius;
    minCol = minCol === 0 ? minCol : minCol - this.borderRadius;
    maxCol = maxCol === this.nodeOrigin[0].length - 1 ? maxCol : maxCol + this.borderRadius;

    var ranges = [minRow, maxRow, minCol, maxCol];

    while (blks.length > 0 && this.inRange(blks[st], ranges)) {

      blks.splice(st, 1);
      st = st + inc;
    }
  }

  inRange(blk: MmBlock, ranges: number[]): boolean {

    var row = blk.getRowId();
    var col = blk.getBlkId();

    return row >= ranges[0] && row <= ranges[1] && col >= ranges[2] && col <= ranges[3];
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

    // pull entity sizing params from globs, or alternatively from nodes themselves
    var fromA = from.getRadiusX();
    var fromB = from.getRadiusY();

    var toA = to.getRadiusX();
    var toB = to.getRadiusY();

    var ret: number[][] = [];

    // handle from vertical align to: node case first
    if (from.getCx() === to.getCx()) {

      if (from.getCy() > to.getCy()) {

        ret.push([from.getCx(), from.getCy() - fromB]);
        ret.push([to.getCx(), to.getCy() + toB]);
      } else {

        ret.push([from.getCx(), from.getCy() + fromB]);
        ret.push([to.getCx(), to.getCy() - toB]);
      }

      return ret;
    }

    // assert from.cx !== to.cx, so slope is defined
    var m = (from.getCy() - to.getCy()) / (from.getCx() - to.getCx());

    var fMag: number[] = this.getIntersectionOffsetMagnitude(fromA, fromB, m);
    var tMag: number[] = this.getIntersectionOffsetMagnitude(toA, toB, m);

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
    ret.push([from.getCx() + fromXDir * fMag[0], from.getCy() + fromYDir * fMag[1]]);
    ret.push([to.getCx() + -1 * fromXDir * tMag[0], to.getCy() + -1 * fromYDir * tMag[1]]);

    // console.log(ret);

    return ret;
  }

  getIntersectionOffsetMagnitude(a: number, b: number, m: number): number[] {

    var c = a * b;
    var d = m * a;

    // obtain x^2 value
    var xSq = (c * c) / (b * b + d * d);

    // obtain y's magnitude
    var coef = b / a;
    var yMag = Math.sqrt(b * b - coef * coef * xSq);

    // obtain x's magnitude
    var xMag = Math.sqrt(xSq);

    return [xMag, yMag];
  }

  freeLink(link: MmLink) {

    var blks: MmBlock[] = link.getBlks();

    for (var i = 0; i < blks.length; i++) {

      blks[i].free();
    }
  }

  // TODO: more responsible free imp
  freeNode(node: MmNode) {

    var blks: MmBlock[] = node.getBlks();

    for (var i = 0; i < blks.length; i++) {

      blks[i].free();
    }
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

  range(st: number, ed: number): number[] {

    var res: number[] = [];

    for (var i = st; i <= ed; i++) {

      res.push(i);
    }

    return res;
  }
}

