import {
    Component, ViewEncapsulation, Injectable, Inject, ChangeDetectorRef, ViewChild,
    EventEmitter, ComponentFactoryResolver, ApplicationRef, Injector, Input
} from '@angular/core';
import { DetailService } from '../../../../../modules/search/detail/services/detail.service';
import {SlickGridComponent} from "../../../slick-grid/slick-grid";
import {
  SlickGridConfig, SlickGridConfigModuleSetups,
  SlickGridConfigOptions
} from "../../../slick-grid/slick-grid.config";
import {SlickGridProvider} from "../../../slick-grid/providers/slick.grid.provider";
import {SlickGridService} from "../../../slick-grid/services/slick.grid.service";
import {MediaDetailAttachmentsResponse} from "../../../../../models/media/detail/attachments/media.detail.detail.attachments.response";
import {SearchFormProvider} from "../../../form/providers/search.form.provider";
import {AttachmentsSlickGridProvider} from "./providers/attachments.slick.grid.provider";
import {SlickGridColumn} from "../../../slick-grid/types";
import {AttachmentsViewsProvider} from "./providers/attachments.views.provider";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'imfx-attachments-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
      SlickGridProvider,
      {provide: SlickGridProvider, useClass: AttachmentsSlickGridProvider},
      SlickGridService,
      SearchFormProvider,
      AttachmentsViewsProvider
    ]
})
@Injectable()
export class IMFXAttachmentsComponent {
    @Input('data') data;
    config: any;
    compIsLoaded = false;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
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
          isThumbnails: false
        }
      })
    });
    private columns: Array<SlickGridColumn>;
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private detailService: DetailService,
                public injector: Injector) {
    }
    ngAfterViewInit() {
        if (this.config.elem && !this.config.elem._config._isHidden) {
            this.selectAttachments();
        }
    }
    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
    selectAttachments() {
        if(!this.slickGridComp || !this.slickGridComp.provider) {
            return;
        }
        let dType = null;
        switch (this.config.typeDetailsLocal) {
            case 'version_details':
              dType = this.config.file['ITEM_TYPE'];
              break;
            case 'media_details':
              dType = '4000';
              break;
            case 'carrier_details':
              dType = '4001';
              break;
            default:
                console.log('ERROR: unknown detail type.');
        }
        this.compIsLoaded = true;
        this.slickGridComp.provider.setDefaultColumns(this.fillColumns(), this.columns.map(function(el){return el.field;}), true);
        this.detailService.getDetailAttachments(dType, this.config.file['ID'])
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: Array<MediaDetailAttachmentsResponse>) => {
              let idx = 0;
              res.forEach(el => {
                el.$id = idx++;
              });
              (<AttachmentsSlickGridProvider>this.slickGridComp.provider).buildPageByResponseData(res);
              this.cdr.detectChanges();
            });

    };
    public loadComponentData() {
        if (!this.compIsLoaded) {
           this.selectAttachments();
        }
    }
    private fillColumns() {
      this.columns = [];
      this.columns = this.injector.get(AttachmentsViewsProvider).getCustomColumns();
      return this.columns;
    }
}
