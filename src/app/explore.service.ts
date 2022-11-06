import { Injectable } from '@angular/core';
import { ListEntry } from './data/DefListEntry';
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

  getEntryBook() {

    return this.entryBook
  }

  addEntry(todoText: string, status: boolean) {

    // TODO: imp
    var res: ListEntry = new ListEntry(this.nxtId++, todoText, status);

    this.entryBook.add(res);
    this.coreRecords.addRecord('ListEntry', res);
  }

  removeEntry(lstEntry: ListEntry) {

    // TODO: imp
    this.entryBook.delete(lstEntry);

    this.coreRecords.removeRecord('ListEntry', lstEntry);
  }

  requestEdit(lstEntry: ListEntry) {

    lstEntry.setEditFlag(true);
  }

  editEntry(lstEntry: ListEntry, ev: any) {

    // TODO: imp
    lstEntry.setText(ev.target.value);
    lstEntry.setEditFlag(!lstEntry.isOpenForEdit());

    this.coreRecords.updateRecord('ListEntry', lstEntry);
  }

  toggleEntry(lstEntry: ListEntry) {

    // TODO: imp
    lstEntry.setStatus(!lstEntry.isComplete());

    this.coreRecords.updateRecord('ListEntry', lstEntry);
  }


}
