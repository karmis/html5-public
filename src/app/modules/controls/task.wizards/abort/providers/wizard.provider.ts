import {Injectable} from "@angular/core";
import { CoreSearchComponent } from '../../../../../core/core.search.comp';
import { TaskWizardAbortComponent } from '../wizard';

@Injectable()
export class TaskWizardAbortComponentProvider {
    // ref to module
    moduleContext: TaskWizardAbortComponent;

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
