import { Component, ElementRef, Injectable, Input, ViewEncapsulation } from '@angular/core';
import { TextMarkerConfig } from './imfx.text.marker.config';
import { fromEvent } from 'rxjs';
import {debounceTime} from "rxjs/operators";


@Component({
    selector: 'search-text-for-mark',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

@Injectable()
export class IMFXTextMarkerComponent {
    private _mutedFollow: boolean = true;
    get mutedFollow(): boolean {
        return this._mutedFollow;
    }
    @Input() searchResource: any;
    @Input() externalSearchText: string;
    public config = <TextMarkerConfig>{
        componentContext: null,
        moduleContext: this,
        options: {
            filterText: null,
            selectedItem: -1,
            maxItems: 0,
            showResults: false,
            arrOfResults: []
        }
    };

    constructor(private elementRef: ElementRef) {
        fromEvent(elementRef.nativeElement, 'keyup')
            .pipe(debounceTime(300))
            .subscribe(kEvent => {
                this.searchKeyUp();
            });
    };

    @Input('config') set setConfig(config) {
        this.config = $.extend(true, this.config, config);
    }

    ngOnInit() {
        this.config.componentContext.textMarkerConfig.moduleContext = this;
        if (this.externalSearchText !== '') {
            this.config.options.filterText = this.externalSearchText;
        }
    };

    public searchKeyUp(): void {
        // delete old highlight
        $('span.highlight').each(function () {
            $(this).after($(this).html()).remove();
        });
        if (this.config.options.filterText == undefined || this.config.options.filterText == null) {
            this.config.options.showResults = false;
            return;
        }
        if (this.config.options.filterText == '') {
            if (!!this.config.moduleContext.textMarkerOptions) {
                this.config.moduleContext.textMarkerOptions.searchText = this.config.options.filterText;
            } else {
                this.config.moduleContext.textMarkerOptions = {
                    searchText: '',
                    selectedItem: 0
                };
            }
            this.config.moduleContext.textMarkerOptions.searchText = this.config.options.filterText;
            this.config.options.maxItems = 0;
            this.config.options.showResults = false;
            this.config.componentContext.refreshSlickGrid();

            return;
        };
        this.config.options.showResults = true;
        this.filterSearchResource();
    };

    public filterSearchResource() {
        this.config.options.arrOfResults = [];
        let temp = this.config.options.filterText.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
        for (var index in this.searchResource) {
            if (this.searchResource.hasOwnProperty(index)) {
                let res = this.searchResource[index].Text.match(new RegExp(temp !== '' ? temp : this.config.options.filterText, 'ig'));
                if (res && res.length > 0) {
                    this.config.options.arrOfResults.push(parseFloat(index));
                }
            }
        }
        this.config.options.maxItems = this.config.options.arrOfResults.length;
        this.config.options.selectedItem = 0;

        // if no results
        if (this.config.options.arrOfResults.length === 0) {
            this.config.moduleContext.textMarkerOptions = {
                searchText: '',
                selectedItem: 0
            };
        }
        else {
            this.config.moduleContext.textMarkerOptions = {
                searchText: temp !== '' ? temp : this.config.options.filterText,
                selectedItem: this.config.options.arrOfResults[0]
            };

            this.config.componentContext.refreshSlickGrid();
            new Promise((resolve, reject) => {
                resolve();
            }).then(() => {
                this.gotoNext();
                }, (err) => {
                    console.log(err);
                }
            );
        }
    };

    public gotoNext() {
        if (this.config.options.maxItems <= 0) return;
        if (this.config.options.selectedItem == this.config.options.maxItems) {
            this.config.options.selectedItem = 1;
        }
        else {
            this.config.options.selectedItem++;
        }
        this.config.moduleContext.textMarkerOptions.selectedItem = this.config.options.arrOfResults[this.config.options.selectedItem - 1];
        this.markText();
        this.config.componentContext.scrollToIndex(this.config.options.arrOfResults[this.config.options.selectedItem - 1]);
        // this.config.componentContext.onSelectRow(this.config.options.arrOfResults[this.config.options.selectedItem - 1]);
    };

    public gotoPrev() {
        if (this.config.options.maxItems <= 0) return;
        if (this.config.options.selectedItem == 1) {
            this.config.options.selectedItem = this.config.options.maxItems;
        }
        else {
            this.config.options.selectedItem--;
        }

        this.config.moduleContext.textMarkerOptions.selectedItem = this.config.options.arrOfResults[this.config.options.selectedItem - 1];
        this.markText();

        this.config.componentContext.scrollToIndex(this.config.options.arrOfResults[this.config.options.selectedItem - 1]);
        // this.config.componentContext.onSelectRow(this.config.options.arrOfResults[this.config.options.selectedItem - 1]);
    };

    public clear() {
        this.config.options.filterText = '';
        this.searchKeyUp();
    };

    public muteFollow() {
        this._mutedFollow = !this._mutedFollow;

        // this.config.options.filterText = '';
        // this.searchKeyUp();
    };

    private markText() {
        $('span.highlight.selected').each(function () {
            $(this).removeClass('selected');
        });
        $('span.highlight[imfx-select=' + this.config.options.arrOfResults[this.config.options.selectedItem - 1] + ']').addClass('selected');
    }
}
