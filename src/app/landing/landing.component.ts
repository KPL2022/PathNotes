import { Component, OnInit } from '@angular/core';

import { currentOptions } from './landing-options';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  currentOptions = currentOptions;

  constructor() { }

  ngOnInit(): void {
  }

}
