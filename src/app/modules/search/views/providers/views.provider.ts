/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import * as $ from "jquery";
import {
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    EventEmitter,
    Injectable,
    Injector
} from "@angular/core";
import { ViewsConfig } from "../views.config";

import { SlickGridProvider } from "../../slick-grid/providers/slick.grid.provider";
import { SlickGridColumn } from "../../slick-grid/types";
import { DatetimeFormatter } from "../../slick-grid/formatters/datetime/datetime.formatter";
import { ViewsService } from "../services/views.service";
import { IMFXModalComponent } from "../../../imfx-modal/imfx-modal";
import { IMFXModalProvider } from "../../../imfx-modal/proivders/provider";
import { SearchColumnsComponent } from "../../columns/search.columns";
import {
    CurrentViewsStateType,
    SaveViewValidateResult,
    UserViewsOriginalType,
    ViewColumnsType,
    ViewSaveResp,
    ViewsOriginalType,
    ViewType
} from "../types";
import { IMFXControlsSelect2Component } from "../../../controls/select2/imfx.select2";
import { Select2ItemType, Select2ItemTypeGroup, Select2ListTypes } from "../../../controls/select2/types";
import { IMFXModalEvent } from "../../../imfx-modal/types";
import { Observable } from "rxjs";
import { IMFXModalAlertComponent } from "../../../imfx-modal/comps/alert/alert";
import { ReturnRequestStateType } from "../../../../views/base/types";
import { ViewDetailModalComp } from "../comp/view.detail.modal/view.detail.modal.comp";
import { SecurityService } from "../../../../services/security/security.service";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { CustomStatusFormatter } from "../../slick-grid/formatters/custom-status/custom.status.formatter";
import { NativeNavigatorProvider } from '../../../../providers/common/native.navigator.provider';
import { lazyModules } from "../../../../app.routes";


@Injectable()
export class ViewsProvider {
    config: ViewsConfig;
    ui: IMFXControlsSelect2Component;
    service: ViewsService;
    modalProvider: IMFXModalProvider;
    translate: TranslateService;
    onChangeViewState: EventEmitter<CurrentViewsStateType> = new EventEmitter<CurrentViewsStateType>();
    public datetimeFullFormatLocaldatePipe: string = "DD/MM/YYYY HH:mm";
    private lastSelectedView: ViewType;
    private securityService;
    private nativeNavigatorProvider: NativeNavigatorProvider;
    private _lastViewState;

    constructor(public compFactoryResolver: ComponentFactoryResolver,
                public appRef: ApplicationRef,
                public injector: Injector) {
        this.securityService = this.injector.get(SecurityService);
        this.service = this.injector.get(ViewsService);
        this.modalProvider = this.injector.get(IMFXModalProvider);
        this.translate = injector.get(TranslateService);
        this.nativeNavigatorProvider = injector.get(NativeNavigatorProvider);
        this.translate.get('common.date_time_full_format_localdate_pipe').subscribe(
            (res: string) => {
                this.datetimeFullFormatLocaldatePipe = res;
            });
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.datetimeFullFormatLocaldatePipe = event.translations.common.date_time_full_format_localdate_pipe;
        });
    }

    public _originalViews: ViewsOriginalType = null;

    get originalViews(): ViewsOriginalType {
        return this._originalViews;
    }

    private _currentViewsState: CurrentViewsStateType = {
        viewObject: null,
        isSaved: false
    };

    get currentViewsState(): CurrentViewsStateType {
        return this._currentViewsState;
    }

    /**
     * On select view
     * @param id
     * @returns {any}
     */
    onSelect(id: number) {
        this.ui.setSelectedByIds([id]);
        this.service.loadViewById(this.config.options.type, id).subscribe((view: ViewType) => {

            this.lastSelectedView = view;
            this.build(view);
            this.changeViewState({viewObject: view, isSaved: true});
            // sgc.provider.hideOverlay();
        });
    }

    /**
     * Return custom columns for table
     * @returns {any[]}
     */
    getCustomColumns(sgp: SlickGridProvider = null, res:any = {}, data: any = {}): any[] {
        return [];
    }

    build(view: ViewType, colSetups: ViewColumnsType = {}): void {
        if(!view || $.isEmptyObject(view) === true) {
            return;
        }

        if(!this._originalViews || $.isEmptyObject(this._originalViews)) {
            return;
        }

        colSetups = this._originalViews.ViewColumns;
        let arrSgp: SlickGridProvider[] = this.getSlickGridProviders();
        if (!$.isEmptyObject(view) && $.isEmptyObject(view.ColumnData)) {
            let keys = Object.keys(view.ColumnData);
            //var update = false;

            keys.forEach((el: any) => {
                if (el.startsWith("xml|")) {
                    if (this._originalViews && this._originalViews.ViewColumns && !this._originalViews[el]) {
                        //update = true;
                        this._originalViews.ViewColumns[el] = {
                            BindingFormat: null,
                            CanUserSort: false,
                            IsExtendedField: true,
                            BindingName: view.ColumnData[el].Tag,
                            TemplateName: (<any>view.ColumnData[el]).Label
                        };
                    }
                }
            });

            this.changeViewState({viewObject: view, isSaved: false});
            /*if(update) {
                arrSgp[0].applyColumns();
            }*/

        }


        if (!arrSgp || arrSgp.length == 0) {
            console.error('slickGridComp not found');
            return;
        }


        for (let sgp of arrSgp) {
            let sgc = sgp.moduleContext;
            if (!sgc || !sgc.isGridReady) {
                sgc.onGridReady.subscribe(() => {
                    sgc.provider.setViewColumns(
                        view,
                        colSetups,
                        this.getCustomColumns(sgp)
                    );
                    sgc.provider.prepareAndSetGlobalColumns(colSetups);
                });
            } else {
                sgc.provider.setViewColumns(
                    view,
                    colSetups,
                    this.getCustomColumns(sgp)
                );
                sgc.provider.prepareAndSetGlobalColumns(colSetups);
            }
        }
    };

    load(): Observable<ViewsOriginalType | null> {
        let arrSgp: SlickGridProvider[] = this.getSlickGridProviders();
        let self = this;
        return new Observable((observer: any) => {
            if (!arrSgp || arrSgp.length == 0) {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                observer.next(null);
                observer.complete();
                // });
            } else {
                this.service.getViews(this.config.options.type).subscribe((view: ViewsOriginalType) => {
                    if (this._originalViews) {
                        var keys = Object.keys(this._originalViews.ViewColumns);
                        keys.forEach((key) => {
                            if (key.startsWith("xml|") && !view.ViewColumns[key]) {
                                view.ViewColumns[key] = this._originalViews.ViewColumns[key];
                            }
                        });
                    }
                    this._originalViews = view;
                    arrSgp.forEach(sgp => sgp.prepareAndSetGlobalColumns(view.ViewColumns));
                    this.setViewsForUI(<any>view.UserViews);
                    observer.next(view);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
            }
        });
    }

    setViewsForUI(views: Array<any>) {
        let _views: Select2ListTypes = this.ui.turnSimpleObjectToStandart(views);
        // Check for a new data type.
        // ISelected means a group - global or local
        if (views.length > 0 && views[0].IsSelected !== undefined) {
            _views = this.turnArrayOfObjectToStandartGroupingViews(_views);
            this.ui.setData(_views, true, true, true);
        } else {
            this.ui.setData(_views, true);
        }

    }

    turnArrayOfObjectToStandartGroupingViews(arr: Select2ItemType[]): Select2ItemTypeGroup[] {
        let groups = [
            {
                id: 0,
                text: 'Personal Views',
                children: [],
            },
            {
                id: 1,
                text: 'Global Views',
                children: [],
            }
        ];

        arr.forEach((dirtyObj) => {
            if (dirtyObj.isSelected) {
                groups[1].children.push(dirtyObj);
            } else {
                groups[0].children.push(dirtyObj);
            }
        });

        groups = groups.filter(item => item.children.length > 0);

        return groups;
    }

    setViewForUI(view: ViewType, isSavedState: boolean = true) {
        if (!view) {
            return;
        }
        this.changeViewState({
            viewObject: view,
            isSaved: isSavedState
        });

        if (view.Id === -1) {
            console.warn('Id for current view is -1');
            return;
        }

        let views: UserViewsOriginalType[] = this.originalViews.UserViews;

        let idDefault: number | string = -1;
        const defaultsViews = views.find(item => item.Id === view.Id);
        if (defaultsViews) {
            idDefault = defaultsViews.Id;
        }

        // for (let e in views) {
        //     if (views[e] === view.ViewName) {
        //         index = parseFloat(e);
        //     }
        // }
        this.lastSelectedView = view;
        this.ui.setSelectedByIds([idDefault], false);
    }

    resetView() {
        this.build(this.lastSelectedView);
        this.setViewForUI(this.lastSelectedView);
    }

    /*
     * Delete current view
     */
    deleteView() {
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal, IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then((cr: ComponentRef<IMFXModalAlertComponent>) => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText('views.delete_confirm');
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    let removedViewId = this.currentViewsState.viewObject.Id;
                    this.service.deleteView(this.currentViewsState.viewObject).subscribe((resp: ReturnRequestStateType) => {
                        this.load().subscribe(() => {
                            this.build(this.originalViews.DefaultView);
                            this.setViewForUI(this.originalViews.DefaultView);
                            let isSaved = removedViewId != this.originalViews.DefaultView.Id;
                            this.changeViewState({viewObject: this.originalViews.DefaultView, isSaved: isSaved});
                        });
                    });
                    modal.hide();
                }
            });
        });
    };

    saveCurrentView() {
        this.saveView().subscribe((view: ViewType) => {

        });
    }

    saveAsDefaultView() {
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal, IMFXModalAlertComponent, {
            size: 'md',
            title: 'table_search_dropdown.controls.save_as_default_view',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then((cr: ComponentRef<IMFXModalAlertComponent>) => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText('views.as_default_confirm');
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    this.saveView(this.getViewForSave(), true).subscribe(() => {

                    });
                    modal.hide();
                }
            });
        });
    }

    saveAsGlobalView() {
        const view = this.currentViewsState.viewObject;

        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal, IMFXModalAlertComponent, {
            size: 'md',
            title: (view.IsPublic) ? 'table_search_dropdown.controls.save_as_personal_view' : 'table_search_dropdown.controls.save_as_global_view',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then((cr: ComponentRef<IMFXModalAlertComponent>) => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            const text = (!view.IsPublic) ? 'views.as_global_confirm' : 'views.as_personal_confirm';
            modalContent.setText(text);
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    const viewForSave = this.getViewForSave();
                    viewForSave.IsPublic = !view.IsPublic;
                    if (!viewForSave.Id) {
                        this.config.moduleContext.notificationRef.notifyShow(2, 'views.unknown_id');
                        return;
                    }

                    this.service.saveViewAsGlobal(viewForSave).subscribe(
                        (resp: any) => {
                            if (resp.ErrorCode == null) {
                                this.service.clearOriginalView(this.config.options.type);
                                this.load().subscribe(() => {
                                    this.config.moduleContext.notificationRef.notifyShow(1, 'views.success_save');
                                    this.setViewForUI(viewForSave);
                                });
                            }
                        }, (err) => {
                            const er = err.Error ? err.Error : 'views.error_save';
                            this.config.moduleContext.notificationRef.notifyShow(2, er);
                            // observer.error(err);
                        }
                    );
                    modal.hide();
                }
            });
        });
    }

    saveViewAs(isPublic: boolean) {
        this.requestViewName(true, isPublic).subscribe((res: any) => {
            if (res != null && res.view != null) {
                // save new view as
                this.saveView(res.view, false).subscribe(() => {
                    // save this view as default
                    if (res.isDefault) {
                        this.saveView(res.view, res.isDefault).subscribe(() => {
                        });
                    }
                });
            }
        });
    }

    requestViewName(isNew: boolean = false, isPublic: boolean = false): Observable<any | null> {
        let self = this;
        return new Observable((observer: any) => {
            let view: ViewType = this.getViewForSave(isNew, isPublic);
            // if(view.ViewName){
            //     observer.next(view);
            //     return;
            // }

            let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.view_detail_modal, ViewDetailModalComp, {
                size: 'md',
                title: isPublic ? 'views.global_save_view' : 'views.save_view',
                position: 'center',
                footer: isPublic ? 'close|ok' : 'close|checkbox|ok'
            });
            modal.load().then((cr: ComponentRef<ViewDetailModalComp>) => {
                let modalContent: ViewDetailModalComp = cr.instance;
                modalContent.setLabel('views.enter_view');
                modalContent.setPlaceholder('views.new_name_view');
                let isFirstInit = true; //crutch: flag to cancel a first fire the onHide event
                modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                    if (e.name === 'ok') {
                        let viewName = modalContent.getValue();
                        let isDefault = modalContent.isDefault;
                        let isGlobal = modalContent.isGlobal;
                        let validRes: SaveViewValidateResult = this.validate(viewName);
                        if (!validRes.valid) {
                            modalContent.setError(validRes.saveError);
                            return;
                        }
                        view.ViewName = viewName;
                        view.IsPublic = self.hasPermissionByName('views-save-as-global') ? isGlobal : false;

                        modal.hide();
                        observer.next({view: view, isDefault: isDefault});
                        observer.complete();
                    } else if (e.name === 'hide') {
                        //crutch: disable a first fire the onHide event
                        if (this.currentViewsState.isSaved || !isFirstInit) {
                            observer.next(null);
                            observer.complete();
                            modal.hide();
                        } else {
                            isFirstInit = false;
                        }
                    }
                });
            })

        });
    }

    /*
     * Save current view as - validation new name
     */
    validate(string): SaveViewValidateResult {
        let res = {saveError: '', valid: true};
        let currentView: ViewType = this.currentViewsState.viewObject || this.getViewForSave(true, false);
        let userViews: UserViewsOriginalType[] = this.originalViews.UserViews;
        if ($.isEmptyObject(currentView.ColumnData)) {
            res = {saveError: "views.view_columns_is_empty", valid: false};
        }
        if (!string || string.trim() == '') {
            res = {saveError: "views.view_name_is_empty", valid: false};
        } else {
            $.each(userViews, (k, v) => {
                if (v == string) {
                    res = {saveError: "views.view_name_exist", valid: false};
                }
            });


        }
        return res;
    }

    newView() {
        this.config.moduleContext.dropdown.setPlaceholder(
            this.config.moduleContext.translate.instant('table_search_dropdown.controls.new_view'),
            true
        );
        this._lastViewState = this._currentViewsState;
        this.changeViewState({viewObject: null, isSaved: false});
        this.setupColumns(true);
    }

    setupColumns(isNewView: boolean = false) {
        let isOpened = true;
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.search_columns, SearchColumnsComponent, {
            size: 'md',
            class: 'imfx-modal stretch-modal',
            title: 'columns_modal.header',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {gridProviders: this.getSlickGridProviders(), isNewView: isNewView, viewsProvider: this});
        modal.load().then(() => {
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok_and_save') {
                    let withRefresh = !e.state.isDefault;
                    isOpened = false;
                    modal.hide();
                    if (!this.currentViewsState.isSaved) {
                        this.requestViewName(!this.currentViewsState.isSaved, e.state.isGlobal).subscribe((res: any) => {

                            if (res && res.view != null) {
                                let firstCall = true;
                                this.saveView(res.view, false, withRefresh).subscribe((view: ViewType) => {
                                    if (res.isDefault && firstCall) {
                                        firstCall = false;
                                        this.saveView(view, true).subscribe(() => {
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        let view = this.getViewForSave(false);
                        this.saveView(view, false, withRefresh).subscribe((view: ViewType) => {
                            if (e.state.isDefault) {
                                this.saveView(view, e.state.isDefault).subscribe(() => {
                                    // debugger
                                });
                            }
                        });
                    }
                } else if (e.name == 'ok') {
                    isOpened = false;
                    this.changeViewState({
                        viewObject: this.getViewForSave(isNewView, e.state.isGlobal),
                        isSaved: false
                    });
                    modal.hide();
                } else if (e.name.indexOf('hide') > -1 && isOpened === true) {
                    isOpened = false;
                    // if (this.lastSelectedView == undefined) {
                    //     return;
                    // }
                    //
                    // this.onSelect(this.lastSelectedView.Id);
                }
            });
        });
    }

    getViewForSave(isNew: boolean = false, isPublic: boolean = false): ViewType {
        let sgp: SlickGridProvider = this.getSlickGridProviders()[0];
        let columns = sgp.getActualColumns();
        let columnData = {};
        columns = columns.filter(function (el: SlickGridColumn) {
            return el.field != '*';
        });

        columns.forEach(function (el: SlickGridColumn) {
            columnData[el.field] = {
                "Index": el.id,
                "Tag": el.field,
                "Width": el.width
            };
            if (el.field.startsWith("xml|")) {
                columnData[el.field].Label = el.name;
            }
        });

        let view: ViewType = Object.assign({}, this.currentViewsState.viewObject);
        view.ColumnData = columnData;
        view.Type = this.config.options.type;
        view.ShowThumbs = sgp.isThumbnails();
        if (isNew === true) {
            view.Id = 0;
            view.ViewName = null;
        }

        if (isPublic === true) {
            view.IsPublic = true;
        }

        return view;
    }

    shouldPinColumn(): boolean {
        const isIE = this.nativeNavigatorProvider.isIE();
        const isEdge = this.nativeNavigatorProvider.isEdge();
        // return !(isEdge || isIE);
        return true;
    }

    getFormatterByName(bindingName, col, colDef: SlickGridColumn): SlickGridColumn {
        if (bindingName && bindingName.startsWith('xml|')) {
            colDef = $.extend(true, {}, colDef, {
                field: bindingName,
                isFrozen: false,
                formatter: CustomStatusFormatter,
                __deps: {
                    injector: this.injector,
                    data: {
                        column_name: bindingName
                    }
                }
            });
        }

        return colDef;
    }

    getFormatterByFormat(bindingFormat, col, colDef: SlickGridColumn): SlickGridColumn {
        if (bindingFormat) {
            switch (bindingFormat) {
                // Date
                case 'G':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        minWidth: 60,
                        resizable: true,
                        formatter: DatetimeFormatter,
                        enableColumnReorder: true,
                        __deps: {
                            injector: this.injector,
                            datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                        }
                    });
                    break;
                default:
                    break;
            }
        }

        return colDef;
    }

    changeViewState(viewState: CurrentViewsStateType) {
        this._currentViewsState = viewState;
        this.onChangeViewState.emit(viewState);
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    viewDetails() {
        let isDefaultView = this.currentViewsState.viewObject.Id == this.originalViews.DefaultView.Id;
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.view_detail_modal, ViewDetailModalComp, {
            size: 'md',
            title: !isDefaultView ? 'table_search_dropdown.controls.view_details' : 'table_search_dropdown.controls.view_details_as_default',
            position: 'center',
            footer: 'close|checkbox|ok',
            class: 'view-details',
            // hideModalBody: true
        });
        modal.load().then((cr: ComponentRef<ViewDetailModalComp>)=>{
            let modalContent: ViewDetailModalComp = cr.instance;
            modalContent.setValue(this.currentViewsState.viewObject.ViewName);
            modalContent.setIsGlobal(this.currentViewsState.viewObject.IsPublic);
            modalContent.setIsDefault(isDefaultView);
            modalContent.setAsDefaultFlagForTitle(isDefaultView);
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    let view = this.getViewForSave();
                    view.IsPublic = modalContent.isGlobal;
                    view.ViewName = modalContent.getValue();
                    this.saveView(view, false).subscribe(() => {
                        if (modalContent.isDefault) {
                            this.saveView(view, true).subscribe(() => {

                            });
                        }
                    });
                    // this.saveView(view, modalContent.isDefault).subscribe(() => {
                    // });

                    modal.hide();
                }
            });
        });

    }

    /*
     * Save current view
     */

    public getSlickGridProviders(): SlickGridProvider[] {
        let gridProviders = this.config.moduleContext.gridProviders;
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

    //-*-*
    private saveView(view: ViewType = null, isDefault: boolean = false, withRefresh: boolean = true): Observable<ViewType> {
        return new Observable((observer: any) => {
            if (!view) {
                view = this.getViewForSave();
            }
            // observer.next(view);
            this.service.saveView(view, isDefault).subscribe(
                (resp: ViewSaveResp) => {
                    if (resp.ErrorCode == null) {
                        if (resp.ObjectId) {
                            view.Id = resp.ObjectId;
                        }
                        this.changeViewState({
                            viewObject: view,
                            isSaved: true
                        });
                        if (isDefault === true) {
                            //-*-*
                            this.originalViews.DefaultView = view;
                            this.originalViews.DefaultViewName = view.ViewName;
                        }
                        if (withRefresh) {
                            this.service.clearOriginalView(this.config.options.type);
                            this.load().subscribe(() => {
                                this.config.moduleContext.notificationRef.notifyShow(1, 'views.success_save');
                                this.setViewForUI(view);
                            });
                        } else {
                            this.build(view);
                        }
                        observer.next(view);

                    }
                }, (err) => {
                    const er = err.Error ? err.Error : 'views.error_save';
                    this.config.moduleContext.notificationRef.notifyShow(2, er);
                    observer.error(err);
                }, () => {
                    observer.complete();
                }
            );
        });

    }
}
