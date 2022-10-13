import { TestBed } from '@angular/core/testing';

import { MindmapService } from './mindmap.service';

describe('MindmapService', () => {
  let service: MindmapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MindmapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
