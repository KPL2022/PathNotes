import { Component, OnInit } from '@angular/core';

import { MindmapService } from '../mindmap.service';

@Component({
  selector: 'app-mindmap',
  templateUrl: './mindmap.component.html',
  styleUrls: ['./mindmap.component.css']
})
export class MindmapComponent implements OnInit {

  canvasQuery!: string[];

  constructor(private mmCore: MindmapService) { }

  ngOnInit(): void {
  }

  parse(userInput: string) {

    this.canvasQuery = this.mmCore.parse(userInput);
  }

}
