import {SearchModel} from "../../models/search/common/search";
import {Observable} from "rxjs";
import {AdvancedCriteriaType} from "../search/advanced/types";
import {AdvancedSearchModel} from "../../models/search/common/advanced.search";
import {AsperaUploadService} from "../upload/services/aspera.upload.service";
import {UploadProvider} from "../upload/providers/upload.provider";
import {UploadComponent} from "../upload/upload";
import {SlickGridFormatterData, SlickGridResp} from "../search/slick-grid/types";
import {WorkflowComponent} from "../../views/workflow/workflow.component";

export class SlickProvidersHelper {
    public static hookSearchModel(context, searchModel: SearchModel): Observable<SearchModel>
    {
        return new Observable((observer) => {
            const loadingHandler = context.serverGroupStorageService.retrieve({
                global: [context.paramsAdvStorageKey],
                local: [context.paramsAdvStorageKey]
            });
            loadingHandler.subscribe((res: any) => {
                if (!res.global[context.paramsAdvStorageKey]) {
                    observer.complete();
                    return;
                }

                let groupIds = searchModel.getUniqueGroupIds();
                if (!groupIds.length) {
                    groupIds = [0]; // need for addAdvancedItem into groupIds.forEach
                }

                let advSetups = JSON.parse(res.global[context.paramsAdvStorageKey] || null);
                if (advSetups && advSetups.forEach) {
                    advSetups.forEach((item: AdvancedCriteriaType, k) => {
                        //don't merge adv model
                        groupIds.forEach(el => {
                            let advModel = new AdvancedSearchModel();
                            advModel = advModel.fillByJSON(item);
                            advModel.setGroupId(el);
                            searchModel.addAdvancedItem(advModel);
                        });
                    });
                }
                observer.next(searchModel);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    public static asperaUploadInit(context) {
        const asperaService: AsperaUploadService = context.uploadProvider.getService(context.uploadProvider.getUploadMethod()) as AsperaUploadService;
        setTimeout(() => {
            if(!context.componentContext){
                return;
            }
            context.componentContext.slickGridComp.provider.onGridEndSearch.subscribe(() => {
                asperaService.initAspera({
                    rebindEvents: true,
                    externalContext: context.componentContext
                });
            });
            context.componentContext.slickGridComp.provider.onScrollGrid.subscribe(() => {
                setTimeout(() => {
                    asperaService.initAspera( {
                        rebindEvents: true,
                        externalContext: context.componentContext
                    });
                })
            });
        })
    }

    public static initializeUploadEvents(context, d: { data: SlickGridFormatterData, event: any }) {
        const up: UploadProvider = context.injector.get(UploadProvider);
        context.setSelectedRow(d.data.rowNumber as number);
        up.forcedUploadMode = 'version';
        const upr = up.onReady.subscribe(() => {
            if (upr.unsubscribe) {
                upr.unsubscribe();
            }
            const uc: UploadComponent = up.moduleContext;
            uc.changeAssociateMode('version');
            uc.disableMedia();
        });
        const upd = up.onDestroy.subscribe(() => {
            if (upd.unsubscribe) {
                upd.unsubscribe();
            }
            context.setSelectedRow(d.data.rowNumber as number);
            context.refreshGrid();
        });
    }

    public static refreshGridLazy(context, ids: number[] = [], message = true) {
        return new Observable((obs) => {
            // Create serach Model
            let updateIds,
                searchModel: SearchModel = new SearchModel();

            if (Array.isArray(ids) && ids.length != 0) {
                updateIds = ids;
            } else {
                if (context.getSelectedRows().length) {
                    updateIds = context.getSelectedRows().map((e) => e.ID);
                } else if (context.getSelectedSubRow() && context.getSelectedSubRow().hasOwnProperty('id')) {
                    updateIds = [context.getDataView().getItemById(context.getSelectedSubRow().id).ID];
                }

            }

            if (updateIds && updateIds.length > 0) {
                updateIds.forEach(id => {
                    const asm_id = new AdvancedSearchModel();

                    asm_id.setDBField('ID');
                    asm_id.setField('Id');
                    asm_id.setOperation('=');
                    asm_id.setValue(id);
                    asm_id.setGroupId(searchModel.getNextAvailableGroupId());
                    if (!searchModel.hasAdvancedItem(asm_id)) {
                        searchModel.addAdvancedItem(asm_id);
                    }
                })

            }
            // Get new Data
            context.onGridStartSearch.emit();
            context.service.search(
                context.config.options.searchType,
                searchModel,
                1,
                '',
                'desc'
            ).subscribe(
                (resp: SlickGridResp) => {
                    context.selectedRows = context.getSlick().getSelectedRows();
                    context.setSelectedRows(context.selectedRows);

                    context.selectedRows.forEach((indexRow, i) => {
                        resp.Data[i].id = indexRow;
                        context.getDataView().changeItem(indexRow, resp.Data[i]);
                    });

                    const data = context.getMergeDataviewData([]);
                    context.setOriginalData(data);
                    context.updateData(context.selectedRows, data);
                    (context.componentContext as WorkflowComponent).refreshStarted = false;

                    obs.next();
                    obs.complete();
                }, (err) => {
                    context.onGridEndSearch.emit(false);
                    obs.error(err);
                    obs.complete();

                }, () => {
                    context.onGridEndSearch.emit(true);
                    obs.complete();
                });
            (context.componentContext as any).refreshStarted = true;
        })
    }
}

