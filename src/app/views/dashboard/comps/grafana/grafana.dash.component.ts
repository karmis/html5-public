import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
// import 'style-loader!jointjs/dist/joint.min.css';
import {ThemesProvider} from '../../../../providers/design/themes.providers';
import {ProfileService} from '../../../../services/profile/profile.service';

@Component({
    moduleId: 'grafana',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../modules/styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    providers: [
        ThemesProvider
    ]
})
export class GrafanaDashComponent {

    @Input() targetWidget;
    @Input() autoRefresh;
    @Input() showedInterval;
    @Input() headerTitle: string;
    @Output() eventClicked: EventEmitter<any> = new EventEmitter();
    @Output() eventHovered: EventEmitter<any> = new EventEmitter();
    @ViewChild('overlay', {static: false}) private overlay: any;
    @ViewChild('grafanawrapper', {static: false}) private grafanawrapper: any;

    private targetPath;
    private theme;
    private load: boolean = false;
    private error: boolean = false;

    constructor(private cd: ChangeDetectorRef,
                private themesProvider: ThemesProvider,
                private profileService: ProfileService
    ) {
    }

    ngOnInit() {
        // + '&theme=' + () &refresh= &from=now-5m&to=now
        //this.overlay.show(this.grafanawrapper.nativeElement);
        if (this.autoRefresh && this.autoRefresh != '-') {
            this.targetWidget = this.updateQueryStringParameter(this.targetWidget, 'refresh', this.autoRefresh);
        }

        if (this.showedInterval && this.showedInterval != '-') {
            this.targetWidget = this.updateQueryStringParameter(this.targetWidget, 'from', this.showedInterval.split('|')[0]);
            this.targetWidget = this.updateQueryStringParameter(this.targetWidget, 'to', this.showedInterval.split('|')[1]);
        }
        this.theme = $('.common-app-wrapper').hasClass('default') ? 'default' : 'dark';
        this.profileService.colorSchemaChanged.subscribe((res: any) => {
            debugger
            this.theme = res;
        });


        let self = this;
        setTimeout(() => {
            if ($(self.grafanawrapper.nativeElement).is(":visible")) {
                self.overlay.showWithoutButton(self.grafanawrapper.nativeElement);
            }
            let $drag = $('.lm_dragProxy');
            if ($drag.length == 1) {
                $('.loadingoverlay').css('display', 'none');
            }
            let $iframe = $(self.grafanawrapper.nativeElement).find('iframe');
            $iframe[0].onload = function () {
                self.overlay.hide(self.grafanawrapper.nativeElement);
                self.load = true;
            };
            setTimeout(() => {
                if (!self.load) {
                    self.overlay.hide(self.grafanawrapper.nativeElement);
                    self.error = true;
                    self.cd.markForCheck();
                }
            }, 15000);
        });
    }

    updateQueryStringParameter(uri, key, value) {
        var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
        var separator = uri.indexOf('?') !== -1 ? '&' : '?';
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + '=' + value + '$2');
        } else {
            return uri + separator + key + '=' + value;
        }
    }

    // events
    public grafanaClicked(e: any): void {
        this.eventClicked.emit(e);
    }

    public grafanaHovered(e: any): void {
        this.eventHovered.emit(e);
    }
}
