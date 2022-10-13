import { Component, OnInit, OnDestroy } from '@angular/core';

import { currentOptions } from '../landing/landing-options';

import { Router, Event, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit, OnDestroy {

  currentOptions = currentOptions;
  currentOpt: string;
  activNotif;

  constructor(private router: Router) { 

    this.currentOpt = this.router.url.split('/')[2];

    this.activNotif = this.router.events.subscribe((ev: Event) => {

      if (ev instanceof NavigationEnd) {

        this.currentOpt = ev.url.split('/')[2];
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {

    this.activNotif.unsubscribe();
  }
}
