import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from '@angular/core';
import { ViewsConfig } from 'app/modules/search/views/views.config';
import { ViewsProvider } from 'app/modules/search/views/providers/views.provider';
import { TranslateService } from '@ngx-translate/core';
import { DeleteFormatter } from 'app/modules/search/slick-grid/formatters/delete/delete.formatter';
import { DoActionFormatter } from 'app/modules/search/slick-grid/formatters/doaction/doaction.formatter';
import { CheckBoxFormatter } from 'app/modules/search/slick-grid/formatters/checkBox/checkbox.formatter';
import { LookupFormatter } from 'app/modules/search/slick-grid/formatters/lookup/lookup.formatter';
import { ColorFormatter } from 'app/modules/search/slick-grid/formatters/color/color.formatter';
import { DatetimeFormatter } from 'app/modules/search/slick-grid/formatters/datetime/datetime.formatter';

export class CommonTablesGridViewsProvider extends ViewsProvider {
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
    getCustomColumns(sgp, res, disabledFieldMask) {
        const columns = [];
        const self = sgp.componentContext;

        if (!res.EditOnly && res.AllowDelete) {
            columns.unshift({
                id: -1,
                name: ' ',
                field: '',
                width: 35,
                resizable: false,
                sortable: false,
                formatter: DeleteFormatter,
                multiColumnSort: false,
                isCustom: true,
                headerCssClass: 'disable-reorder',
                __deps: {
                    injector: this.injector,
                    data: {
                        withModal: true,
                        modalData: {
                            text: 'global_settings.modal_remove_conformation_s',
                            textParams: {groupName: res.View.Columns.length > 0 ? res.View.Columns[0].Field : 'ID'},
                            message: 'global_settings.remove_success_s'
                        },
                        rows: res.Data,
                        component: self,
                        disabledFieldMask: {
                            ColumnName: disabledFieldMask
                        }
                    }
                }
            });
        }

        columns.unshift({
            id: -2,
            name: ' ',
            field: '',
            width: 35,
            resizable: false,
            sortable: false,
            formatter: DoActionFormatter,
            multiColumnSort: false,
            headerCssClass: 'disable-reorder',
            isCustom: true,
            __deps: {
                injector: this.injector,
                data: {
                    titleHint: 'consumer_settings.edit',
                    actionDelegate: self
                }
            }
        });

        if(!res.View.Columns.find(el => el.Field.toLowerCase() === 'id')) {
            columns.unshift({
                id: 0,
                name: 'ID',
                field: 'ID',
                width: 50,
                resizable: true,
                sortable: true,
                headerCssClass: 'disable-reorder',
                multiColumnSort: false,
            });
        }

        let id = 1;
        for (let i = 0; i < res.View.Columns.length; i++) {
            const col = res.View.Columns[i];
            let colDef;
            if ((<any>col).HideInTable) {
                continue;
            }
            if ((<any>col).DataType === 'CheckBox') {
                colDef = {
                    id: id,
                    name: (<any>col).Label,
                    field: (<any>col).Field,
                    resizable: true,
                    sortable: true,
                    formatter: CheckBoxFormatter,
                    multiColumnSort: false,
                    isCustom: true,
                    width: 60,
                    __deps: {
                        injector: this.injector
                    }
                };
            }
            else if ((<any>col).DataType === 'ComboSingle') {
                colDef = {
                    id: id,
                    name: (<any>col).Label,
                    field: (<any>col).Field,
                    resizable: true,
                    sortable: true,
                    formatter: LookupFormatter,
                    multiColumnSort: false,
                    isCustom: true,
                    width: 60,
                    __deps: {
                        injector: this.injector,
                        lookupMap: res.Lookups[(<any>col).Field] ? this.convertToMap(res.Lookups[(<any>col).Field], 'ID') : {}
                    }
                };
                if((<any>col).ItemsSource) {
                    colDef.__deps['relativeLookup'] = {
                        Data: res.Lookups[(<any>col).ItemsSource.split('.')[0]],
                        ItemsSource: (<any>col).ItemsSource
                    };
                }
            }
            else if ((<any>col).DataType === 'ColorSelector') {
                colDef = {
                    id: id,
                    name: (<any>col).Label,
                    field: (<any>col).Field,
                    resizable: true,
                    sortable: true,
                    formatter: ColorFormatter,
                    multiColumnSort: false,
                    isCustom: true,
                    width: 60,
                    __deps: {
                        injector: this.injector
                    }
                };
            }
            else if((<any>col).DataType === 'Time') {
                colDef = {
                    id: id,
                    name: (<any>col).Label,
                    field: (<any>col).Field,
                    resizable: true,
                    sortable: true,
                    multiColumnSort: false,
                    minWidth: 60,
                    formatter: DatetimeFormatter,
                    __deps: {
                        injector: this.injector,
                        datetimeFullFormatLocaldatePipe: self.timeFormatLocalDatePipe
                    }
                };
            }
            else if ((<any>col).DataType === 'Date') {
                colDef = {
                    id: id,
                    name: (<any>col).Label,
                    field: (<any>col).Field,
                    resizable: true,
                    sortable: true,
                    formatter: DatetimeFormatter,
                    multiColumnSort: false,
                    isCustom: true,
                    width: 120,
                    __deps: {
                        injector: this.injector,
                        datetimeFullFormatLocaldatePipe: self.dateTimeFullFormatLocalDatePipe
                    }
                };
            }
            else {
                colDef = {
                    id: id,
                    name: (<any>col).Label,
                    field: (<any>col).Field,
                    resizable: true,
                    sortable: true,
                    multiColumnSort: false
                };
            }
            // if((<any>col).Field == 'DESCRIPTION') {
            //     //(<any>colDef).cssClass = 'wrap-prew-rap';
            //     (<any>colDef).maxWidth = 250;
            // }

            columns.unshift(colDef);
            id++;
        }

        return columns;
    }

    convertToMap(lookupData, field) {
        const result = {};
        for(let i = 0; i < lookupData.length; i++)
        {
            result[lookupData[i][field]] = lookupData[i].Name;
        }
        return result;
    }
}
