import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnDestroy,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { AdvancedSearch } from "../../../../services/viewsearch/advanced.search.service";

import { QueueSearchParams } from "../../model/queue.search.params";
import { ServerStorageService } from '../../../../services/storage/server.storage.service';
import { PREFERENCES } from '../../../system/config/comps/settings.groups/comps/details/preferences.const';

@Component({
    selector: 'queue-params-component',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    providers: [
        AdvancedSearch
    ],
    encapsulation: ViewEncapsulation.None
})
export class QueueParamsComponent implements OnDestroy {
    @Output() onSelectParam: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('listParams', {static: false}) private listParams: any;
    @ViewChild('overlay', {static: false}) private overlay: any;
    private response: any = [];
    private showCompleted: boolean = false;
    private showError: boolean = false;
    private selectAll: boolean = false;
    private error: boolean = false;
    private services: any = [];
    private filtredRes: any[] = [];
    private _isReady = false;
    private storeKey = PREFERENCES.workflowQueuesActions;

    public get isReady() {
        return this._isReady;
    }

    constructor(private advancedSearch: AdvancedSearch,
                private serverStorageService: ServerStorageService,
                private cdr: ChangeDetectorRef
    ) {

    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.getQueueParams();
        this._isReady = true;
    }
    
    ngOnDestroy() {
        console.log('DESTROY');
        // this.saveSelectedItems();
    }

    getQueueParams() {
        this.overlay.show(this.listParams.nativeElement);
        setTimeout(() => {
            this.advancedSearch.getQueueManagerServices().subscribe((res: any) => {
                for (var i in res) {
                    this.services.push({
                        id: res[i].ID,
                        title: res[i].Name
                    });
                }

                this.filtredRes = Object.assign([], this.services);
                this.serverStorageService.retrieve([this.storeKey]).subscribe(saveIds => {
                    if (saveIds[0] && saveIds[0].Value && saveIds[0].Value.length) {
                        this.setCheckboxes(JSON.parse(saveIds[0].Value));
                        this.filtredRes = Object.assign([], this.services);
                        this.emitSelection(false);
                    }
                });
                this.cdr.detectChanges();
                this.overlay.hide(this.listParams.nativeElement);
            });
        });
    }

    isError($event) {
        if ($event) {
            this.error = true;
        }
    }

    clickRepeat() {
        let self = this;
        this.overlay.show(this.listParams.nativeElement);
        setTimeout(() => {
            self.getQueueParams();
        }, 2000);
    }

    setCompleted(value: boolean[]) {
        if (this.showCompleted != value[0]) {
            this.showCompleted = value[0];
        }
        if (this.showError != value[1]) {
            this.showError = value[1];
        }
    }

    setCreatedDateOffset(value: null) {
        if (this.showCompleted != value) {
            this.showCompleted = value;
            this.emitSelection(false);
        }
    }

    onToggleCompleted() {
        this.showCompleted = !this.showCompleted;
        this.emitSelection(false);
    }

    onToggleError() {
        this.showError = !this.showError;
        this.emitSelection(false);
    }

    onToggleSelectAll(val: boolean = null, silent = false) {
        this.selectAll = val != null ? val : !this.selectAll;
        for (var s of this.services) {
            s.selected = this.selectAll;
        }
        if (!silent) {
            this.emitSelection(false);
        }
    }

    deselectAll(silent) {
        this.onToggleSelectAll(false, silent);
    }

    setCheckboxes(values: string[]) {
        this.deselectAll(false);
        let countSelected = 0;
        this.services.forEach((item, k) => {
            if (values.indexOf(item.id) > -1) {
                countSelected++;
                this.services[k].selected = true;
            }
        });
        this.selectAll = countSelected == this.services.length ? true : false;
    }

    emitSelection(saveServer = true) {
        this.onSelectParam.emit({
            queueParams: this.getParams()
        });
        this.selectAll = this.services.every((el) => {
            return el.selected == true;
        });
        if (saveServer)
            this.saveSelectedItems();
    }

    saveSelectedItems() {
        const saveIds = this.filtredRes.filter(el => el.selected).map(el => el.id);
        this.serverStorageService.store(this.storeKey, saveIds, 'local').subscribe();
    }

    getParams(): QueueSearchParams {
        return {
            showCompleted: this.showCompleted,
            showError: this.showError,
            selectAll: this.selectAll,
            services: this.services.filter(el => el.selected)
        };
    }

    public filter($event) {
        let str = $event.target.value;
        if (str) {
            str = str.toLocaleLowerCase();
        }
        this.cdr.detach();
        this.filtredRes = [];
        $.each(this.services, (k, item) => {
            if (!item.title) {
                return true;
            }
            let title = item.title.toLowerCase();
            if (title.length === str.length && title.indexOf(str) > -1) {
                this.filtredRes.unshift(item);
            } else if (title.indexOf(str) > -1) {
                this.filtredRes.push(item);
            }
        });
        this.cdr.reattach();
    }
}
