import { Injectable } from '@angular/core';
import { ListEntry, RecordEntry } from './DataTypes';

// import { HttpClient } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError, retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersistencyService {

  constructor() { }

  retrieveRecords(recordType: string) {

    // TODO: imp

    return new Set<ListEntry>();
  }

  addRecord(recordType: string, record: RecordEntry) {

    // TODO: imp
  }

  updateRecord(recordType: string, record: RecordEntry) {

    // TODO: imp
  }

  removeRecord(recordType: string, record: RecordEntry) {

    // TODO: imp
  }

  resetRecords(recordType: string) {

    // TODO: imp
  }

  loadRecordId(recordType: string) {

    // TODO: imp

    return 0;
  }

}
