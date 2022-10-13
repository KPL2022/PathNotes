import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreDispComponent } from './core-disp/core-disp.component';
import { ExploreComponent } from './explore/explore.component';
import { JournalComponent } from './journal/journal.component';
import { LandingComponent } from './landing/landing.component';
import { MindmapComponent } from './mindmap/mindmap.component';
import { VersionNotesComponent } from './version-notes/version-notes.component';

export const routes: Routes = [
  
  { path: '', component: LandingComponent },

  { path: 'core-disp', 
    component: CoreDispComponent,
    children: [
      { path: 'mindmap', title: 'mindmap', component: MindmapComponent },
      { path: 'journal', title: 'journal', component: JournalComponent },
      { path: 'explore', title: 'explore', component: ExploreComponent },
      { path: 'version-notes', title: 'version-notes', component: VersionNotesComponent }
    ] 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
