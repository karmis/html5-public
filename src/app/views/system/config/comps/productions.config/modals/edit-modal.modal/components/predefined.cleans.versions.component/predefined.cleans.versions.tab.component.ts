import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injectable,
    Injector,
    ViewChild,
    ViewEncapsulation,
    Input, Output, EventEmitter
} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {IMFXModalComponent} from "../../../../../../../../../modules/imfx-modal/imfx-modal";
import {lazyModules} from "../../../../../../../../../app.routes";
import {IMFXModalAlertComponent} from "../../../../../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalEvent} from "../../../../../../../../../modules/imfx-modal/types";
import {Select2EventType} from "../../../../../../../../../modules/controls/select2/imfx.select2";
import {IMFXModalProvider} from "../../../../../../../../../modules/imfx-modal/proivders/provider";

@Component({
    selector: 'production-predefined-cleans-versions',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
    ],
    entryComponents: []
})
@Injectable()
export class ProductionPredefinedCleansVersionsTabComponent {
    templateMode;
    @Input('templateMode') set setTemplateMode(val) {
        this.templateMode = val;
        if(this.data)
            this.prepareExpandedStates();
    };
    protected data: any = null;
    @Input('data') set setData(data) {
        this.data = data;
        if (!this.data['DEFAULT_VERSIONS'] || !Array.isArray(this.data['DEFAULT_VERSIONS'])) {
            this.data['DEFAULT_VERSIONS'] = [];
        }
        this.prepareExpandedStates();
    }
    @Output('updateData') updateData: EventEmitter<any> = new EventEmitter<any>();
    @Output('isDataValid') isDataValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    protected selectedItem = null;
    protected selectedCleanItemIndex = null;
    protected expandedStates = [];
    private destroyed$: Subject<any> = new Subject();

    constructor(
        protected cdr: ChangeDetectorRef,
        protected modalProvider: IMFXModalProvider,
        protected injector: Injector
    ) {
    }

    ngOnInit() {

    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    //for clean-versions
    prepareExpandedStates() {
        if (this.templateMode !== 0) {
            return;
        }

        this.expandedStates = [];
        this.data['DEFAULT_VERSIONS'].forEach((el, i) => {
            this.expandedStates.push({
                isOpened: true
            });
        });
    }

    onChange($event, field) {
        this.updateData.emit({value: this.data[field], field});
    }

    addClean() {
        const arr = this.data['DEFAULT_VERSIONS'];
        this.addItem(arr);
    }

    addVersion(){
        if (this.selectedCleanItemIndex == null) {
            return;
        }

        const arr = this.data['DEFAULT_VERSIONS'][this.selectedCleanItemIndex].Children;
        this.addItem(arr);
    }

    private addItem(arr) {
        arr.push({
            DURATION: 10,
            NAME: '',
            Children: []
        });
        this.onChange(null, 'DEFAULT_VERSIONS');
        this.prepareExpandedStates();
    }

    setSelectedItem(item = null, index = null) {
        this.selectedItem = item;
        this.selectedCleanItemIndex = index;
    }

    validate() {
        let isValid = true;
        this.isDataValid.emit(isValid);
    }
    // delete row
    deleteRow($event, i, j) {
    //         // $event.stopPropagation();
    //         this.showModal();
    // }
    //
    // showModal() {

        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
                size: 'md',
                title: 'modal.titles.confirm',
                position: 'center',
                footer: 'cancel|ok'
            });
        modal.load().then(cr => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                'production.modal_remove_conformation',
                {}
            );

            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                modal.showOverlay(true, true);
                if (e.name === 'ok') {
                    if (j !== null) {
                        this.data['DEFAULT_VERSIONS'][i].Children.splice(j,1);
                        // this.expandedStates.splice(i,1);
                    } else {
                        this.data['DEFAULT_VERSIONS'].splice(i,1);
                    }
                    this.onChange(null, 'DEFAULT_VERSIONS');
                    this.setSelectedItem();
                    modal.hide();
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }
}
