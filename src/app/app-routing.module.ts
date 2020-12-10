import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {canActivate, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import {NoOrganizationChosenComponent} from './core/views/no-organization-chosen/no-organization-chosen.component';
import {NoOrganizationChosenGuard} from './guards/no-organization-chosen.guard';

const redirectUnauthorizedToAuth = () => redirectUnauthorizedTo('/auth');

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/authentication/authentication.module').then(m => m.AuthenticationModule)
    // children: [
    //   {path: '', pathMatch: 'full', redirectTo: 'sign-in'},
    //   {path: 'sign-in', component: SignInComponent, ...canActivate(redirectLoggedInToHome)},
    //   {path: 'sign-up', component: SignUpComponent, ...canActivate(redirectLoggedInToHome)},
    //   {path: 'reset-password', component: ResetPasswordComponent, ...canActivate(redirectLoggedInToHome)},
    //   {path: 'actions-manager', component: ActionsManagerComponent}]
  },
  {
    path: 'availability',
    loadChildren: () => import('./modules/availability/availability.module').then(m => m.AvailabilityModule),
    canActivate: [NoOrganizationChosenGuard, ...canActivate(redirectUnauthorizedToAuth).canActivate],
    data: canActivate(redirectUnauthorizedToAuth).data
    // children: [
    //   {path: '', pathMatch: 'full', redirectTo: 'show'},
    //   {path: 'view', component: AvailabilityViewComponent},
    //   {path: 'edit', component: AvailabilityEditComponent}
    // ]
  },
  {
    path: 'organization',
    loadChildren: () => import('./modules/organization/organization.module').then(m => m.OrganizationModule),
    ...canActivate(redirectUnauthorizedToAuth)
    // children: [
    //   {path: '', pathMatch: 'full', redirectTo: 'join'},
    //   {path: 'join', component: JoinOrganizationComponent}
    // ]
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
