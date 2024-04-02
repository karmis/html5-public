import {EventEmitter, Injectable} from "@angular/core";
// import {ModalComponent} from "../../../../modal/modal";
import {LoadLayoutModalComponent} from "./load.layout.modal.component";
import {LayoutManagerModel, LayoutType} from "../../models/layout.manager.model";

@Injectable()
export class LoadLayoutModalProvider {
  moduleContext: LoadLayoutModalComponent;
  // public loadLayoutModal: ModalComponent;
  public modalIsOpen: boolean = false;

  constructor() {
  }

  showModal(layoutType: LayoutType, layout: LayoutManagerModel, changeEmitter: EventEmitter<LayoutManagerModel>) {
    this.moduleContext.toggleOverlay(true);
    this.moduleContext.setType(layoutType, layout, changeEmitter);

    // this.loadLayoutModal.onShow.subscribe(() => {
    //   this.modalIsOpen = true;
    // });
    // this.loadLayoutModal.onShown.subscribe(() => {
    //
    // });
    // this.loadLayoutModal.onHide.subscribe(() => {
    //   this.modalIsOpen = false;
    // });
    //
    // this.loadLayoutModal.show(); // @TODO CHECK_MODALS
  }
}
