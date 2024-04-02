/**
 * Created by Sergey Trizna on 15.03.2017.
 */
import {ChangeDetectorRef, Component, EventEmitter, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import { SearchSavedProvider } from './providers/search.saved.provider';
import { SearchSavedService } from './services/search.saved.service';
import { SearchSavedConfig } from './search.saved.config';
import { IMFXControlsSelect2Component } from '../../controls/select2/imfx.select2';
import { Select2ItemType } from '../../controls/select2/types';
import { NotificationService } from '../../notification/services/notification.service';
import { SearchAdvancedProvider } from '../advanced/providers/search.advanced.provider';

@Component({
    selector: 'search-saved',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SearchSavedProvider,
        SearchSavedService,
        SearchAdvancedProvider
    ]
})
export class SearchSavedComponent {
    @ViewChild('searchSavedSelect', {static: false}) public searchSavedSelectRef: IMFXControlsSelect2Component;
    @Input('clearCache') clearCache: boolean = true;
    public listOfSavedSearches: Array<Select2ItemType> = [];
    public config = <SearchSavedConfig>{
        componentContext: <any>null,
        moduleContext: this,
        options: {}
    };

    constructor(public provider: SearchSavedProvider,
                private service: SearchSavedService,
                private notificationRef: NotificationService, // dont touch it
                private cdr: ChangeDetectorRef) { // dont touch it
    }

    @Input('config') set setConfig(config) {
        this.config = $.extend(true, this.config, config);
    }

    ngAfterViewInit() {
        !this.config.options.provider ?
            this.config.options.provider = this.provider :
            this.provider = <SearchSavedProvider>this.config.options.provider;
        !this.config.options.service ?
            this.config.options.service = this.service :
            this.service = this.config.options.service;
        this.provider.config = this.config;

        // set reference between component and SavedSearchModule (across SearchAdvancedModule)
        this.config.componentContext = this.config.moduleContext.config.componentContext;
        // dirty hack
        this.config.moduleContext = this;
        this.provider.updateList(this.config.options.type, this.clearCache).subscribe(() => {
            if(this.preselected != undefined){
                this.searchSavedSelectRef.setSelectedByIds([this.preselected]);
            }
        });
    }
    public onSelect: EventEmitter<{id: number}> =new EventEmitter<{id: number}>();

    /**
     * On select or un select saved search
     */
    private onSelectSavedSearch() {
        let selectedId: number = this.searchSavedSelectRef.getSelected();
        if (selectedId) {
            this.provider.setSavedSearch(selectedId);
            this.onSelect.emit({id: selectedId})
            // this.cdr.markForCheck();
        }
    }

    private preselected: number;
    setSelected(id: number) {
        if(this.searchSavedSelectRef && this.searchSavedSelectRef.getData().length > 0) {
            this.searchSavedSelectRef.setSelectedByIds([id]);
        } else {
            this.preselected = id;
        }

    }
}
