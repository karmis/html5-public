import { Injectable } from '@angular/core';
import { IMFXModalComponent } from '../../imfx-modal/imfx-modal';
import { ExportComponent } from '../export';
import { IMFXSearchComponent } from '../../search/search.component';
import { CoreSearchComponent } from '../../../core/core.search.comp';
import {IMFXModalEvent} from "../../imfx-modal/types";

@Injectable()
export class ExportProvider {
    // ref to module
    moduleContext: ExportComponent;

    // ref to component
    componentContext: IMFXSearchComponent | CoreSearchComponent;

    // reference to modalComponent
    public exportModal: IMFXModalComponent;

    // current state of modal
    public modalIsOpen: boolean = false;

    // model for request
    private model: any = {};

    /**
     * Show modal
     */
    showModal() {
        this.exportModal.modalEvents.subscribe((e:IMFXModalEvent) => {
            if(e.name == 'show'){
                this.moduleContext.onShowModal();
                this.modalIsOpen = true;
            }
            if(e.name == 'shown'){
                this.moduleContext.onShownModal();
            }
            if(e.name == 'hide' || e.name == 'autohide'){
                this.modalIsOpen = false;
            }
        });
    }

    // updateModel(type, $event) {
    //     debugger;
    // }

    //
    // public moduleContext: RaiseWorkflowWizzardComponent;
    // public wizardModal: any;
    // public modallIsOpen: boolean = false;
    // public subscribersReady: boolean = false;
    //
    // constructor(@Inject(BasketService) private basketService: BasketService,
    //             @Inject(ModalProvider) private modalProvider: ModalProvider) {
    // }
    //
    // /**
    //  * On open modal
    //  */
    // public open(item, itemType) {
    //   this.modallIsOpen = true;
    //   let wizardComponent: RaiseWorkflowWizzardComponent = this.wizardModal.getContent();
    //
    //   // modalContent.setVersion(params.data.ID, params.data.TITLE);
    //   // this.uploadModal.onShow.subscribe(() => {
    //   //     uploadComponent.onShow()
    //   // });
    //   if (!this.subscribersReady) {
    //     this.subscribersReady = true;
    //     this.wizardModal.onShown.subscribe(() => {
    //       wizardComponent.onShow.emit(
    //      {'itemId': item.ID, 'itemType': itemType, 'itemTitle': item.TITLE});
    //     });
    //   }
    //   this.wizardModal.show();
    // }
}
