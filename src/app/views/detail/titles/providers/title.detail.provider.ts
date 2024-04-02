import {ComponentRef, Injectable, Injector} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {SessionStorageService} from "ngx-webstorage";
import {TranslateService} from "@ngx-translate/core";
import {DetailProvider} from "../../../../modules/search/detail/providers/detail.provider";
import {NotificationService} from "../../../../modules/notification/services/notification.service";
import {IMFXModalProvider} from "../../../../modules/imfx-modal/proivders/provider";
import {SaveDefaultLayoutModalComponent} from "../../../../modules/search/detail/components/modals/save.default.layout.modal/save.default.layout.modal.component";
import {IMFXModalEvent} from "../../../../modules/imfx-modal/types";
import {IMFXModalComponent} from "../../../../modules/imfx-modal/imfx-modal";
import {appRouter} from "../../../../constants/appRouter";
import {ChangeDateByModalComponent} from "../comps/change.date.modal/change.date.modal"
import {lazyModules} from "../../../../app.routes";
import {takeUntil} from "rxjs/operators";
import { DetailComponent } from "../../../../modules/search/detail/detail";


@Injectable()
export class TitleDetailProvider extends DetailProvider {
    constructor(public route: ActivatedRoute,
                public location: Location,
                public storage: SessionStorageService,
                public router: Router,
                public translate: TranslateService,
                public injector: Injector,
                protected notificationService: NotificationService) {
        super(route, location, storage, router, translate, injector, notificationService);
    }

    changeDeadlineDate() {
        const modalProvider = this.injector.get(IMFXModalProvider);
        const ids = [(<any>this.file).ID];
        const modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.change_date_by_modal,
            ChangeDateByModalComponent, {
                size: 'sm',
                title: 'Change Deadline Date',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            }, {
                ids: ids,
                date: (<any>this.file).DEADLINE_DT,
                provider: this
            });
        modal.load().then((compRef: ComponentRef<any>) => {
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    (<any>this.file).DEADLINE_DT = e.state.newDate;

                    const golden = (<DetailComponent>this.config.moduleContext).golden;
                    golden.refreshComponent.emit({file: this.file, title: 'Titles'});
                    golden.refreshComponent.emit({file: this.file, title: 'Metadata'});
                }
            });
        })
    }
}
