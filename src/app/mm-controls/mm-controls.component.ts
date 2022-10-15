import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { MindmapService } from '../mindmap.service';

@Component({
  selector: 'app-mm-controls',
  templateUrl: './mm-controls.component.html',
  styleUrls: ['./mm-controls.component.css']
})
export class MmControlsComponent implements OnInit {

  userExpression!: string;
  @Output() materialize = new EventEmitter<string>();

  constructor(private mmCore: MindmapService) { }

  ngOnInit(): void {
  }

  autoComplete() {

    this.userExpression = this.mmCore.format(this.userExpression);
  }

  invoke() {

    this.materialize.emit(this.userExpression);
    this.userExpression = '';
  }

}
