/**
 * Created by initr on 20.10.2016.
 */
import {
    Component,
    ViewEncapsulation, Injectable, Inject, ChangeDetectorRef, EventEmitter, ViewChild, Injector
} from '@angular/core';
import { DetailService } from '../../../../../modules/search/detail/services/detail.service';
import {
    MediaDetailHistoryResponse
} from '../../../../../models/media/detail/history/media.detail.detail.history.response';
import { SlickGridComponent } from '../../../slick-grid/slick-grid';
import {
  SlickGridConfig,
  SlickGridConfigModuleSetups,
  SlickGridConfigOptions
} from '../../../slick-grid/slick-grid.config';
import { SlickGridProvider } from '../../../slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../slick-grid/services/slick.grid.service';
import { HistorySlickGridProvider } from './providers/history.slick.grid.provider';
import { SlickGridColumn } from '../../../slick-grid/types';
import { SearchFormProvider } from '../../../form/providers/search.form.provider';
import {HistoryViewsProvider} from "./providers/history.views.provider";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'imfx-history-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: HistorySlickGridProvider},
        SlickGridService,
        SearchFormProvider,
        HistoryViewsProvider
    ]
})
@Injectable()
export class IMFXHistoryTabComponent {
    config: any;
    compIsLoaded = false;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    protected gridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                clientSorting: true,
                isThumbnails: false
            }
        })
    });

    private columns: Array<SlickGridColumn>;
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private detailService: DetailService,
                private injector: Injector) {
    }
    ngAfterViewInit() {
        if (this.config.elem && !this.config.elem._config._isHidden) {
            this.selectHistory();
        }
    }
    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
    selectHistory() {
        if(!this.slickGridComp || !this.slickGridComp.provider) {
            return;
        }
        let dType = null;
        switch (this.config.typeDetailsLocal) {
            case 'media_details':
                dType = 8;
                break;
            case 'carrier_details':
                dType = 7;
                break;
            case 'version_details':
                dType = 11;
                break;
            case 'title_details':
                dType = 10;
                break;
            default:
                console.log('ERROR: unknown detail type.');
        }
        this.compIsLoaded = true;
        this.slickGridComp.provider.setDefaultColumns(
            this.fillColumns(),
            this.columns.map(function(el) { return el.field; } ),
            true
        );
        this.detailService.getDetailHistory(dType, this.config.file['ID']).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: Array<MediaDetailHistoryResponse>) => {
                let idx = 0;
                res.forEach(el => {
                    el.$id = idx++;
                });
                (<HistorySlickGridProvider>this.slickGridComp.provider)
                    .buildPageByResponseData(res);
                this.cdr.detectChanges();
            }
        );
    };
    public loadComponentData() {
        if (!this.compIsLoaded) {
           this.selectHistory();
        }
    }
    private fillColumns() {
        this.columns = [];
        let idx = 0;
        this.columns = this.injector.get(HistoryViewsProvider).getCustomColumns();
        return this.columns;
    }
}
