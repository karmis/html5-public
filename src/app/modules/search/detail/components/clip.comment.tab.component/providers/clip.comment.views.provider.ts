import {ViewsProvider} from "../../../../views/providers/views.provider";
import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {TextFormatter} from "../../../../slick-grid/formatters/text/text.formatter";

export class ClipCommentViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    /**
     * @inheritDoc
     * @returns {Array}
     */
    getCustomColumns(readonly) {
        let columns = [
            {
                id: 0,
                name: 'In',
                field: 'InTc',
                minWidth: 100,
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            }, {
                id: 1,
                name: 'Out',
                field: 'OutTc',
                minWidth: 100,
                width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            }, {
                id: 2,
                name: 'Comment',
                field: 'Comment',
                minWidth: 50,
                width: 200,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: TextFormatter,
                __deps: {
                    injector: this.injector,
                    data: {
                        validationEnabled: false,
                        multiline: true,
                        readOnly: readonly
                    }
                }
            }
        ];
        // columns.unshift({
        //     id: 3,
        //     field: "*",
        //     name: " ",
        //     width: 38,
        //     sortable: false,
        //     resizable: false,
        //     formatter: DeleteFormatter,
        //     __deps: {

        //
        //
        //         injector: this.injector
        //     }
        // });

        return columns;
    }
}
