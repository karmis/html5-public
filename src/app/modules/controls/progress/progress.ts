import {
  Component, Input,
  ViewEncapsulation
} from '@angular/core';

@Component({
    selector: 'progress-component',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class ProgressComponent{
    @Input() private progress: string;
}

