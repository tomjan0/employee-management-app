import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {DataService} from '../core/services/data.service';
import {SnackService} from '../core/services/snack.service';

@Injectable({
  providedIn: 'root'
})
export class OwnerOrManagerGuard implements CanActivate {

  constructor(private dataService: DataService,
              private router: Router,
              private snackService: SnackService) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.waitForData();
  }

  async waitForData(): Promise<true | UrlTree> {
    await this.dataService.waitForOrganizationData();
    const role = this.dataService.currentUserMemberInfo?.role;
    if (role === 'owner' || role === 'manager') {
      return true;
    } else {
      this.snackService.errorSnack('Odmowa dostępu');
      return this.router.parseUrl('/');
    }
  }

}
