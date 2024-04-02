import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { LoadingIconsService } from "../../providers/loading-icons.service";
import { LIPageMode, LITypeImages, LITypeImagesServer } from "../../types";
import { Subscription } from "rxjs";
import { NotificationService } from "../../../../../../../../../modules/notification/services/notification.service";
import { TranslateService } from "@ngx-translate/core";

//     0: 'small logo (light theme)',
//     1: 'small logo (dark theme)',
//     2: 'search logo (light theme)',
//     3: 'search logo (dark theme)',
const typeImages: LITypeImages = {
    0: {
        DATA: null,
        TYPE_ID: 0,
        GROUP_ID: null,
        DATA_BASE64: null
    },
    1: {
        DATA: null,
        TYPE_ID: 1,
        GROUP_ID: null,
        DATA_BASE64: null
    },
    2: {
        DATA: null,
        TYPE_ID: 2,
        GROUP_ID: null,
        DATA_BASE64: null
    },
    3: {
        DATA: null,
        TYPE_ID: 3,
        GROUP_ID: null,
        DATA_BASE64: null
    },
    4: {
        DATA: null,
        TYPE_ID: 4,
        GROUP_ID: null,
        DATA_BASE64: null
    }
};

@Component({
    selector: 'loading-icons-detail',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [],
    encapsulation: ViewEncapsulation.None,
    providers: []
})
export class LoadingIconsDetailComponent implements OnInit, OnDestroy {

    settingsGroupName: string = '';
    loading: boolean = false;

    loadFiles: LITypeImages = JSON.parse(JSON.stringify(typeImages));
    pageMode: LIPageMode = "detail";

    getGroupSub: Subscription;
    pageModeChangedSub: Subscription;
    afterCreate = false;

    constructor(private loadingIconsService: LoadingIconsService,
                private cdr: ChangeDetectorRef,
                private notificationService: NotificationService,
                private translate: TranslateService) {

    }

    ngOnInit(): void {
        this.pageModeChangedSub = this.loadingIconsService.pageModeChanged.subscribe(mode => {
            this.pageMode = mode;
            // debugger
            if (this.pageMode === "detail") {
                if (!this.afterCreate) {
                    this.loadingIconsService.isLoadingChanged.next(true);
                }
                this.settingsGroupName = this.loadingIconsService.groupSelected.NAME;

                this.getGroupSub = this.loadingIconsService.getGroup().subscribe(img => {
                    img.forEach(el => {
                        this.loadFiles[el.TYPE_ID] = el;
                    });
                    this.loadingIconsService.isLoadingChanged.next(false);
                    this.cdr.detectChanges();
                });
                if (!(this.cdr as any).destroyed) {
                    this.cdr.detectChanges();
                }
            } else {
                this.afterCreate = false;
                this.settingsGroupName = '';
                this.loadFiles = JSON.parse(JSON.stringify(typeImages));
                // debugger
                this.cdr.detectChanges();
            }
        });
    }

    ngOnDestroy(): void {
        // this.getGroupSub.unsubscribe();
        this.pageModeChangedSub.unsubscribe();
    }

    uploadFile(base64, type: LITypeImagesServer) {
        this.loadFiles[type].DATA_BASE64 = base64;
        this.cdr.detectChanges();
    }

    isValid() {
        if (this.settingsGroupName.length === 0) {
            return false;
        }
        return true;
        // if (
        //     this.loadFiles['0'].DATA_BASE64 === null ||
        //     this.loadFiles['1'].DATA_BASE64 === null ||
        //     this.loadFiles['2'].DATA_BASE64 === null ||
        //     this.loadFiles['3'].DATA_BASE64 === null
        // ) {
        //     return false
        // } else {
        //     return true
        // }
    }

    saveImages() {
        this.loadingIconsService.isLoadingChanged.next(true);
        if (this.pageMode === 'new') { //save
            this.afterCreate = true;
            this.loadingIconsService.saveGroup({
                name: this.settingsGroupName,
                files: this.loadFiles
            }).subscribe((id: string) => {
                this.notificationService.notifyShow(1,
                    this.translate.instant("settings_group.loading_icons.save_group"),
                    true,
                    1000
                );

                this.loadingIconsService.selectGroup({NAME: this.settingsGroupName, ID: id});
                this.loadingIconsService.pageModeChanged.next("detail");
                this.loadingIconsService.loadingIconsChanged.next();
                this.loadingIconsService.isLoadingChanged.next(false);

            }, error => {
                this.notificationService.notifyShow(2,
                    this.translate.instant("settings_group.loading_icons.error_group"),
                    true,
                    1000
                );
                this.loadingIconsService.isLoadingChanged.next(false);
            });

        } else if (this.pageMode === 'detail') {
            this.loadingIconsService.editGroup({
                name: this.settingsGroupName,
                files: this.loadFiles
            }).subscribe((id: string) => {

                this.notificationService.notifyShow(1,
                    this.translate.instant("settings_group.loading_icons.save_group"),
                    true,
                    1000
                );
                this.loadingIconsService.loadingIconsChanged.next();
                this.loadingIconsService.isLoadingChanged.next(false);
            }, error => {
                this.loadingIconsService.isLoadingChanged.next(false);
                this.notificationService.notifyShow(2,
                    this.translate.instant("settings_group.loading_icons.error_group"),
                    false,
                    1000
                );
            });
        }
    }

    goBack() {
        this.loadingIconsService.pageModeChanged.next('list');
    }

}
