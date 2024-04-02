import {Injectable} from "@angular/core";

import {CoreSearchComponent} from "../../../../../../core/core.search.comp";
import {TasksWizardPriorityComponent} from "../wizard";
// import {ModalComponent} from "../../../../../../modules/modal/modal";

@Injectable()
export class TasksWizardPriorityComponentProvider {
    // ref to module
    moduleContext: TasksWizardPriorityComponent;

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
        // this.wizardModal.show();
    }
}
