import {ChangeDetectorRef, Component, EventEmitter, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {LocalStorageService} from "ngx-webstorage";
import {ProfileService} from '../../../../services/profile/profile.service';
import {TranslateService} from '@ngx-translate/core';
import {Select2ItemType, Select2ListTypes} from "../../../../modules/controls/select2/types";
import {IMFXControlsSelect2Component} from "../../../../modules/controls/select2/imfx.select2";
import {appRouter} from "../../../../constants/appRouter";
import {SecurityService} from "../../../../services/security/security.service";

@Component({
    selector: 'profile-defaultpage',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: []
})
export class ProfileDefaultPageComponent {
    @ViewChild('selectDefaultPage', {static: false}) private dropdownModule: IMFXControlsSelect2Component;
    private defaultPage: string;
    private allowedPages: Select2ListTypes = [];
    @Output() private changedDefaultPage: EventEmitter<any> = new EventEmitter<any>();

    private defaultPageSubscription;
    private storagePrefix = 'config.user.preferences';
    public appRouter = appRouter;
    constructor(private storageService: LocalStorageService,
                private cdr: ChangeDetectorRef,
                private translate: TranslateService,
                private profileService: ProfileService,
                private securityService: SecurityService) {
        let compRef = this;
        this.defaultPageSubscription = this.profileService.defaultPage.subscribe(page => {
            this.defaultPage = page;
            setTimeout(() => {
                this.selectPage();
                compRef.defaultPageSubscription.unsubscribe();
            });
        });
    }

    private groupDefaultPage: Select2ItemType = null;

    ngOnInit() {
        this.allowedPages = this.profileService.getAllowedPages(true);
        // this.groupDefaultPage = this.profileService.getGroupDefaultPage();
    }

    ngAfterViewInit() {
        if (!this.defaultPage) {
            this.defaultPage = this.storageService.retrieve(this.storagePrefix + '.' + 'default_page').replace(/["'\\]/g, "");
        }
        this.dropdownModule.setData(this.allowedPages, true);
        this.selectPage();
    }

    selectPage() {
        this.setSelectedPage();
    }

    setSelectedPage() {
        this.dropdownModule.setSelectedByIds([this.defaultPage]);
    }

    onSelectPage($event) {
        let data = $event.params.data.length && $event.params.data.length > 0 ? $event.params.data[0] : $event.params.data;
        this.defaultPage = data.id;
        this.changedDefaultPage.emit(this.defaultPage);
    }

    hasPermission(path) {
        //return true;
        return this.securityService.hasPermissionByPath(path);
    }
}

