import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-mm-controls-side',
  templateUrl: './mm-controls-side.component.html',
  styleUrls: ['./mm-controls-side.component.css']
})
export class MmControlsSideComponent implements OnInit {

  placeholder!: string;
  @Output() menuEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  showGrid() {

    this.menuEvent.emit("show grid");
  }

}
