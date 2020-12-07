import {Component, OnInit} from '@angular/core';
import {SnackService} from '../services/snack.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  constructor(private snackService: SnackService) {
  }

  ngOnInit(): void {
  }

  testSnack(): void {
    this.snackService.successSnack('test',  2000);
  }

}
