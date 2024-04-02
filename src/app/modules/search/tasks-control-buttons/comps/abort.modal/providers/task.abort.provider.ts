import {Injectable} from "@angular/core";
import {CoreSearchComponent} from "../../../../../../core/core.search.comp";
// import {ModalComponent} from "../../../../../modal/modal";
import {TaskAbortComponent} from "../task.abort.component";


@Injectable()
export class TaskAbortComponentProvider {
    // ref to module
    moduleContext: TaskAbortComponent;

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
        // this.moduleContext.onShow();
        // this.wizardModal.show();
    }


}
