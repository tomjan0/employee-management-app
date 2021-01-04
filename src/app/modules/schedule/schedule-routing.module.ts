import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ScheduleEditComponent} from './schedule-edit/schedule-edit.component';
import {ScheduleNewComponent} from './schedule-new/schedule-new.component';
import {ScheduleChooseComponent} from './schedule-choose/schedule-choose.component';
import {ScheduleViewComponent} from './schedule-view/schedule-view.component';
import {NoOrganizationChosenGuard} from '../../guards/no-organization-chosen.guard';
import {OwnerOrManagerGuard} from '../../guards/owner-or-manager.guard';
import {ScheduleSettingsComponent} from './schedule-settings/schedule-settings.component';
import {ScheduleStatsComponent} from './schedule-stats/schedule-stats.component';


const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'view', canActivate: [NoOrganizationChosenGuard]},
  {path: 'edit', component: ScheduleChooseComponent, canActivate: [NoOrganizationChosenGuard, OwnerOrManagerGuard]},
  {path: 'edit/new', component: ScheduleNewComponent, canActivate: [NoOrganizationChosenGuard, OwnerOrManagerGuard]},
  {path: 'edit/:year/:month', component: ScheduleEditComponent, canActivate: [NoOrganizationChosenGuard, OwnerOrManagerGuard]},
  {path: 'view', component: ScheduleChooseComponent, canActivate: [NoOrganizationChosenGuard]},
  {path: 'view/:year/:month', component: ScheduleViewComponent, canActivate: [NoOrganizationChosenGuard]},
  {path: 'settings', component: ScheduleSettingsComponent, canActivate: [NoOrganizationChosenGuard, OwnerOrManagerGuard]},
  {path: 'stats', component: ScheduleStatsComponent, canActivate: [NoOrganizationChosenGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule {
}
