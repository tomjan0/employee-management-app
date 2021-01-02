import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ScheduleEditComponent} from './schedule-edit/schedule-edit.component';
import {ScheduleNewComponent} from './schedule-new/schedule-new.component';
import {ScheduleChooseComponent} from './schedule-choose/schedule-choose.component';
import {ScheduleViewComponent} from './schedule-view/schedule-view.component';



const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'view'},
  {path: 'edit', component: ScheduleChooseComponent},
  {path: 'edit/new', component: ScheduleNewComponent},
  {path: 'edit/:year/:month', component: ScheduleEditComponent},
  {path: 'view', component: ScheduleChooseComponent},
  {path: 'view/:year/:month', component: ScheduleViewComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule {
}
