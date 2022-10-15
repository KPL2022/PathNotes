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
  private canvasReady: boolean = false;

  constructor() { 
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    this.contxt = this.brd.nativeElement.getContext('2d');
    this.canvasReady = true;
  }

  ngOnChanges(changes: SimpleChanges) {

    if (this.canvasReady) {

      this.interpretCmd(changes['drawRequest'].currentValue);
    }
  }

  interpretCmd(userCmd: string[]) {

    this.animate();
  }

  animate() {

    var fs = "feature services";
    var jr = "journal service";
    var mm = "mindmap service";
    var exp = "explore service";
    var pe = "persistency service";
    var bk = "backend API";
    var nj = "node.js";

    this.contxt.fillRect(Math.random() * 300, Math.random() * 100, 40, 25);
    // this.contxt.fillText(fs, 30, 50);
  }

}
