import {ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'demo',
  template: `
    <div style="height: calc(100% - 80px)">
      <h1>Demo blank page</h1>
        <button (click)="Upload()">Upload</button>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.Default
})
export class DemoComponent {

    constructor(private router: Router,
                private cdr: ChangeDetectorRef) {
    }

    public Upload() {

    }


    ngOnDestroy() {

    }

}
