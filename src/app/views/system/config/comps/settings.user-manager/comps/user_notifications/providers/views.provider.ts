import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {TranslateService} from '@ngx-translate/core';
import {ViewsProvider} from '../../../../../../../../modules/search/views/providers/views.provider';

export class UserNotificationsViewsProvider extends ViewsProvider {
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
            id: '4',
            name: this.translate.instant('user_management.notifications.table.contacts'),
            field: 'SUBS_INFO',
            width: 200,
            resizable: true,
            sortable: true,
            headerCssClass: "users-notifications-header",
            multiColumnSort: false
        });


        return columns;
    }
}
