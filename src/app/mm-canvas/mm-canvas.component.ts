import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-mm-canvas',
  templateUrl: './mm-canvas.component.html',
  styleUrls: ['./mm-canvas.component.css']
})
export class MmCanvasComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild('board') brd!: ElementRef;
  @Input() drawRequest!: string[];

  private contxt!: CanvasRenderingContext2D;

  constructor() { 
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    this.brd.nativeElement.width = this.brd.nativeElement.offsetWidth;
    this.brd.nativeElement.height = this.brd.nativeElement.offsetHeight;

    this.contxt = this.brd.nativeElement.getContext('2d');
  }

  ngOnChanges(changes: SimpleChanges) {

    if (!changes['drawRequest'].firstChange) {
      this.interpretCmd(changes['drawRequest'].currentValue);
    }
  }

  interpretCmd(userCmd: string[]) {

    this.animate(userCmd[0]);
  }

  animate(userInput: string) {

    var fs = "feature services";
    var jr = "journal service";
    var mm = "mindmap service";
    var exp = "explore service";
    var pe = "persistency service";
    var bk = "backend API";
    var nj = "node.js";

    this.contxt.fillRect(50, 50, 40, 25);
    this.contxt.font = "50px Arial";
    this.contxt.fillText(userInput, Math.random() * 1300, Math.random() * 700);
  }

}
