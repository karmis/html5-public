import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import {SlickGridProvider} from "../../providers/slick.grid.provider";
import { IMFXModalAlertComponent } from '../../../../imfx-modal/comps/alert/alert';
import { IMFXModalComponent } from '../../../../imfx-modal/imfx-modal';
import { IMFXModalEvent } from '../../../../imfx-modal/types';
import { NotificationService } from '../../../../notification/services/notification.service';
import { IMFXModalProvider } from '../../../../imfx-modal/proivders/provider';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { lazyModules } from "../../../../../app.routes";

@Component({
    selector: 'delete-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
      'styles/index.scss'
    ],
    host: { 'style' : 'display: flex; height: 100%; flex-direction: column; justify-content: center;'},
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DeleteFormatterComp {
    private params;
    public injectedData: SlickGridFormatterData;
    private provider: SlickGridProvider;
    private column: SlickGridColumn;
    private withModal: boolean;
    private data;
    private disabled = false;
    private id: number = null;
    /*
    consist of:
        text: 'settings_group.modal_remove_conformation',
        textParams: {groupName: 'NAME'},
        message: 'settings_group.remove_success'
     */
    private modalData;

    constructor(private injector: Injector,
                protected modalProvider: IMFXModalProvider,
                private notificationRef: NotificationService) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.column = (<any>this.injectedData).data.columnDef;
        this.provider = this.column.__contexts.provider;
        this.data = this.column.__deps.data;
        this.withModal = (this.data) ? this.data.withModal : false;
        this.modalData = (this.data) ? this.data.modalData : {};
        this.id = this.provider.getId(this.params.data);
        if(this.data && this.data.disabledFieldMask) {
            this.disabled = this.params.data[this.data.disabledFieldMask.ColumnName]
        }
    }

    // delete row
    deleteRow($event) {
        if(false === this.isDisabledDelete()){
            $event.stopPropagation();
            (this.withModal) ? this.showModal() : this.provider.deleteRow({data: this.params}, this.id);
        }
    }

    showModal() {
        let textParams = {};

        for (let key in this.modalData.textParams) {
            textParams[key] = this.params.data[this.modalData.textParams[key]];
        }

        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then(cr => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                this.modalData.text,
                textParams
            );

            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                modal.showOverlay(true, true);
                if (e.name === 'ok') {
                    const delRow = this.provider.deleteFromServer(this.params);
                    if (<any>delRow instanceof Observable){
                        delRow.subscribe(() =>{
                                this.provider.deleteRow({data: this.params}, this.id);
                                this.notificationRef.notifyShow(1, this.modalData.message);
                                modal.hide();
                            },
                            (err)=>{
                                let _err = (err as any);
                                if(_err.error){
                                    _err = _err.error;
                                }
                                if(_err.Error){
                                    _err = _err.Error;
                                }
                                if(_err.Message){
                                    _err = _err.Message
                                }
                                this.notificationRef.notifyShow(2, _err);
                                modal.hide();
                            });
                    }
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    isDisabledDelete(){
        return (this.provider as SlickGridProvider).isDisabledDelete(this.params);
    }

}

export function DeleteFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    let ctxs = columnDef.__contexts;

    return commonFormatter(DeleteFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



