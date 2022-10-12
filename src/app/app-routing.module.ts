import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreDispComponent } from './core-disp/core-disp.component';
import { ExploreComponent } from './explore/explore.component';
import { JournalComponent } from './journal/journal.component';
import { LandingComponent } from './landing/landing.component';

const routes: Routes = [
  
  { path: '', component: LandingComponent },

  { path: 'core-disp', 
    component: CoreDispComponent,
    children: [
      { path: 'explore', title: 'explore', component: ExploreComponent },
      { path: 'journal', title: 'journal', component: JournalComponent },
    ] 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
