import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService} from './core/services/auth.service';
import {MediaMatcher} from '@angular/cdk/layout';
import {DataService} from './core/services/data.service';
import {take} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {OrganizationDataModel} from './models/organization-data.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  mobileQuery: MediaQueryList;
  readonly title = 'employee-management-app';
  private readonly mobileQueryListener: () => any;
  ready = false;
  navOpen = true;

  @ViewChild('sidenav') sidenav!: ElementRef;

  constructor(public authService: AuthService,
              private media: MediaMatcher,
              changeDetectorRef: ChangeDetectorRef,
              public dataService: DataService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => {
      this.navOpen = !this.mobileQuery.matches;
      this.handleOpenChange(!this.mobileQuery.matches);
      return changeDetectorRef.detectChanges();
    };
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
    this.listenForAuth();
  }

  ngOnInit(): void {
    const savedOpen = this.dataService.getLocal('sidenav-opened');
    if (savedOpen) {
      this.navOpen = JSON.parse(savedOpen);
    }
  }

  ngAfterViewInit(): void {
    console.log(this.sidenav);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }

  handleOpenChange(opened: boolean): void {
    this.dataService.setLocal('sidenav-opened', JSON.stringify(opened));
  }

  logout(): void {
    this.authService.signOut();
  }

  listenForAuth(): void {
    this.authService.userObs.pipe(take(1)).subscribe(() => {
      this.ready = true;
    });
  }

  get organizations(): Observable<OrganizationDataModel | undefined>[] | undefined {
    return this.dataService.userOrganizationsObs;
  }


}
