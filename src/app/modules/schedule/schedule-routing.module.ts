import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ScheduleEditComponent} from './schedule-edit/schedule-edit.component';
import {ScheduleNewComponent} from './schedule-new/schedule-new.component';



const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'view'},
  {path: 'edit', component: ScheduleEditComponent},
  {path: 'edit/new', component: ScheduleNewComponent},
  {path: 'edit/:year/:month', component: ScheduleEditComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule {
}
