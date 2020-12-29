import {NgModule} from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot, Routes} from '@angular/router';
import {canActivate, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import {NoOrganizationChosenComponent} from './core/views/no-organization-chosen/no-organization-chosen.component';
import {NoOrganizationChosenGuard} from './guards/no-organization-chosen.guard';

const redirectUnauthorizedToAuth = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return redirectUnauthorizedTo(`/auth?followUrl=${btoa(state.url)}`);
};

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/authentication/authentication.module').then(m => m.AuthenticationModule)
  },
  {
    path: 'availability',
    loadChildren: () => import('./modules/availability/availability.module').then(m => m.AvailabilityModule),
    canActivate: [NoOrganizationChosenGuard, ...canActivate(redirectUnauthorizedToAuth).canActivate],
    data: canActivate(redirectUnauthorizedToAuth).data
  },
  {
    path: 'organization',
    loadChildren: () => import('./modules/organization/organization.module').then(m => m.OrganizationModule),
    ...canActivate(redirectUnauthorizedToAuth)
  },
  {
    path: 'schedule',
    loadChildren: () => import('./modules/schedule/schedule.module').then(m => m.ScheduleModule),
    canActivate: [NoOrganizationChosenGuard, ...canActivate(redirectUnauthorizedToAuth).canActivate],
    data: canActivate(redirectUnauthorizedToAuth).data
  },
  {
    path: 'no-organization-chosen',
    component: NoOrganizationChosenComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
