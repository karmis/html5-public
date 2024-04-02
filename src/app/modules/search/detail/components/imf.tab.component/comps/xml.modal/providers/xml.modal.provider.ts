import {Injectable} from "@angular/core";
import {XMLModalComponent} from "../xml.modal";
import {CoreSearchComponent} from "../../../../../../../../core/core.search.comp";
// import {ModalComponent} from "../../../../../../../modal/modal";

@Injectable()
export class XMLModalComponentProvider {
    // ref to module
    moduleContext: XMLModalComponent;

    // ref to component
    componentContext: CoreSearchComponent;

    // reference to modalComponent
    // public wizardModal: ModalComponent;

    // current state of modal
    public modalIsOpen: boolean = false;

    /**
     * Show modal
     */
    showModal() {
        this.modalIsOpen = true;
        this.moduleContext.onShow();
        // this.wizardModal.show(); // @TODO CHECK_MODALS
    }


}
