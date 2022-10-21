import { Component, OnInit, Input, OnChanges, SimpleChanges, ApplicationRef } from '@angular/core';

import { MmNode } from '../DataTypes';

@Component({
  selector: 'app-mm-canvas',
  templateUrl: './mm-canvas.component.html',
  styleUrls: ['./mm-canvas.component.css']
})
export class MmCanvasComponent implements OnInit, OnChanges {

  @Input() drawRequest!: string[];

  activeNodes: MmNode[] = [];
  nodeOrigin: MmNode[] = [];
  ids: number = 0;

  constructor() { 

    // this.activeNodes.push(new MmNode(100, 100, "xD", String(this.ids++)));
    this.initOrigin();
  }

  initOrigin() {

    var a = 75;
    var b = 37;
    var colMargin = 10;
    var rowMargin = 6;
    var colSize = 2 * a + colMargin;
    var rowSize = 2 * b + rowMargin;

    var frameWidth = 1300;
    var frameHeight = 700;

    for (var i = 0; i < Math.floor(frameWidth / colSize); i++) {

      for (var j = 0; j < Math.floor(frameHeight / rowSize); j++) {

        var x = i * colSize + Math.floor(colSize / 2);
        var y = j * rowSize + Math.floor(rowSize / 2);

        this.nodeOrigin.push(new MmNode(x, y, '', '-1'));
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

  interpretCmd(userCmd: string[]) {

    // TODO: imp
    // this.collisionAwarePlacement(userCmd[0]);
    
    while (this.nodeOrigin.length !== 0) {

      this.activateNode('test');
    }
  }

  activateNode(userInput: string) {

    var baseNode: MmNode = this.nodeOrigin[Math.floor(Math.random() * this.nodeOrigin.length)];
  
    this.nodeOrigin.splice(this.nodeOrigin.indexOf(baseNode), 1);

    baseNode.setTxt(userInput);
    baseNode.setId(String(this.ids++));

    this.activeNodes.push(baseNode);
  }

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
}
