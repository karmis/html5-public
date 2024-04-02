import {
    Input,
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ChangeDetectorRef, Injector, ViewChild, ElementRef, Output, EventEmitter
} from '@angular/core';
import {LookupService} from "../../../../../services/lookup/lookup.service";
import {Observable, Subject, Subscription} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'media-language-list-component',
  templateUrl: 'tpl/index.html',
  styleUrls: [
    'styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MediaLanguageListComponent {
    @Input() languages: Array<any>;
    @Input() defaultFile: any;
    @Input() config: any;
    @Input() onSetReadOnly: Subject<any> = new Subject();

    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDataChanged: EventEmitter<any> = new EventEmitter();

    @ViewChild('lang', {static: false}) private lang: ElementRef;
    public datetimeFullFormatLocaldatePipe: string = 'DD/MM/YYYY HH:mm';
    private selectedItemIndex = 0;
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private translate: TranslateService,
                public injector: Injector) {
        this.translate.get('common.date_time_full_format_localdate_pipe').subscribe(
            (res: string) => {
                this.datetimeFullFormatLocaldatePipe = res;
            });
        this.onSetReadOnly.pipe(
            takeUntil(this.destroyed$)
        ).subscribe(data => {
            this.setReadOnly(data);
        });
    };

    ngOnInit() {
        this.loadLanguages(this.config.lookup).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            this.cdr.detectChanges();
        });
    };
    ngAfterViewInit() {}

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    loadLanguages(lookup): Observable<Subscription> {
        return new Observable((observer: any) => {
            let service = this.injector.get(LookupService);
            service.getLookups(lookup).pipe(
                takeUntil(this.destroyed$)
            ).subscribe(
                (resp) => {
                    this.languages = resp;
                    return observer.next(resp);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                }
            );
        });
    };
    setLang(val, item) {
        item.AUD_LANGUAGE_ID = val;
        this.onDataChanged.emit();
    }
    onRadioChange(val) {
        this.config.items[this.selectedItemIndex].ACCEPTANCE_LTTR_ID = val;
        this.onDataChanged.emit();
    }


    setReadOnly(readOnly) {
        this.config.readOnly = readOnly;
        this.cdr.detectChanges();
    }
    public selectItem(itemId) {
        let index = this.config.items.findIndex(x => x.ID == itemId);
        this.selectedItemIndex = index;
        this.onSelect.emit({file: this.config.items[index]});
    }
    public selectItemFormExternal(itemId) {
        let index = this.config.items.findIndex(x => x.ID == itemId);
        this.selectedItemIndex = index;
    }

    //
    // public loadComponentData() {
    // };
    //
    // public refresh(readOnly) {
    // };
}
