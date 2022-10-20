import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import { MmNode } from '../DataTypes';

@Component({
  selector: 'app-mm-canvas',
  templateUrl: './mm-canvas.component.html',
  styleUrls: ['./mm-canvas.component.css']
})
export class MmCanvasComponent implements OnInit, OnChanges {

  @Input() drawRequest!: string[];

  bubbles: MmNode[] = [];

  constructor() { 

    this.bubbles.push(new MmNode(100, 100, "xD"));
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
    this.bubbles.push(new MmNode(Math.random() * 1000, Math.random() * 600, userCmd[0]))
  }


}
