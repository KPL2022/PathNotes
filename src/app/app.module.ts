import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule, routes } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { ExploreComponent } from './explore/explore.component';
import { JournalComponent } from './journal/journal.component';
import { CoreDispComponent } from './core-disp/core-disp.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { VersionNotesComponent } from './version-notes/version-notes.component';
import { GoalsComponent } from './goals/goals.component';
import { MindmapComponent } from './mindmap/mindmap.component';

import { FormsModule } from '@angular/forms';
import { SpotlightDirective } from './spotlight.directive';

import { HttpClientModule } from '@angular/common/http';
import { MmCanvasComponent } from './mm-canvas/mm-canvas.component';
import { MmControlsComponent } from './mm-controls/mm-controls.component';
import { MmControlsSideComponent } from './mm-controls-side/mm-controls-side.component'

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    ExploreComponent,
    JournalComponent,
    CoreDispComponent,
    SideNavComponent,
    VersionNotesComponent,
    GoalsComponent,
    MindmapComponent,
    SpotlightDirective,
    MmCanvasComponent,
    MmControlsComponent,
    MmControlsSideComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [


  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
