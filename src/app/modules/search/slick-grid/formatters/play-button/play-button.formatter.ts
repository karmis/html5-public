import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Injector, ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {
    SlickGridButtonFormatterEventData, SlickGridColumn, SlickGridFormatterData, SlickGridRowData,
    SlickGridTreeRowData
} from "../../types";
import {commonFormatter} from "../common.formatter";
import {SlickGridProvider} from "../../providers/slick.grid.provider";
import { DetailMediaTabGridProvider } from '../../../detail/components/media.tab.component/providers/grid.provider';
import { NativeNavigatorProvider } from '../../../../../providers/common/native.navigator.provider';

@Component({
    selector: 'play-button-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PlayButtonFormatterComp {
    @ViewChild('buttonControl', {static: false}) private buttonControl: ElementRef;
    @ViewChild('buttonControlWrap', {static: false}) private buttonControlWrap: ElementRef;
    private params: SlickGridFormatterData;
    private column: SlickGridColumn;
    public injectedData: { data: SlickGridFormatterData };
    private provider: DetailMediaTabGridProvider;
    private stateActivity: boolean = false;
    private showLikeButton: boolean = false;
    private playable: boolean = false;
    private isVideo: boolean = false;
    private isRelatedAudio: boolean = false;
    private showOverlay: boolean = false;
    private loadingError: boolean = false;
    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef,
                private nativeNavigatorProvider: NativeNavigatorProvider) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.column = (<any>this.injectedData).data.columnDef;
        this.provider = this.column.__contexts.provider;
        this.isRelatedAudio = (<any>this.params.columnDef).isRelatedAudio || false;
    }

    ngOnInit() {
        if (this.params.data && this.params.data['PROXY_URL'] &&
            this.params.data['PROXY_URL'].length > 0 &&
            this.params.data['PROXY_URL'].match(/^(http|https):\/\//g) && this.params.data['PROXY_URL'].match(/^(http|https):\/\//g).length > 0 ||
            this.params.data['UsePresignedUrl']
        ) {
            this.playable = true;
        }
        if (!this.isRelatedAudio) {
            const isEdge = this.nativeNavigatorProvider.isEdge();
            if (this.params.data && this.params.data['MEDIA_FORMAT_text'] == 'WEBM' && isEdge) {
                this.playable = false;
            }

            if (this.params.data && (this.params.data['MediaTypeOriginal'] === 100 || this.params.data['MediaTypeOriginal'] === 150)) {
                this.isVideo = true;
            }
        }
    }

    ngAfterViewInit() {
        this.provider.formatterPlayButtonOnLoading.subscribe((res: any) => {
            if (this.provider.formatterPlayButtonActiveId == this.params.data.id) {
                this.showOverlay = res;
            } else {
                this.showOverlay = false;
            }
        });
        this.provider.formatterPlayButtonOnLoadingError.subscribe((res: any) => {
            if (this.provider.formatterPlayButtonActiveId == this.params.data.id) {
                this.loadingError = res;
            } else {
                this.loadingError = false;
            }
            this.showOverlay = false;
        });
        // $(this.buttonControlWrap.nativeElement).parent().parent().addClass('skipSelection');

        // this.provider.formatterPlayButtonOnDeactive.subscribe()
        // this.stateActivity = this.params.data.id == this.provider.formatterPlayButtonActiveId;
    }

    onClick($event) {
        if(!this.playable)
            return;

        this.stateActivity = !this.stateActivity;
        this.loadingError = false;
        if (this.provider.formatterPlayButtonActiveId == this.params.data.id) {
            this.provider.formatterPlayButtonActiveId = 'none';
            this.stateActivity = false;
            this.showOverlay = false;
        } else {
            this.provider.formatterPlayButtonActiveId = this.params.data.id;
        }

        let isPlay = this.provider.formatterPlayButtonActiveId != 'none';

        // cancel onClick_cb(onRowMouseclick) in DetailMediaTabGridProvider
        if (this.provider.lastSelectedRow
            && (this.provider.lastSelectedRow.ID === this.params.data.ID)
        ) {
            $event.stopPropagation();
        }

        this.provider.formatterPlayButtonOnClick.emit({data: this.params, value: isPlay});
    }
}
export function PlayButtonFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(PlayButtonFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}


