import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {DataService} from '../services/data.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  constructor(public authService: AuthService,
              private dataService: DataService) {
  }

  ngOnInit(): void {
  }

  get isCurrentUserOwnerOrManager(): boolean {
    const role = this.dataService.currentUserMemberInfo?.role;
    return role === 'owner' || role === 'manager';
  }

}
