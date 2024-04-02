import {
    ChangeDetectionStrategy,
    Component, ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {SessionStorageService} from "ngx-webstorage";
import {VideoBrowser} from "../../../../../../../../../services/system.config/search.types";

@Component({
    selector: 'google-maps-api',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class GoogleMapsApiComponent {
    @Input('googleMapsApiSettings') private googleMapsApiSettings;
    @Output('changedGoogleMapsApiSettings') private changedGoogleMapsApiSettings: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('apiKeyElem', {static: false}) public apiKeyElem: ElementRef;
    private apiKey: string = '';
    // private fakeApiKey: string = '';
    private apiKeyIsVisible: boolean = false;

    constructor(public sessionStorage: SessionStorageService) {
    }
    ngOnInit() {
        this.apiKey = this.googleMapsApiSettings.apiKey;
    }
    // onSearchChange(value) {
    // }
    onChangeGoogleMapsApiSettings() {
        this.changedGoogleMapsApiSettings.emit({
            'apiKey': this.apiKey
        });
    }
    showHideApiKey() {
        let input = $(this.apiKeyElem.nativeElement);
        this.apiKeyIsVisible = !this.apiKeyIsVisible;
        if (input.attr('type') === "password") {
            input.attr('type', 'text');
        } else {
            input.attr('type', 'password');
        }
    }
}
