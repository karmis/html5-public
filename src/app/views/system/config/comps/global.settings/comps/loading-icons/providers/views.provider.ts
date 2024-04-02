/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {ViewsConfig} from '../../../../../../../../modules/search/views/views.config';
import {ViewsProvider} from '../../../../../../../../modules/search/views/providers/views.provider';
import {TranslateService} from '@ngx-translate/core';
import {DeleteFormatter} from '../../../../../../../../modules/search/slick-grid/formatters/delete/delete.formatter';

export class LoadingIconsViewsProvider extends ViewsProvider {
    config: ViewsConfig;

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
        // columns.unshift({
        //
        //     id: 1,
        //     name: 'ID',// TODO: i18n
        //     field: 'ID',
        //     width: 70,
        //     resizable: true,
        //     sortable: true,
        //     multiColumnSort: false
        // });

        columns.unshift({
            id: 2,
            name: this.translate.instant('settings_group.name_column'), // TODO: i18n
            field: 'NAME',
            resizable: true,
            sortable: true,
            multiColumnSort: false

        });

        // columns.unshift({
        //     id: 3,
        //     name: this.translate.instant('settings_group.description_column'), // TODO: i18n
        //     field: 'Description',
        //     resizable: true,
        //     sortable: true,
        //     multiColumnSort: false
        // });

        columns.unshift({
            id: 4,
            name: ' ',
            field: '',
            width: 70,
            resizable: false,
            sortable: false,
            formatter: DeleteFormatter,
            multiColumnSort: false,
            isCustom: true,
            __deps: {
                injector: this.injector,
                data: {
                    withModal: true,
                    modalData: {
                        text: 'settings_group.modal_remove_conformation',
                        textParams: {groupName: 'NAME'},
                        message: 'settings_group.remove_success'
                    }
                }
            }
        });

        return columns;
    }


}
