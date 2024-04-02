import {ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector} from "@angular/core";
import {ViewsProvider} from "../../../../../modules/search/views/providers/views.provider";
import {SlickGridComponent} from "../../../../../modules/search/slick-grid/slick-grid";
import {WorkflowDecisionComponent} from "../comp";
import {IconsFormatter} from "../../../../../modules/search/slick-grid/formatters/icons/icons.formatter";
import {ThumbnailFormatter} from "../../../../../modules/search/slick-grid/formatters/thumbnail/thumbnail.formatter";
import {BasketFormatter} from "../../../../../modules/search/slick-grid/formatters/basket/basket.formatter";
import {SettingsFormatter} from "../../../../../modules/search/slick-grid/formatters/settings/settings.formatter";
import {Select2Formatter} from "../../../../../modules/search/slick-grid/formatters/select2/select2.formatter";
import {SlickGridColumn, SlickGridFormatterData} from "../../../../../modules/search/slick-grid/types";
import {SlickGridProvider} from "../../../../../modules/search/slick-grid/providers/slick.grid.provider";

@Injectable()
export class WorkflowDecisionMediaViewsProvider extends ViewsProvider {
    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }
    public getSlickGridComp(): SlickGridComponent {
        return this.getComponent().slickGridComp;
    }

    public getComponent(): WorkflowDecisionComponent {
        return (<WorkflowDecisionComponent>this.config.componentContext);
    }

    /**
     * @inheritDoc
     * @returns {Array}
     */
    getCustomColumns() {
        const columns = [];
        columns.unshift({
            id: -9,
            name: 'Decision',
            field: 'Decision',
            minWidth: 200,
            resizable: false,
            sortable: true,
            multiColumnSort: false,
            formatter: Select2Formatter,
            __deps: {
                injector: this.injector,
                data: {
                    value: (params: SlickGridFormatterData, column: SlickGridColumn, provider: SlickGridProvider) => {
                        return params.data[column.name];
                    },
                    allowClear: true,
                    values: this.getComponent().decisionsData.Options,
                    rule: {
                        key: 'Index',
                        text: 'OptionName'
                    },
                    validationEnabled: this.getComponent().isMandatoryDecision,
                    isReadonly: this.getComponent().readonly

                }
            }
        });


        return columns;
    }
}
