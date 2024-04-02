import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {TranslateService} from '@ngx-translate/core';
import { ViewsProvider } from '../../../../../../../../modules/search/views/providers/views.provider';
import { CheckBoxFormatter } from '../../../../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter';
export class UserManagerUsersViewsProvider extends ViewsProvider
{
    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector,
                @Inject(TranslateService) public translate: TranslateService) {
        super(compFactoryResolver, appRef, injector);
    }

    /**
     * @inheritDoc
     * @returns {Array}
     */
    getCustomColumns() {
        let columns = [];

        columns.push({
            id: 1,
            name: 'Username',
            field: 'USER_ID',
            // width: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        columns.push({
            id: 2,
            name: 'Forename',
            field: 'FORENAME',
            // width: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        columns.push({
            id: 3,
            name: 'Surname',
            field: 'SURNAME',
            // width: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        columns.push({
            id: 4,
            name: 'Department',
            field: 'DEPT_NAME',
            // width: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        columns.push({
            id: 5,
            name: 'Settings Group',
            field: 'SETTINGS_GROUP_NAME',
            // width: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        columns.push({
            id: 6,
            name: 'Disabled',
            field: 'DISABLED',
            // width: 62,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
            formatter: CheckBoxFormatter,
            isCustom: true,
            __deps: {
                injector: this.injector,
            }
        });

        columns.push({
            id: 7,
            name: 'Pass-Thru',
            field: 'FLGS',
            // width: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
            formatter: CheckBoxFormatter,
            isCustom: true,
            __deps: {
                injector: this.injector,
                data: {
                    bitmask: true,
                    bitIndex: 0
                }
            }
        });

        columns.push({
            id: 8,
            name: 'Oracle Status',
            field: 'STATUS',
            // width: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        columns.push({
            id: 9,
            name: 'Phone',
            field: 'PHONE',
            // width: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        columns.push({
            id: 10,
            name: 'E-mail',
            field: 'PC_ID',
            // width: 100,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        return columns;
    }
}
