import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-mm-controls-err-flag',
  templateUrl: './mm-controls-err-flag.component.html',
  styleUrls: ['./mm-controls-err-flag.component.css']
})
export class MmControlsErrFlagComponent implements OnInit, OnChanges {

  @Input() showFlag!: boolean;
  @Output() initErrHandlingEvent = new EventEmitter();

  showSelf: string = "display: block";
  hideSelf: string = "display: none";

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    if (changes['showFlag'].currentValue === true) {

      this.initErrHandlingEvent.emit();
    }
  }

}
