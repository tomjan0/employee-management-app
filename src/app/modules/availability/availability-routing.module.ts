import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AvailabilityViewComponent} from './availability-view/availability-view.component';
import {AvailabilityEditComponent} from './availability-edit/availability-edit.component';


const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'show'},
  {path: 'view', component: AvailabilityViewComponent},
  {path: 'edit', component: AvailabilityEditComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AvailabilityRoutingModule {
}
