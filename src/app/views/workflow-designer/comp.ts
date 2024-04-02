import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SettingsGroupsService } from "../../services/system.config/settings.groups.service";
import { Location } from "@angular/common";

@Component({
    selector: 'mediaproxy-logplayer',
    templateUrl: './tpl/index.html',
    styleUrls: ['./styles/index.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class WorkflowDesignerComponent {

    private sub: any;
    @ViewChild('overlay', {static: false}) private overlay: any;
    // private src = 'https://mfxtest.tmd.tv/software/html5.html';
    private src = 'https://mfxtest.tmd.tv/software/html5.html';

    constructor(private route: ActivatedRoute,
                private cdr: ChangeDetectorRef,
                private location: Location,
                private settingsGroupsService: SettingsGroupsService) {
    }

    ngOnInit() {
        // this.settingsGroupsService.getSettingsGroupById(0, true).subscribe((res: any) => {
        //     if (res) {
        //         let data = {
        //             "ID": res.ID,
        //             "NAME": res.NAME,
        //             "DESCRIPTION": res.DESCRIPTION,
        //             "TM_SETTINGS_KEYS": res.TM_SETTINGS_KEYS
        //         };
        //         let loggerData;
        //         if (data.TM_SETTINGS_KEYS) {
        //             loggerData = data.TM_SETTINGS_KEYS.filter(el => el.KEY == "globallogger")[0];
        //         }
        //         if (loggerData) {
        //             let mediaLoggerData = <LoggerData>JSON.parse(loggerData.DATA);
        //             this.src = mediaLoggerData.MediaProxyLogger;
        //             setTimeout(() => {
        //                 $('#MediaProxyLogPlayerComponentPlayer').attr('src', this.getSrc());
        //             })
        //         }
        //     }
        // });
    }


    getSrc() {
        return this.src;
    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    clickBack() {
        this.overlay.showWhole();
        setTimeout(() => {
            this.location.back();
        }, 600);
    }
}
