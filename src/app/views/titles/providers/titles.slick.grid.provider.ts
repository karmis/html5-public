/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import { SlickGridProvider } from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import {
    SlickGridEventData,
    SlickGridResp,
    SlickGridRowData
} from "../../../modules/search/slick-grid/types";
import { TitlesComponent } from "../titles.component";
import { VersionsInsideTitlesComponent } from "../modules/versions/versions.component";
import { TitlesVersionsSlickGridProvider } from "../modules/versions/providers/titles.versions.slickgrid.provider";
import { TitlesSlickGridService } from "../modules/versions/services/slickgrid.service";
import { SearchModel } from '../../../models/search/common/search';
import { IMFXModalProvider } from '../../../modules/imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../../../modules/imfx-modal/imfx-modal';
import { CreateSubversionModalComponent } from '../../../modules/create.subversion.modal/create.subversion.modal.component';
import { ComponentRef, Inject, Injector } from '@angular/core';
import { lazyModules } from "../../../app.routes";
import { CreateEpisodeTitleModalComponent } from '../../../modules/create.episode.title.modal/create.episode.title.modal.component';
import { TitleService } from '../../../services/title/title.service';
import { Observable } from 'rxjs';
import { AdvancedSearchModel } from '../../../models/search/common/advanced.search';
import { WorkflowComponent } from '../../workflow/workflow.component';
import {SlickProvidersHelper} from "../../../modules/abstractions/slick.providers.helper";

export class TitlesSlickGridProvider extends SlickGridProvider {
    lastData: SlickGridEventData;
    titleService: TitleService;
    selectedRows = [];
    selectedSubRow?: { id?: number, index?: number } = {};

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);

        this.titleService = this.injector.get(TitleService);
    }

    get service(): TitlesSlickGridService {
        return (<TitlesSlickGridService>this._config.service);
    }

    /**
     * On row changed
     * @param d
     * @param allowSameData
     */
    onRowChanged(d?: SlickGridEventData, allowSameData?: boolean): any {
        let data = d;
        if (!d) {
            data = this.lastData;
        }
        if (!data) {
            return;
        }
        let comp: TitlesComponent = (<TitlesComponent>this.config.componentContext);
        let versionsGrid: VersionsInsideTitlesComponent = comp.versionsGridRef;

        if (versionsGrid) {
            let provider: TitlesVersionsSlickGridProvider = (versionsGrid.slickGridComp.provider as TitlesVersionsSlickGridProvider);
            const extendColumns = versionsGrid.slickGridComp.provider.extendedColumns;
            if ((data && data.row && (allowSameData || !this.isSameEventData(data))) || (provider.getData().length === 0)) {
                comp.clearResultForVersionsGrid();
                comp.clearResultForMediaGrid();

                if (data && data.row) {
                    provider.showOverlay();
                    provider.titleId = data.row.ID;
                    this.service.getRowsByIdTitlesToVersions(data.row.ID, extendColumns).subscribe((resp: any) => {
                        provider.buildPageByData(resp);
                    }, () => {
                        provider.hideOverlay();
                    }, () => {
                        provider.hideOverlay();
                    });
                }
            }
        }
        if (data && data.row && data.row.ID) {
            this.lastData = data;
        }
    }

    /*updateExtendsColumnsCallback() {
        if (this.lastData) {
            this.onRowChanged(this.lastData);
        }
    }*/

    setSelectedRows(rowIds: number[]) {
        this.getSlick().setSelectedRows(rowIds);
        this._selectedRowsIds = rowIds;
        this.onSelectRow.emit(rowIds);
        this.onRowChanged({
            row: this.getSelectedRow(),
            cell: 0
        }, true);
    }

    public isSameEventData(d: SlickGridEventData) {
        return this.lastData && this.lastData.row ? d.row.ID === this.lastData.row.ID : false;
    }

    private prevPage = null;

    protected _setSelectionAndDataAfterRequest(resp: SlickGridResp, searchModel?: SearchModel) {
        const selectedRows = this.selectedRows.length > 0 ? this.selectedRows : this.getPrevSelectRows();
        const data = this.prepareData(resp.Data, resp.Data.length);
        if (this.PagerProvider.getCurrentPage() === this.prevPage
            &&
            (searchModel && searchModel.isEqual(this.lastSearchModel) && this.getData().length > 0)
        ) {
            const keys = [];

            $.each(this.getData(), (k, oldData: SlickGridRowData) => {
                const oldDataAsStr = Object.keys(oldData).map((key) => oldData[key]).join();
                const newDataAsStr = Object.keys(data).map((key) => oldData[key]).join();
                if (newDataAsStr !== oldDataAsStr) {
                    keys.push(k);
                }
            });
            this.setData(data, true); //TODO if you want replace it to this.module.data = data; call Sergey Klimenko! IMPORTANT!
            this.getSlick().invalidateRows(keys);
            this.dataView.endUpdate();
            new Promise((resolve, reject) => {
                resolve();
            }).then(() => {
                    this.resize();
                    if (data.length > 0) {
                        if (this.selectedRows.length > 0 || this.getPrevSelectRows().length > 0) {
                            this.setSelectedRows(selectedRows);
                        } else if (this.selectedRows.length == 0 && this.module.selectFirstRow == true) {
                            this.setSelectedRow(0, data[0]); // selected first row
                        }

                    } else if (data.length == 0) {
                        this.setSelectedRow(null);
                    }
                }, (err) => {
                    console.log(err);
                }
            );
        } else {
            if (this.getData().length) {
                this.clearData(false);
            }
            this.prevPage = this.PagerProvider.getCurrentPage();
            this.setData(data, true);
            (<any>this.componentContext).refreshStarted = false;
            if (data.length > 0) {
                this.setSelectedRow(0, data[0]); // selected first row
            } else if (data.length == 0) {
                this.setSelectedRow(null);
            }
        }
    }

    createSubversion($event, cb = (context) => {
        return;
    }) {
        let data = this.getSelectedRowData();
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.create_subversion,
            CreateSubversionModalComponent, {
                title: 'version.create_version.title',
                size: 'md',
                position: 'center',
                footer: 'cancel|ok'
            });

        modal.load().then((modal: ComponentRef<CreateSubversionModalComponent>) => {
            let modalContent: CreateSubversionModalComponent = modal.instance;
            modalContent.setContextItem(data);
            modalContent.setItemType("Title");
            modalContent.setSuccessCB(() => {
                // this.refreshGrid(true);
                setTimeout(() => {
                    this.onRowChanged(this.lastData, true);
                    // cb(this);
                }, 2000);
            });
        });
    }

    onCreateEpisodeTitle() {
        let data = this.getSelectedRowData();
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.create_episode_title,
            CreateEpisodeTitleModalComponent, {
                title: 'version.table.dropdown.row.create_episode_title',
                size: 'md',
                position: 'center',
                footer: 'cancel|ok'
            }, {item: data, mode: 'episode'});

        modal.load().then((component: ComponentRef<CreateEpisodeTitleModalComponent>) => {
            component.instance.updateGrid.subscribe(() => {
                this.refreshGrid(true);
            });
        });
    }
    onCreateSeason() {
        let data = this.getSelectedRowData();
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.create_episode_title,
            CreateEpisodeTitleModalComponent, {
                title: 'version.table.dropdown.row.create_season',
                size: 'md',
                position: 'center',
                footer: 'cancel|ok'
            }, {item: data, mode: 'season'});

        modal.load().then((component: ComponentRef<CreateEpisodeTitleModalComponent>) => {
            component.instance.updateGrid.subscribe(() => {
                this.refreshGrid(true);
            });
        });
    }
    onCreateTitle() {
        let data = this.getSelectedRowData();
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.create_episode_title,
            CreateEpisodeTitleModalComponent, {
                title: 'titles.topPanel.create_title',
                size: 'md',
                position: 'center',
                footer: 'cancel|ok'
            }, {item: data, mode: 'title'});

        modal.load().then((component: ComponentRef<CreateEpisodeTitleModalComponent>) => {
            component.instance.updateGrid.subscribe(() => {
                this.refreshGrid(true);
            });
        });
    }
    onCreateSeries() {
        let data = this.getSelectedRowData();
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.create_episode_title,
            CreateEpisodeTitleModalComponent, {
                title: 'titles.topPanel.create_series',
                size: 'md',
                position: 'center',
                footer: 'cancel|ok'
            }, {item: data, mode: 'series'});

        modal.load().then((component: ComponentRef<CreateEpisodeTitleModalComponent>) => {
            component.instance.updateGrid.subscribe(() => {
                this.refreshGrid(true);
            });
        });
    }

    isShowCreateEpisode() {
        const data = this.getSelectedRowData();
        if (data) {
            return data.Title_Type === "Season" || data.Title_Type === "Series"
        } else {
            return false
        }
    }

    isShowCreateSeason() {
        const data = this.getSelectedRowData();
        if (data) {
            return data.Title_Type === "Series"
        } else {
            return false
        }
    }


    refreshGridLazy(ids: number[] = [], message = true) {
        return SlickProvidersHelper.refreshGridLazy(this, ids, message);
    }

    private getSelectedSubRow() {
        return this.selectedSubRow;
    }
}
