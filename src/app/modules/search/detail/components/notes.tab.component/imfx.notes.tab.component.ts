import {Component, ViewEncapsulation, Input, Injectable, Inject, Output, EventEmitter} from '@angular/core'
import {FormControl} from '@angular/forms';
import {Subject} from "rxjs";
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'imfx-notes-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
@Injectable()
export class IMFXNotesTabComponent {
    @Output() onDataChanged: EventEmitter<string> = new EventEmitter();
    @Input() onRefresh: Subject<any> = new Subject();
    @Input() file;
    @Input() readOnly:boolean = false;
    config: any = {};
    private destroyed$: Subject<any> = new Subject();

    constructor() {
        this.onRefresh.pipe(takeUntil(this.destroyed$)).subscribe(data => {
            this.refresh(data.fileNotes, data.readOnly);
        });
    }
    ngOnInit() {}
    ngAfterViewInit() {
        if (this.file) {
            this.config.fileNotes = (this.file.DESCRIPTION || this.file.NOTES || this.file.TSK_NOTES);
            this.config.readOnly = this.readOnly;
        } else {
            this.config.fileNotes = this.config.fileNotes || this.config.file && (this.config.file.DESCRIPTION || this.config.file.NOTES);
        }
    }
    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
    refresh(fileNotes, readOnly: boolean = null) {
        if (readOnly != null) {
            this.config.readOnly = readOnly;
        };
        this.config.fileNotes = fileNotes;
    }
    save() {
        return this.config.fileNotes;
    }
    onChangeNotes() {
        this.onDataChanged.emit(this.config.fileNotes);
    }

    setValue(val:string){
        this.config.fileNotes = val;
    }
}
