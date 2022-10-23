import { Component, OnInit } from '@angular/core';
import { SystemCommand } from '../DataTypes';

import { MindmapService } from '../mindmap.service';

@Component({
  selector: 'app-mindmap',
  templateUrl: './mindmap.component.html',
  styleUrls: ['./mindmap.component.css']
})
export class MindmapComponent implements OnInit {

  canvasQuery!: SystemCommand;

  constructor(private mmCore: MindmapService) { }

  ngOnInit(): void {
  }

  parse(userInput: string) {

    this.canvasQuery = this.mmCore.parse(userInput);
  }

}
