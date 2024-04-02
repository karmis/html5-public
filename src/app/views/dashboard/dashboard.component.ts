import {
    Component,
    ViewEncapsulation,
} from '@angular/core';

@Component({
    selector: 'dashboard',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: []
})

export class DashboardComponent {
  constructor() {
  }

  ngOnInit() {
  }
}
