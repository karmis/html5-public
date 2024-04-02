import {ViewsProvider} from "../../../../views/providers/views.provider";
import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {Select2Formatter} from "../../../../slick-grid/formatters/select2/select2.formatter";
import {DeleteFormatter} from "../../../../slick-grid/formatters/delete/delete.formatter";
import {DatetimeFormatter} from "../../../../slick-grid/formatters/datetime/datetime.formatter";
import {CheckBoxFormatter} from "../../../../slick-grid/formatters/checkBox/checkbox.formatter";
import {SlickGridProvider} from '../../../../slick-grid/providers/slick.grid.provider';

export class ATFirstSlickGridViewsProvider extends ViewsProvider {
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
    getCustomColumns(sgp: SlickGridProvider = null, readOnly?: boolean, forceReadOnly?: boolean, columsConfig?: any) {
        let columns = [];

        var conf = {
            LangTag: {
                Label: "Tag",
                Readonly: false,
                Visible: true
            },
            IntAudioFlag: {
                Label: "Primary",
                Readonly: false,
                Visible: true
            },
            QcFlag: {
                Label: "QC Flag",
                Readonly: false,
                Visible: true
            }
        };
        if (columsConfig) {
            for (var i = 0; i < columsConfig.length; i++) {
                if (columsConfig[i].Id == "LanguageTag") {
                    conf.LangTag.Label = columsConfig[i].Label.length > 0 ? columsConfig[i].Label : conf.LangTag.Label;
                    conf.LangTag.Readonly = columsConfig[i].Readonly;
                    conf.LangTag.Visible = columsConfig[i].Visible;
                } else if (columsConfig[i].Id == "PrimaryAudio") {
                    conf.IntAudioFlag.Label = columsConfig[i].Label.length > 0 ? columsConfig[i].Label : conf.IntAudioFlag.Label;
                    conf.IntAudioFlag.Readonly = columsConfig[i].Readonly;
                    conf.IntAudioFlag.Visible = columsConfig[i].Visible;
                } else if (columsConfig[i].Id == "QC") {
                    conf.QcFlag.Label = columsConfig[i].Label.length > 0 ? columsConfig[i].Label : conf.QcFlag.Label;
                    conf.QcFlag.Readonly = columsConfig[i].Readonly;
                    conf.QcFlag.Visible = columsConfig[i].Visible;
                }
            }
        }

        columns.push({
            id: 0,
            name: 'Track No',
            field: 'TrackNo',
            minWidth: 50,
            resizable: true,
            sortable: false,
            multiColumnSort: false
        });
        if (readOnly || forceReadOnly) {
            columns.push({
                id: 1,
                name: 'Language',
                field: 'Language',
                minWidth: 50,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            });
        } else {
            columns.push({
                id: 1,
                name: 'Language',
                field: 'LanguageId',
                minWidth: 50,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: Select2Formatter,
                __deps: {
                    injector: this.injector,
                    data: []
                }
            });
        }
        if (readOnly || forceReadOnly) {
            columns.push({
                id: 2,
                name: 'M/S',
                field: 'MS',
                minWidth: 50,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            });
        } else {
            columns.push({
                id: 2,
                name: 'M/S',
                field: 'MsTypeId',
                minWidth: 50,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: Select2Formatter,
                __deps: {
                    injector: this.injector,
                    data: []
                }
            });
        }
        if (conf.LangTag.Visible) {
            if (conf.LangTag.Readonly || readOnly || forceReadOnly) {
                columns.push({
                    id: 3,
                    name: conf.LangTag.Label,
                    field: 'LangTag',
                    minWidth: 50,
                    resizable: true,
                    sortable: false,
                    multiColumnSort: false
                });
            } else {
                columns.push({
                    id: 3,
                    name: conf.LangTag.Label,
                    field: 'LangTag',
                    minWidth: 50,
                    resizable: true,
                    sortable: false,
                    multiColumnSort: false
                });
            }
        }
        if (readOnly || forceReadOnly) {
            columns.push({
                id: 4,
                // name: 'Content',
                name: 'Type',
                field: 'Content',
                minWidth: 50,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            });
        } else {
            columns.push({
                id: 4,
                name: 'Type',
                field: 'TypeId',
                minWidth: 50,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: Select2Formatter,
                __deps: {
                    injector: this.injector,
                    data: []
                }
            });
        }

        if (conf.QcFlag.Visible) {
            if (conf.QcFlag.Readonly || readOnly || forceReadOnly) {
                columns.push({
                    id: 5,
                    name: conf.QcFlag.Label,
                    field: 'QcText',
                    minWidth: 50,
                    resizable: true,
                    sortable: false,
                    multiColumnSort: false
                });
            } else {
                columns.push({
                    id: 5,
                    name: conf.QcFlag.Label,
                    field: 'QcFlag',
                    minWidth: 50,
                    resizable: true,
                    sortable: false,
                    multiColumnSort: false,
                    formatter: Select2Formatter,
                    __deps: {
                        injector: this.injector,
                        data: []
                    }
                });
            }
        }

        if (conf.IntAudioFlag.Visible) {
            if (conf.IntAudioFlag.Readonly || readOnly || forceReadOnly) {
                columns.push({
                    id: 6,
                    name: conf.IntAudioFlag.Label,
                    field: 'IntAudioFlag',
                    minWidth: 50,
                    resizable: true,
                    sortable: false,
                    multiColumnSort: false,
                    formatter: CheckBoxFormatter,
                    __deps: {
                        injector: this.injector
                    }
                });
            } else {
                columns.push({
                    id: 6,
                    name: conf.IntAudioFlag.Label,
                    field: 'IntAudioFlag',
                    minWidth: 50,
                    resizable: true,
                    sortable: false,
                    multiColumnSort: false,
                    formatter: CheckBoxFormatter,
                    __deps: {
                        injector: this.injector,
                        data: {
                            enabled: true,
                            enabledList: []
                        }
                    }
                });
            }
        }

        columns.push({
            id: 7,
            name: 'Date Added',
            field: 'DateAdded',
            minWidth: 50,
            resizable: true,
            sortable: false,
            multiColumnSort: false,
            formatter: DatetimeFormatter,
            __deps: {
                injector: this.injector,
                datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
            }
        });
        if (!readOnly && !forceReadOnly) {
            columns.push({
                id: 8,
                field: "Delete",
                name: "",
                width: 50,
                resizable: false,
                sortable: false,
                multiColumnSort: false,
                formatter: DeleteFormatter,
                __deps: {
                    injector: this.injector
                }
            });
        }

        return columns;
    }
}
