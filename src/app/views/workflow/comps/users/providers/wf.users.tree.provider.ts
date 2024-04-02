import {IMFXControlTreeProvider} from "../../../../../modules/controls/tree/providers/control.tree.provider";
import {Injectable} from "@angular/core";
import {WorkflowUsersComponent} from "../users";

@Injectable()
export class WFUsersIMFXControlTreeProvider extends IMFXControlTreeProvider {
    onDrop(event, externalCompReference: WorkflowUsersComponent) {
        if (externalCompReference.isAccessibleNode(event)) {
            externalCompReference.onDrop(event);
            externalCompReference.highlightOff(event);
        }
    }

    onDragEnter(event, externalCompReference: WorkflowUsersComponent) {
        if (externalCompReference.isAccessibleNode(event)) {
            externalCompReference.highlightOn(event);
        }
    }

    onDragOver(event, externalCompReference: WorkflowUsersComponent) {
        if (externalCompReference.isAccessibleNode(event)) {
            externalCompReference.highlightOn(event);
        }
    }

    onDragLeave(event, externalCompReference: WorkflowUsersComponent) {
        externalCompReference.highlightOff(event);
    }

}
