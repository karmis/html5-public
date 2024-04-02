/**
 * Created by Sergey Trizna on 26.01.2018.
 */
import { SlickGridPanelTopComp } from "../../../../../modules/search/slick-grid/comps/panels/top/top.panel.comp";
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";

@Component({
    selector: 'wf-slickgrid-top-panel',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class WorkflowSlickGridPanelTopComp extends SlickGridPanelTopComp  {
    // private data: SlickGridPanelData;
    // constructor(private cdr: ChangeDetectorRef,
    //             private injector: Injector) {
    //     super();
    //     // ref to component
    //     // modal data
    //     this.data = this.injector.get('data');
    // }
    //
    // onShow(){
    //     console.log('OnShowPanel');
    //     // debugger
    // }
    //
    // onHide(){
    //     console.log('OnHidePanel');
    //     // debugger;
    // }
    //
    //
    // openPriorityWizard() {
    //     let comp: WorkflowComponent = (<WorkflowComponent>this.data.slickGridProvider.componentContext);
    //     let provider: WorkflowWizardPriorityComponentProvider = comp.wizardGroupPriorityConfig.options.content.options.provider;
    //     provider.showModal();
    // }
    //
    // openAbortWizard() {
    //     let comp: WorkflowComponent = (<WorkflowComponent>this.data.slickGridProvider.componentContext);
    //     let provider: WorkflowWizardAbortComponentProvider = comp.wizardGroupAbortConfig.options.content.options.provider;
    //     provider.showModal();
    // }
}
