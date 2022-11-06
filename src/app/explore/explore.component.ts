import { Component, OnInit } from '@angular/core';
import { ListEntry } from '../data/DefListEntry';

import { ExploreService } from '../explore.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  inputText: string = '';
  entries: Set<ListEntry>;

  constructor(private expService: ExploreService) { 

    this.entries = expService.getEntryBook();
  }

  ngOnInit(): void {
  }

  addEntry() {

    this.expService.addEntry(this.inputText, false);
    this.inputText = '';
  }

  requestEdit(lstEntry: ListEntry) {

    this.expService.requestEdit(lstEntry);
  }

  editEntry(lstEntry: ListEntry, ev: any) {

    this.expService.editEntry(lstEntry, ev);
  }

  toggleEntry(lstEntry: ListEntry) {

    this.expService.toggleEntry(lstEntry);
  }

  removeEntry(lstEntry: ListEntry) {

    this.expService.removeEntry(lstEntry);
  }

}
