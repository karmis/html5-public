import {ApplicationRef, ComponentFactoryResolver, ComponentRef, Inject, Injector} from '@angular/core';
import {SlickGridProvider} from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import {IMFXModalComponent} from 'app/modules/imfx-modal/imfx-modal';
import {lazyModules} from 'app/app.routes';
import {RaiseWorkflowWizzardComponent} from 'app/modules/rw.wizard/rw.wizard';
import {IMFXModalProvider} from 'app/modules/imfx-modal/proivders/provider';
import {WorkflowListComponent} from "../../workflow/comps/wf.list.comp/wf.list.comp";

export class CarrierSlickGridProvider extends SlickGridProvider {
    compFactoryResolver?: ComponentFactoryResolver;
    appRef?: ApplicationRef;

    constructor(
        @Inject(Injector) public injector: Injector,
        protected modalProvider: IMFXModalProvider
    ) {
        super(injector);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }

    clickOnIcon(event): boolean {
        return ($(event.target).hasClass('icons-addbasket') ||
            $(event.target).hasClass('icons-inbasket') ||
            $(event.target).hasClass('media-basket-button') ||
            $(event.target).hasClass('icons-more') ||
            $(event.target).hasClass('settingsButton')) &&
            $(event.target).closest('.slick-cell').hasClass('selected');
    }

    showRaiseWorkflowWizzard($events, rowData) {
        const modalProvider = this.injector.get(IMFXModalProvider);

        const modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.wf_raise,
            RaiseWorkflowWizzardComponent, {
                title: 'rwwizard.title',
                size: 'md',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            });

        modal.load().then((compRef: ComponentRef<RaiseWorkflowWizzardComponent>) => {
            const comp: RaiseWorkflowWizzardComponent = compRef.instance;
            const items: number[] | number = this.getSelectedRows().map(item => item.ID);

            // if (items.length === 1) {
            //     items = items[0]
            // }

            comp.rwwizardprovider.open(
                items,
                'Tape',
                null,
                {
                    // showZeroStep: false,
                    VersionSourceType: 'tape'
                });
        });

    }

    activeWorkflows(): void {
        const data = this.getSelectedRowData();
        const modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.wf_list,
            WorkflowListComponent, {
                title: 'misr.wf_list',
                size: 'xl',
                position: 'center',
                footer: 'close'
            });

        modal.load().then((compRef: ComponentRef<WorkflowListComponent>) => {
            const modalContent: WorkflowListComponent = compRef.instance;
            modalContent.loadData([data.ID], 'tape');
        });

    }
}
