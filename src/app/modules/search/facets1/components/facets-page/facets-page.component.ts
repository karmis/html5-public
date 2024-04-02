import { AfterViewInit, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { defaultConfig } from '../../models/facets.config';
import { FacetsService } from '../../facets.service';
import { FacetsStore } from '../../store/facets.store';

@Component({
    selector: 'facets-page',
    templateUrl: './facets-page.component.html',
    styleUrls: ['./facets-page.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FacetsPageComponent implements OnInit, AfterViewInit {

    // TODO lekaving: flag for component init
    private isReady = false;
    private config = defaultConfig;

    facetsService: FacetsService;
    facetsStore: FacetsStore;
    facets$;
    toggle$;
    info$;

    @Input('config') set setConfig(config) {
        // TODO lekaving: mb add deep merge config
        this.config = config;
    }

    constructor() {
    }

    toggleAll() {
        this.facetsStore.toggleAll();
    }

    clear() {
        this.facetsStore.newSearch(true);
        this.facetsStore.clearFacets();
        this.facetsStore.buildSearchModel([]);
    }

    ngOnInit() {
        this.facetsStore = this.config.store;
        this.facetsStore.type = this.config.type;
        this.facetsService = this.config.service;
        this.facetsService.facetStore = this.config.store;
        // TODO lekaving: it's dirty hack
        this.facetsStore.searchForm = this.config.searchForm;
        // TODO lekaving: it's dirty hack
        this.facetsService.parentContext = this.config.parentContext;
        this.facetsService.gridProvider = this.config.gridProvider;
        this.facetsService.moduleContext = this;

        this.facetsService.init();

        this.facets$ = this.facetsStore.facets$;
        this.toggle$ = this.facetsStore.toggle$;
        this.info$ = this.facetsStore.info$;
    }

    ngAfterViewInit(): void {
        this.isReady = true;
    }

}
