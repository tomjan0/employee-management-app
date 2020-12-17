import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {DataService} from '../core/services/data.service';

@Injectable({
  providedIn: 'root'
})
export class NoOrganizationChosenGuard implements CanActivate {

  constructor(private dataService: DataService, private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.waitForData();
  }

  async waitForData(): Promise<true | UrlTree> {
    await this.dataService.dataReady.toPromise();
    return this.dataService.organizationData !== undefined ? true : this.router.parseUrl('/no-organization-chosen');
  }

}
