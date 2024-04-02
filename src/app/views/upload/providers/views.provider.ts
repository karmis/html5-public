import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {TranslateService} from '@ngx-translate/core';
import {ProgressFormatter} from "../../../modules/search/slick-grid/formatters/progress/progress.formatter";
import {ViewsProvider} from "../../../modules/search/views/providers/views.provider";

export class UploadScreenViewsProvider extends ViewsProvider {
    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector,
                @Inject(TranslateService) public translate: TranslateService) {
        super(compFactoryResolver, appRef, injector);
    }

    getCustomColumns() {
        let columns = [];

        columns.push({
            id: 1,
            name: 'Title',
            field: 'Title',
            width: 300,
            minWidth: 300,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        columns.push({
            id: 2,
            name: 'File Name',
            field: 'Filename',
            width: 300,
            minWidth: 300,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        columns.push({
            id: 3,
            name: 'Type',
            field: 'Type',
            width: 100,
            minWidth: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        columns.push({
            id: 4,
            name: 'Size',
            field: 'Size',
            width: 100,
            minWidth: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        columns.push({
            id: 5,
            name: 'Progress',
            field: 'Progress',
            width: 150,
            minWidth: 150,
            resizable: true,
            sortable: true,
            formatter: ProgressFormatter,
            isCustom: true,
            multiColumnSort: false,
            __deps: {
                injector: this.injector,
            }
        });

        columns.push({
            id: 6,
            name: 'Status',
            field: 'Status',
            width: 100,
            minWidth: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        return columns;
    }
}
