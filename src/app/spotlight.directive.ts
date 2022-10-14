import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[spotlight]'
})
export class SpotlightDirective implements OnInit {

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    
    this.el.nativeElement.focus();
  }
}
