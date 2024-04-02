/**
 * Created by Sergey Trizna on 15.03.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Injector,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { SearchRecentConfig } from './search.recent.config';
import { RecentModel } from './models/recent';
import { SearchRecentProvider } from './providers/search.recent.provider';
import { SearchRecentService, SearchRecentServiceInterface } from './services/search.recent.service';
import * as $ from 'jquery';
import { ArrayProvider } from '../../../providers/common/array.provider';
import { SearchAdvancedProvider } from '../advanced/providers/search.advanced.provider';
import { SearchRecentProviderInterface } from './providers/search.recent.provider.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseSearchUtil } from '../utils/utils';

@Component({
    selector: 'search-recent',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    host: {'style': 'height:100%;'},
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SearchRecentProvider,
        SearchRecentService,
        SearchAdvancedProvider,
        ArrayProvider
    ]
})
export class SearchRecentComponent extends BaseSearchUtil {
    public isDataLoaded: boolean = false; // then async calls have ended.
    @Input('externalMode') externalMode: boolean = false;
    @Output('onSelect') onSelect: EventEmitter<any> = new EventEmitter<any>();
    // @ViewChild('recentsList', {static: false}) private recentsList: any;
    private _recentSearches;
    private error: boolean = false;
    private destroyed$ = new Subject();
    private config = <SearchRecentConfig>{
        componentContext: <any>null,
        moduleContext: this,
        options: {
            provider: <SearchRecentProviderInterface>null,
            service: <SearchRecentServiceInterface>null,
            itemsLimit: 5
        }
    };

    @Input('config') set setConfig(config) {
        this.config = $.extend(true, this.config, config);
    }

    constructor(@Inject(SearchRecentService) protected service: SearchRecentService,
                @Inject(SearchRecentProvider) protected provider: SearchRecentProvider,
                public injector: Injector,
                private arrayProvider: ArrayProvider, // dont remove it.
                public cdr: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        // Set default provider/services if custom is null
        this.initializeData(this, 'provider');
        this.initializeData(this, 'service');
        this.passConfigToProvider(this);

        this._recentSearches = [];
        this.getRecentSearches();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    ngAfterViewInit() {
        // let self = this;
        // if (this.config.componentContext && this.config.componentContext.searchAdvancedConfig.options.provider.getStateForPanel()) {
        //     // setTimeout(() => {
        //     //     //
        //     // })
        // }
    }

    isError($event) {
        if ($event) {
            this.error = true;
        }
    }

    clickRepeat() {
        if (this.config.componentContext && this.config.componentContext.searchAdvancedConfig.options.provider.getStateForPanel()) {
            // this.overlayRecentSearches.show(this.recentsList.nativeElement);
            this.isDataLoaded = true;
            this.cdr.detectChanges();
        }
        setTimeout(() => {
            if(this.destroyed$.isStopped) {
                return;
            }
            this.getRecentSearches();
        }, 2000);
    }

    /**
     * Return array of recent searches
     */
    getRecentSearches() {
        this.provider.getRecentSearches().pipe(
            takeUntil(this.destroyed$)
        ).subscribe((resp: Array<RecentModel>) => {
            setTimeout(() => {
                if(this.destroyed$.isStopped) {
                    return;
                }
                if (resp) {
                    this.error = false;
                    if (resp.length > this.config.options.itemsLimit) {
                        console.error('Recents search: Items limit: ', this.config.options.itemsLimit, 'but returned: ', resp.length);
                    }
                    if(this.provider && resp && resp.length > 0){
                        // if(!this.externalMode){
                        //     resp = resp.reverse();
                        // }
                        this.provider.setRecentSearches(resp, this.externalMode);
                    }
                }
                this.isDataLoaded = true;
                this.cdr.detectChanges();
            });

        }, () => {
            this.isDataLoaded = true;
            this.cdr.detectChanges();
        }, () => {
            this.isDataLoaded = true;
            this.cdr.detectChanges();
        });

        if (this.config.componentContext && this.config.componentContext.searchAdvancedConfig.options.provider.getStateForPanel()) {
            this.isDataLoaded = true;
        }
    }

    /**
     * On select recent search
     * @param recentSearch
     */
    selectResentSearch(recentSearch: RecentModel): void {
        this.provider.selectRecentSearch(recentSearch);
    }

    private clearRecents() {
        this._recentSearches = [];
        // this.isDataLoaded = false;
        this.cdr.detectChanges();
        this.provider.clearRecentSearches().subscribe(() => {
            // this.isDataLoaded = true;
        });
    }
}
