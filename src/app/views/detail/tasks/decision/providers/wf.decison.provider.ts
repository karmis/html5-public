import {Inject, Injectable, Injector} from "@angular/core";
import {ManualDecisionType, WorkflowDecisionService} from "../services/wf.decision.service";
import {Observable} from "rxjs";
import {ManualDecisionTaskPartialType} from "../comp";

@Injectable()
export class WorkflowDecisionProvider {
    constructor(private injector: Injector){
    }

    getManualDecision(id: number): Observable<ManualDecisionType> {
        let wfDecisionService: WorkflowDecisionService = this.injector.get(WorkflowDecisionService);

        return wfDecisionService.getManualDecision(id);
    }

    saveManualDecision(id: number, data: ManualDecisionTaskPartialType): Observable<ManualDecisionType> {
        let wfDecisionService: WorkflowDecisionService = this.injector.get(WorkflowDecisionService);

        return wfDecisionService.saveManualDecision(id, data);
    }


}
