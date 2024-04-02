import {
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    EventEmitter,
    ViewChild,
    Injector,
    HostListener, ElementRef
} from '@angular/core';
import {MediaDetailAppSettings} from './constants/constants';
import {LookupService} from '../../../services/lookup/lookup.service';
import {DetailConfig} from '../../../modules/search/detail/detail.config';
import {DetailProvider} from '../../../modules/search/detail/providers/detail.provider';
import {SearchThumbsProvider} from '../../../modules/search/thumbs/providers/search.thumbs.provider';
import {DetailThumbProvider} from "../../../modules/search/detail/providers/detail.thumb.provider";
import { IMFXRouteReuseStrategy } from '../../../strategies/route.reuse.strategy';
import { Router } from '@angular/router';
import {MediaGoldenProvider} from "./providers/media.gl.provider";
import {GoldenProvider} from "../../../modules/search/detail/providers/gl.provider";

@Component({
    moduleId: 'detail',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    providers: [
        MediaDetailAppSettings,
        LookupService,
        DetailProvider,
        SearchThumbsProvider,
        DetailThumbProvider,
        GoldenProvider,
        {provide: GoldenProvider, useClass: MediaGoldenProvider},
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class MediaDetailComponent {
    /**
     * Detail
     * @type {DetailConfig}
     */
    private detailConfig = <DetailConfig>{
        componentContext: this,
        options: {
            provider: <DetailProvider>null,
            needApi: true,
            typeDetails: "media-details",
            showInDetailPage: true,
            detailsviewType: "MediaDetails",
            friendlyNamesForDetail: "FriendlyNames.TM_MIS",
            data: {
                detailInfo: <any>null
            },
            onDataUpdated: new EventEmitter<any>(),
            detailsViews: []
        },
        layoutConfig: {
            content: [{
                type: 'row',
                content: [
                    {
                        type: 'component',
                        componentName: 'Data',
                        tTitle: 'Data',
                        title: 'Metadata',
                        width: 35
                    },
                    {
                        type: 'column',
                        content: [
                            {
                                type: 'component',
                                componentName: 'Media',
                                tTitle: 'Media'
                            },
                            {
                                type: 'stack',
                                content: [],
                                id: 'stackOfTabs'
                            }
                        ]
                    }
                ]
            }]
        },
        providerType: GoldenProvider
    };

    constructor(protected appSettings: MediaDetailAppSettings,
                protected detailProvider: DetailProvider,
                protected searchThumbsProvider: SearchThumbsProvider,
                protected injector: Injector,
                protected router: Router,
                public detailThumbProvider: DetailThumbProvider,
    ) {
        detailProvider.inducingComponent = 'media';
        this.detailConfig.options.provider = detailProvider;
        this.detailConfig.options.appSettings = this.appSettings;
    }

    isFirstLocation () {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    @ViewChild('nyan', {static: false}) public nyan: ElementRef;
    private secretKey = "nyancat";
    private secretWord = "";
    private inProgress = false;
    @HostListener('document:keyup', ['$event'])
    handleFunnyKeys(event: KeyboardEvent) {
        if(this.inProgress)
            return;

        this.secretWord += event.key.toLowerCase().trim();
        if(this.secretKey.startsWith(this.secretWord)) {
            if(this.secretWord == this.secretKey) {
                this.inProgress = true;
                $(this.nyan.nativeElement).addClass("run");
                setTimeout(()=>{
                    $(this.nyan.nativeElement).removeClass("run");
                    this.inProgress = false;
                }, 2000);
                this.secretWord = "";
            }
        }
        else {
            this.secretWord = "";
        }
    }
}
