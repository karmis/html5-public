import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from "@angular/core";


declare var window: any;
@Component({
  selector: 'imfx-not-available',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})

export class IMFXNotAvailableComponent {
    @Input('message') private message = 'common.not_available';
    @Input('messageParams') private messageParams = {};
    @Input('config') private config: any = {};

    constructor() {}
}
