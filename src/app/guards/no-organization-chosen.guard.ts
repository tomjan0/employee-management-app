import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
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
    return this.dataService.organizationData !== undefined ? true : this.router.parseUrl('/no-organization-chosen');
  }

}
