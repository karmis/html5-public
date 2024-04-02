import {Observable,  Subscription , Subject} from "rxjs";
import {appRouter} from "../../../../../../constants/appRouter";
import { ComponentRef, Inject, Injector } from "@angular/core";
import {TitlesTabGridService} from "../services/grid.service";
import { SlickGridService } from '../../../../slick-grid/services/slick.grid.service';
import {TitlesSlickGridProvider} from "../../../../../../views/titles/providers/titles.slick.grid.provider";
import {SearchModel} from "../../../../../../models/search/common/search";
import {AdvancedSearchModel} from "../../../../../../models/search/common/advanced.search";
import {takeUntil} from "rxjs/internal/operators";
import { IMFXModalProvider } from '../../../../../imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../../../../../imfx-modal/imfx-modal';
import { CreateSubversionModalComponent } from '../../../../../create.subversion.modal/create.subversion.modal.component';
import { IMFXTitlesTabComponent } from '../imfx.titles.tab.component';
import {lazyModules} from "../../../../../../app.routes";
import {SlickGridRowData} from "../../../../slick-grid/types";

export class DetailTitlesTabGridProvider extends TitlesSlickGridProvider {
    public lastSelectedRow = null;
    private destroyed$: Subject<any> = new Subject();
    private isCarrierDetail = false;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }

    /**
     * get rows by id
     * @param id
     * @returns {Observable<Subscription>}
     */
    getRowsById(id: number, isCarrierDetail: boolean = false): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.isCarrierDetail = isCarrierDetail;
            if (isCarrierDetail) {
                (<TitlesTabGridService>this.componentContext.slickGridComp.service).getRowsByIdCarrierToTitles(id, this.extendedColumns, this).subscribe(
                    (resp: SlickGridRowData[]) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
            } else {
                let searchModel: SearchModel = new SearchModel();
                let asm_id = new AdvancedSearchModel();
                asm_id.setDBField('ID');
                asm_id.setField('Id');
                asm_id.setOperation('=');
                asm_id.setValue(id);
                searchModel.addAdvancedItem(asm_id);
                this.componentContext.slickGridComp.service.search(
                    (<any>this.componentContext.slickGridComp.config.options).searchType,
                    searchModel,
                    1, null, null, null
                ).pipe(
                    takeUntil(this.destroyed$)
                ).subscribe((res: any) => {
                    if (res.Data.length) {
                        observer.next(res);
                        observer.complete();
                    }
                });
            }
        });
    }


    /**
     * On double click by row
     * @param $event
     */
    onRowDoubleClicked(data): any {
        // if (event.target['tagName'] == 'IMG' && (event.target['className'] == 'settings-icon' || event.target['className'] == 'media-basket-icon')) {
        //     return;
        // }

        let force = this.config.componentContext ? this.config.componentContext.config.typeDetails : 'version-details';
        let destination = this.config.options.type.replace('inside-', '').toLowerCase();
        this.router.navigate(
            [
                appRouter[destination].detail.substr(
                    0,
                    appRouter[destination].detail.lastIndexOf('/')),
                (<any>data.row).ID
            ]
        );
    }

    refreshGrid(withOverlays: boolean = false) {
        // super.refreshGrid(withOverlays);
        let service: any = this.injector.get(SlickGridService);
        const extendColumns = this.extendedColumns;
        let data = this.getSelectedRow();

        let versionId = (data) ?
            (<any>data).PGM_PARENT_ID //|| (<any>data).PGM_RL_ID
            : null;

        if (versionId) {
            withOverlays && this.showOverlay();
            service.getRowsByIdVersionsToMedia(versionId, extendColumns).subscribe((resp: any) => {
                this.buildPageByData(resp);
                this.moduleContext.whenGridRendered((e,grid) => {
                    this.moduleContext.cdr.detectChanges();
                });
            }, () => {
                withOverlays && this.hideOverlay();
            }, () => {
                withOverlays && this.hideOverlay();
            });
        }
    }


    createSubversion($event, cb = (context)=>{return;}) {
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
                    (<IMFXTitlesTabComponent>this.componentContext).afterVersionCreation.emit();
                    // cb(this);
                },2000);
            });
        });
    }
}
