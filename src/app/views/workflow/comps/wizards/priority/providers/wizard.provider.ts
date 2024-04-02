import {Injectable} from "@angular/core";

import {CoreSearchComponent} from "../../../../../../core/core.search.comp";
import {WorkflowWizardPriorityComponent} from "../wizard";
// import {ModalComponent} from "../../../../../../modules/modal/modal";

@Injectable()
export class WorkflowWizardPriorityComponentProvider {
    // ref to module
    moduleContext: WorkflowWizardPriorityComponent;

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
