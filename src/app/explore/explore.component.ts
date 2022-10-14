import { Component, OnInit } from '@angular/core';

import { ExploreService } from '../explore.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  inputText: string = '';

  constructor(private expService: ExploreService) { }

  ngOnInit(): void {
  }

  addEntry() {

    this.expService.addEntry(this.inputText, false);
    this.inputText = '';
  }

}
