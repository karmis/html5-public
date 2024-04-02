import * as $ from "jquery";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation,
} from "@angular/core";
import {ViewsConfig} from "./views.config";
import {ViewsService} from "./services/views.service";
import {ViewsProvider} from "./providers/views.provider";
import { TranslateService } from '@ngx-translate/core';


import {NotificationService} from "../../../modules/notification/services/notification.service";
import {SlickGridProvider} from "../slick-grid/providers/slick.grid.provider";
import {IMFXModalProvider} from "../../imfx-modal/proivders/provider";
import {IMFXControlsSelect2Component} from "../../controls/select2/imfx.select2";
import {ViewsOriginalType} from "./types";
import { SlickGridComponent } from '../slick-grid/slick-grid';

// class Select
@Component({
    selector: 'search-views',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        IMFXModalProvider
    ]
})

export class SearchViewsComponent {

    @ViewChild('selectViewControl', {static: false}) dropdown: IMFXControlsSelect2Component;
    @Input('gridProviders') gridProviders: SlickGridProvider[] = null;
    /**
     * rightSidePosition
     * display dropdown to the right side
     * @type {boolean}
     */
    @Input('rightSidePosition') rightSidePosition: boolean = false;
    public provider: ViewsProvider;
    private hide: boolean;
    public config = <ViewsConfig>{
        componentContext: <any>null,
        moduleContext: this,
        options: {
            type: '',
        },
    };

    constructor(private cdr: ChangeDetectorRef,
                public service: ViewsService,
                private translate: TranslateService,
                public injector: Injector,
                @Inject(NotificationService) protected notificationRef: NotificationService) {
        this.provider = this.injector.get(ViewsProvider);
    }

    /**
     * Extend default config
     * @param config
     */
    @Input('config') set setConfig(config) {
        this.config = $.extend(true, this.config, config);
        if (config.options.provider) {
            this.provider = config.options.provider;
        }
        this.provider.config = this.config;
    }

    ngAfterViewInit() {
        // this.config.componentContext.onModuleReady.subscribe(() => {
            this.provider.ui = this.dropdown;

            let arrSgp: SlickGridProvider[] = this.getSlickGridProviders();

            if (arrSgp && arrSgp.length > 0) {
                for (let sgp of arrSgp) {
                    // searchGridProvider.onToggleViewMode.subscribe((resp) => {
                    sgp.onToggleViewMode.subscribe((resp) => {
                        if (resp == 'tile') {
                            this.hide = true;
                        } else {
                            this.hide = false;
                        }
                        this.cdr.detectChanges();
                    });
                }
            }

            if (!this.provider.originalViews) {
                this.provider.load().subscribe((originalView: ViewsOriginalType | null) => {
                    if (originalView === null) {
                        return;
                    }

                    this.provider.build(originalView.DefaultView, originalView.ViewColumns);
                    this.provider.setViewForUI(originalView.DefaultView);
                });
            } else {
                this.provider.build(this.provider.originalViews.DefaultView);
                this.provider.setViewForUI(this.provider.originalViews.DefaultView);
            }
        // });
    }

    /**
     * Callback on select view model
     */
    onSelect($event) {
        //disabling for same values
        if (!$event || $event.params.isSameAsPrevious) {
            return;
        }
        let id: number = this.dropdown.getSelected();
        this.provider.onSelect(id);
    };

    public getSlickGridProviders(): SlickGridProvider[] {
        let gridProviders = this.gridProviders || this.config.moduleContext.gridProviders || null;
        let sgc = this.config.componentContext.slickGridComp;
        let providerType = (sgc && sgc.config) ? sgc.config.providerType : SlickGridProvider;
        let sgp = (sgc && sgc.provider) ? sgc.provider : this.injector.get(providerType);

        let arrSgp: SlickGridProvider[] = (gridProviders && gridProviders.length > 0)
            ? gridProviders
            : !!sgp
                ? [sgp]
                : [];

        return arrSgp;
    }
}
