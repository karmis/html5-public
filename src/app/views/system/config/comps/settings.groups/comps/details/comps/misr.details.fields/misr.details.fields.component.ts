/**
 * Created by IvanBanan 20.06.2019.
 */

import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnInit,
    Output,
    Input,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectionStrategy
} from '@angular/core';

@Component({
    selector: 'settings-groups-misr-details-fields',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class SettingsGroupsMisrDetailsFieldsComponent {
    @Input('searchFields') private searchFields: any;
    @Input('defaultSearchMisrDetailsMediaColumns') private defaultColumns: any;
    @Input('columnsMisrDetailsMedia') private columns: any;
    // @Input('context') private context: any;
    @Output('changedFields') private changedFields: EventEmitter<any> = new EventEmitter<any>();

    arr = ["miid1", "miid2", "miid3", "versionid1", "versionid2", "progid1", "progid2", "usage_type_text", "prgm_id_inhouse"];


    protected fields = [];

    constructor(private cdr: ChangeDetectorRef) {

    }

    ngOnInit() {
    }

    ngOnChanges(simpleChangesObj) {
        // if (simpleChangesObj.columns && !simpleChangesObj.columns.firstChange) {
        if (simpleChangesObj.columns) {
            this.fields = this.columns.filter(e => this.arr[this.arr.indexOf(e.id.toLowerCase())]);
        }
    }

    ngAfterViewInit() {

    }

    changeSearchFields() {
        this.changedFields.emit();
    }

    checkState(id) {
        return this.defaultColumns ? this.defaultColumns.filter( x => x == id).length > 0 : false;
    }

    changeDefaultSearchFields(id, checked) {

            if(checked) {
                this.defaultColumns.push(id);
            }
            else {
                var index = this.defaultColumns.indexOf(id);
                if (index > -1) {
                    this.defaultColumns.splice(index, 1);
                }
            }

        this.changedFields.emit({
            defaultSearchMisrDetailsMediaColumns: this.defaultColumns
        });
    }
}
