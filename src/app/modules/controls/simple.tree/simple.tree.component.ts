import {
  Component, ViewChild, Input, Output, EventEmitter, ViewEncapsulation,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

@Component({
  selector: 'imfx-simple-tree',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None
})

export class IMFXSimpleTreeComponent {
    @ViewChild('control', {static: false}) private control;
    @Input() groups;
    @Input() returnObject = false;
    @Input() freeze = false;
    @Output() selected: EventEmitter<any> = new EventEmitter();

    public datetimeFullFormatLocaldatePipe: string = "DD/MM/YYYY HH:mm";

    constructor(private cdr: ChangeDetectorRef) {
    }

    public onSelect(items, id, curItem) {
        if(this.freeze)
            return;
        for (let i = 0; i < this.groups.length; i++) {
            for (let j = 0; j < this.groups[i].Children.length; j++) {
                this.groups[i].Children[j].selected = false;
            }
        }

        if(this.returnObject) {
            this.selected.emit(curItem);
        }
        else {
        this.selected.emit('' + id);
        }
        curItem.selected = true;
    }

    public updateData() {
        this.cdr.detectChanges();
    }
}
