import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Injectable,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import * as $ from 'jquery';
import {AiTabType} from "./models/ai.models";
import {AiTabService} from "./services/ai.service";
import {SafeResourceUrl} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'ai-tab',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        AiTabService
    ],
    entryComponents: []

})
@Injectable()
export class IMFXAiTabComponent {

    public setMarkers: EventEmitter<any> = new EventEmitter<any>();
    config: any;
    @ViewChild('tabsHeader', {read: ElementRef, static: false}) tabsHeader: ElementRef;
    @ViewChild('tableHeader', {read: ElementRef, static: false}) tableHeader: ElementRef;
    @ViewChild('tableBody', {read: ElementRef, static: false}) tableBody: ElementRef;
    private activeTab: AiTabType = AiTabType.Speech;
    private activeData = [];
    private activeDataFiltered = [];
    private speechData: any = [];
    private peopleData: any = [];
    private logosData: any = [];
    private ocrData: any = [];
    private adultData: any = [];
    private tagsData: any = [];
    private notesFilter = "";
    private overviewUrl: SafeResourceUrl;
    private wind;
    private destroyed$: Subject<any> = new Subject();

    constructor(protected cdr: ChangeDetectorRef,
                protected injector: Injector,
                protected translate: TranslateService,
                protected aiService: AiTabService) {
        this.wind = window;
    };

    ngOnInit() {
        this.aiService.getAiData(this.config.file.ID).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            this.speechData = res["SpeechToText"];
            this.peopleData = res["People"];
            this.logosData = res["Logos"];
            this.ocrData = res["Ocr"];
            this.adultData = res["Adult"];
            this.tagsData = res["AiTags"];
            this.activeData = this.speechData;
            this.activeDataFiltered = this.activeData;
            this.overviewUrl = res["OverviewUrl"];
        });
    };

    filterNotes() {
        this.activeDataFiltered = this.activeData && this.activeData.length > 0 ? this.activeData.filter(d => d.Notes.toLowerCase().indexOf(this.notesFilter.toLowerCase()) > -1) : [];
    }

    ngAfterViewChecked() {
        // if(this.tableHeader != undefined && this.tableBody != undefined) {
        //   //setTimeout(()=>{
        //     let headers = $(this.tableHeader.nativeElement).find('th');
        //     let rows = $(this.tableBody.nativeElement).find('.fake-rows');
        //     for(var i = 0; i < rows.length; i++) {
        //       rows[i].style.width = this.tableHeader.nativeElement.offsetWidth + "px";
        //       let columns = $(rows[i]).find('.fake-cell');
        //       for(var j = 0; j < headers.length; j++) {
        //         columns[j].style.width = headers[j].offsetWidth + "px";
        //       }
        //     }
        //   //},0);
        // }
        if (this.tabsHeader != undefined) {
            let text = $(this.tabsHeader.nativeElement).find('span');
            setTimeout(() => {
                if (this.destroyed$.isStopped) {
                    return;
                }
                if (this.tabsHeader.nativeElement.offsetWidth < 989 && $(text).is(":visible")) {
                    $(text).hide();
                } else if (this.tabsHeader.nativeElement.offsetWidth >= 989 && !($(text).is(":visible"))) {
                    $(text).show();
                }
            }, 0);
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    activateTab(tab: AiTabType, data) {
        this.activeTab = tab;
        this.activeData = data;
        this.activeDataFiltered = this.activeData;
        this.notesFilter = "";
    }

    setPlayerTime(item) {
        this.config.elem.emit('setTimecode', item);
    }
}
