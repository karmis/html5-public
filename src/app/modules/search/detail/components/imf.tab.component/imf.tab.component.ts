import {
  ChangeDetectorRef, Component, EventEmitter, Inject, Injectable, Injector, ViewChild,
  ViewEncapsulation
} from "@angular/core";
import {SlickGridComponent} from "../../../slick-grid/slick-grid";
import {
  SlickGridConfig, SlickGridConfigModuleSetups,
  SlickGridConfigOptions, SlickGridConfigPluginSetups
} from "../../../slick-grid/slick-grid.config";
import {SlickGridProvider} from "../../../slick-grid/providers/slick.grid.provider";
import {SlickGridService} from "../../../slick-grid/services/slick.grid.service";
import {SearchFormProvider} from "../../../form/providers/search.form.provider";
import {DetailService} from "../../services/detail.service";
import {IMFViewsProvider} from "./providers/views.provider";
import {IMFSlickGridProvider} from "./providers/imf.slick.grid.provider";
// import {ModalConfig} from "../../../../modal/modal.config";
import {XMLModalComponent} from "./comps/xml.modal/xml.modal";
// import {IMFXModalEvent} from "../../../../imfx-modal/types";
import {IMFXModalProvider} from "../../../../imfx-modal/proivders/provider";
import {appRouter} from "../../../../../constants/appRouter";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {lazyModules} from "../../../../../app.routes";

@Component({
    selector: 'imfx-imf-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
      SlickGridProvider,
      {provide: SlickGridProvider, useClass: IMFSlickGridProvider},
      SearchFormProvider,
      SlickGridService,
      IMFViewsProvider,
      DetailService,
      IMFXModalProvider
    ]
})
@Injectable()
export class IMFTabComponent {
    config: any;
    public compIsLoaded = false;
    public modal;
    @ViewChild('slickGridComp', {static: false}) slickGrid: SlickGridComponent;
    private searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
      componentContext: this,
      providerType: SlickGridProvider,
      serviceType: SlickGridService,
      options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
        module: <SlickGridConfigModuleSetups>{
          viewMode: 'table',
          onIsThumbnails: new EventEmitter<boolean>(),
          onSelectedView: new EventEmitter<any>(),
          isThumbnails: false
        },
        plugin: <SlickGridConfigPluginSetups>{
          rowHeight: 30,
          forceFitColumns: true
        }
      })
    });
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private modalProvider: IMFXModalProvider,
              @Inject(Injector) public injector: Injector) {
    }
    ngAfterViewInit() {
      this.loadIMF();
    }
    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    public loadComponentData() {
    };

    loadIMF() {
      let detailService = this.injector.get(DetailService);
      detailService.getIMFPackage(this.config.file.ID).pipe(
          takeUntil(this.destroyed$)
      ).subscribe( res => {
        let globalColsView = this.injector.get(IMFViewsProvider).getCustomColumns();
        globalColsView[0].__deps.data = <any>{
          provider: this
        };
        this.slickGrid.provider.setGlobalColumns(globalColsView);
        this.slickGrid.provider.setDefaultColumns(globalColsView, [], true);
        this.slickGrid.provider.buildPageByData({Data: res || []});
        this.compIsLoaded = true;
      });
    };

    showModal(mediaId) {
        this.modal = this.modalProvider.showByPath(lazyModules.xml_modal,
            XMLModalComponent,
            {
                size: 'lg',
                title: 'version_details.imfPackageModalTitle',
                position: 'center',
            },
            {
                mediaId: mediaId
            });
        this.modal.load();
    }
}
