import { AdvancedFieldType } from '../../../../modules/search/advanced/types';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector, TemplateRef,
    ViewChild, ViewEncapsulation
} from '@angular/core';
import { MediaSlickGridProvider } from '../../../media/providers/media.slick.grid.provider';
import { IMFXModalComponent } from '../../../../modules/imfx-modal/imfx-modal';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../modules/notification/services/notification.service';
import { SlickGridService } from '../../../../modules/search/slick-grid/services/slick.grid.service';
import { IMFXControlsLookupsSelect2Component } from '../../../../modules/controls/select2/imfx.select2.lookups';
import { SlickGridProvider } from '../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { HttpService } from '../../../../services/http/http.service';
import { SlickGridRowData } from '../../../../modules/search/slick-grid/types';
import { map } from 'rxjs/operators';
import { MakeOfficer, OfficerType } from '../../constants/production.types';
import { LookupSearchUsersService } from '../../../../services/lookupsearch/users.service';
import { IMFXControlsSelect2Component, Select2EventType } from '../../../../modules/controls/select2/imfx.select2';
import { ProductionService } from '../../../../services/production/production.service';


@Component({
    selector: 'make-officer-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    providers: [
        SlickGridProvider,
        SlickGridService
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MakeOfficerModalComponent implements AfterViewInit {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('userLookupSelectEl', {static: false}) private userLookupSelectEl: IMFXControlsSelect2Component;
    isValid = false;
    private modalRef: IMFXModalComponent;
    selectedRows: SlickGridRowData[] = [];
    private mediaSlickGridProvider: MediaSlickGridProvider;
    userLookupSelect = {
        selectedId: null,
        data: [],
        readonly: false
    };

    payload: MakeOfficer = {
        OfficerId: null,
        OfficerType: null,
        ProductionIds: []
    }

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                private router: Router,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                private slickGridProvider: SlickGridProvider,
                private httpService: HttpService,
                private notificationService: NotificationService,
                private lookupSearchUsersService: LookupSearchUsersService,
                private productionService: ProductionService) {

        // modal data
        this.modalRef = this.injector.get('modalRef');
    }

    ngAfterViewInit(): void {
        this.lookupSearchUsersService.getUsers().subscribe(userLookup => {
            this.userLookupSelect.data = userLookup
                .filter(el => !(el.Surname.length === 0 && el.Forename.length === 0))
                .map((el: any) => {
                    el.id = el.Id;
                    el.text = el.Forename + ' ' + el.Surname;
                    return el;
                });
            this.userLookupSelectEl.setData(this.userLookupSelect.data);
            this.userLookupSelectEl.setSelected(this.userLookupSelect.selectedId);
            this.cdr.detectChanges();
        })
    }

    save() {
        const OfficerId = this.userLookupSelect.selectedId;
        this.payload.OfficerId = OfficerId ? Number(OfficerId) : null;
        this.modalRef.modalEvents.emit({
            name: 'ok_and_save', state: {
                payload: this.payload
            }
        });
        this.isValid = false;
    }

    loadData(rows: any[], type: OfficerType, mediaSlickGridProvider) {
        this.mediaSlickGridProvider = mediaSlickGridProvider;
        this.payload.ProductionIds = rows.map(el => el.ID);
        this.payload.OfficerType = type;
        this.isValid = true;

        if (rows.length === 1) {
            const idOfficer = type === 'Assistant' ? rows[0].ASSISTANT : type === 'Compliance' ? rows[0].COMPLIANCE : null;
            this.userLookupSelect.selectedId = idOfficer;
        } else {
            this.setType(true);
        }
    }

    closeModal() {
        this.modalRef.hide();
    }

    onChangeSelect(value) {
        if (Array.isArray(value.params.data)) {
            this.userLookupSelect.selectedId = value.params.data[0].id;
            this.setType(false);
        }
        if (value.params._type === 'unselect') {
            this.userLookupSelect.selectedId = null;
            this.setType(true);
        }

    }

    setType(isClear) {
        let ofType = null;

        switch (this.payload.OfficerType) {
            case 'Assistant':
                ofType = isClear ? 'ClearAssistant' : 'Assistant';
                break;
            case 'ClearAssistant':
                ofType = isClear ? 'ClearAssistant' : 'Assistant';
                break;
            case 'ClearCompliance':
                ofType = isClear ? 'ClearCompliance' : 'Compliance';
                break;
            case 'Compliance':
                ofType = isClear ? 'ClearCompliance' : 'Compliance';
                break;
            default:
                break;
        }
        this.payload.OfficerType = ofType;
    }

}
