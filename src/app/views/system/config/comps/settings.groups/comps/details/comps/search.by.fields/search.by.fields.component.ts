/**
 * Created by dvvla on 28.09.2017.
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { Select2ItemType } from "../../../../../../../../../modules/controls/select2/types";

@Component({
    selector: 'settings-groups-detail-search-by-fields',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        //SettingsGroupsService
    ]
})

export class SettingsGroupsDetailsSearchByFieldsComponent implements OnInit {
    @Input('searchFields') private searchFields: any;
    @Input('selectedSearchByFields') private selectedSearchByFields: number;

    @Input('defaultSearchColumnsMedia') private defaultSearchColumnsMedia: any;
    @Input('defaultSearchColumnsVersion') private defaultSearchColumnsVersion: any;
    @Input('defaultSearchColumnsSimple') private defaultSearchColumnsSimple: any;
    @Input('defaultSearchColumnsTitle') private defaultSearchColumnsTitle: any;
    @Input('defaultSearchColumnsMediaPortal') private defaultSearchColumnsMediaPortal: any;
    @Input('defaultSearchColumnsVideoBrowser') private defaultSearchColumnsVideoBrowser: any;

    @Input('columnsMedia') private columnsMedia: Select2ItemType[];
    @Input('columnsVersion') private columnsVersion: Select2ItemType[];
    @Input('columnsSimple') private columnsSimple: Select2ItemType[];
    @Input('columnsTitle') private columnsTitle: Select2ItemType[];
    @Input('columnsMediaPortal') private columnsMediaPortal: Select2ItemType[];
    @Input('columnsVideoBrowser') private columnsVideoBrowser: Select2ItemType[];

    @Output('changeFields') private changeFields: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
        console.log('columnsTitle', this.columnsTitle);

    }

    changeSearchFields() {
        this.changeFields.emit();
    }

    checkState(id, type) {
        switch (type) {
            case 1:
                return this.defaultSearchColumnsMedia ? this.defaultSearchColumnsMedia.filter(x => x == id).length > 0 : false;
                break;
            case 2:
                return this.defaultSearchColumnsVersion ? this.defaultSearchColumnsVersion.filter(x => x == id).length > 0 : false;
                break;
            case 3:
                return this.defaultSearchColumnsSimple ? this.defaultSearchColumnsSimple.filter(x => x == id).length > 0 : false;
                break;
            case 4:
                return this.defaultSearchColumnsTitle ? this.defaultSearchColumnsTitle.filter(x => x == id).length > 0 : false;
                break;
            case 5: // columnsMediaPortal
                return this.defaultSearchColumnsMediaPortal ? this.defaultSearchColumnsMediaPortal
                    .filter(x => x == id).length > 0 : false;

                break;
            case 6:
                return this.defaultSearchColumnsVideoBrowser ? this.defaultSearchColumnsVideoBrowser
                    .filter(x => x == id).length > 0 : false;

                break;
            default:
                console.error('id not found');
                break;
        }
    }

    changeDefaultSearchFields(id, checked, type) {
        if (type == 1) {
            if (checked) {
                this.defaultSearchColumnsMedia.push(id);
            } else {
                var index = this.defaultSearchColumnsMedia.indexOf(id);
                if (index > -1) {
                    this.defaultSearchColumnsMedia.splice(index, 1);
                }
            }
        } else if (type == 2) {
            if (checked) {
                this.defaultSearchColumnsVersion.push(id);
            } else {
                var index = this.defaultSearchColumnsVersion.indexOf(id);
                if (index > -1) {
                    this.defaultSearchColumnsVersion.splice(index, 1);
                }
            }
        } else if (type == 3)  {
            if (checked) {
                this.defaultSearchColumnsSimple.push(id);
            } else {
                var index = this.defaultSearchColumnsSimple.indexOf(id);
                if (index > -1) {
                    this.defaultSearchColumnsSimple.splice(index, 1);
                }
            }
        } else if (type == 4)  {
            if (checked) {
                this.defaultSearchColumnsTitle.push(id);
            } else {
                var index = this.defaultSearchColumnsTitle.indexOf(id);
                if (index > -1) {
                    this.defaultSearchColumnsTitle.splice(index, 1);
                }
            }
        } else if (type == 5)  {
            if (checked) {
                this.defaultSearchColumnsMediaPortal.push(id);
            } else {
                var index = this.defaultSearchColumnsMediaPortal.indexOf(id);
                if (index > -1) {
                    this.defaultSearchColumnsMediaPortal.splice(index, 1);
                }
            }
        }else if (type == 6)  {
            if (checked) {
                this.defaultSearchColumnsVideoBrowser.push(id);
            } else {
                var index = this.defaultSearchColumnsVideoBrowser.indexOf(id);
                if (index > -1) {
                    this.defaultSearchColumnsVideoBrowser.splice(index, 1);
                }
            }
        }
        this.changeFields.emit({
            defaultSearchColumnsMedia: this.defaultSearchColumnsMedia,
            defaultSearchColumnsVersion: this.defaultSearchColumnsVersion,
            defaultSearchColumnsSimple: this.defaultSearchColumnsSimple,
            defaultSearchColumnsTitle: this.defaultSearchColumnsTitle,
            defaultSearchColumnsMediaPortal: this.defaultSearchColumnsMediaPortal,
            defaultSearchColumnsVideoBrowser: this.defaultSearchColumnsVideoBrowser,
        });
    }
}
