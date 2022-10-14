import { Injectable } from '@angular/core';
import { ListEntry } from './DataTypes';
import { PersistencyService } from './persistency.service';

@Injectable({
  providedIn: 'root'
})
export class ExploreService {

  private entryBook: Set<ListEntry>;
  private nxtId: number = 0;

  constructor(private coreRecords: PersistencyService) {

    this.entryBook = coreRecords.retrieveRecords('ListEntry');
    this.nxtId = coreRecords.loadRecordId('ListEntry');
   }

  addEntry(todoText: string, status: boolean) {

    // TODO: imp
    var res: ListEntry = new ListEntry(this.nxtId++, todoText, status);

    this.entryBook.add(res);
    this.coreRecords.addRecord('ListEntry', res);
  }

  removeEntry(lstEntry: ListEntry) {

    // TODO: imp


  }

  editEntry(lstEntry: ListEntry, newItemTxt: string) {

    // TODO: imp
  }

  toggleEntry(lstEntry: ListEntry) {

    // TODO: imp
  }


}
