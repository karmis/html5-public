import {
    Component,
    EventEmitter,
    Injectable,
    Inject,
    Output,
    ViewEncapsulation,
    ChangeDetectorRef
} from '@angular/core';
import { LocatorsProvider } from '../../../../modules/controls/locators/providers/locators.provider';
import { LocatorsService } from '../../../../modules/controls/locators/services/locators.service';
import { CustomLabels } from "../../../../services/system.config/search.types";
import { SessionStorageService } from "ngx-webstorage";
import { TaggingSlickGridProvider } from "../../../../modules/search/detail/components/media.tagging.tab.component/providers/tagging.slick.grid.provider";
import { UtilitiesService } from "../../../../services/common/utilities.service";

@Component({
    selector: 'imfx-ce-locators',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [LocatorsService]
})
@Injectable()
export class CELocatorsComponent {
    @Output() onSaveMediaTagging: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSelectLocatorTab: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSetTaggingNode: EventEmitter<any> = new EventEmitter();
    @Output() onSetTimecodeString: EventEmitter<any> = new EventEmitter();

    active: string;
    // blackDetectedConfig: any;
    locatorTabConfig = {
        blackdetect: null,
        comments: null,
        legal: null,
        cuts: null,
    };
    config: any;
    customLabels: CustomLabels = {
        cuts: "Cuts",
        legal: "Legal",
        comments: "Comments"
    }

    constructor(private provider: LocatorsProvider,
                private service: LocatorsService,
                private cd: ChangeDetectorRef,
                private sessionStorage: SessionStorageService,
                private utilities: UtilitiesService) {
    };

    ngOnInit() {
        !this.config.options.provider ?
            this.config.options.provider = this.provider :
            this.provider = this.config.options.provider;

        !this.config.options.service ?
            this.config.options.service = this.service :
            this.service = this.config.options.service;
        for (let e in this.locatorTabConfig) {
            let series = this.config.series ? this.config.series.filter(function (el) {
                return el.TagType.toLocaleLowerCase() == e.toLocaleLowerCase();
            }) : [];
            // series = this.utilities.customLabels(series, 'TagType');
            const customLabels = this.utilities.getCustomLabels();
            this.locatorTabConfig[e] = {
                tagType: e.toLocaleLowerCase() === 'blackdetect' ? 'blackdetect' : customLabels[e],
                columns: e.toLocaleLowerCase() == 'blackdetect' ? this.config.blackDetectedColumns : this.config.commentsColumns,
                file: this.config.file,
                series,
                elem: this.config.elem,
                componentContext: this.config.componentContext,
                locatorsComponent: this,
                hasOuterFilter: false
            };
        }

        this.provider.config = this.config;
        this.setCustomLabels();
    };

    selectTab(active) {
        this.active = active;
        let mc = this.locatorTabConfig[this.active.toLocaleLowerCase()].moduleContext;
        mc && mc.unselectRow();
        this.onSelectLocatorTab.emit();
        this.config.elem.emit('clearMarkers', 1);
    }

    refresh(o) {
        const customLabels = this.utilities.getCustomLabels();
        for (let e in this.locatorTabConfig) {
            this.locatorTabConfig[e] = {
                tagType: e.toLocaleLowerCase() === 'blackdetect' ? 'blackdetect' : customLabels[e],
                columns: e.toLocaleLowerCase() == 'blackdetect' ? this.config.blackDetectedColumns : this.config.commentsColumns,
                file: o.file,
                series: o.series.filter(function (el) {
                    return el.TagType.toLocaleLowerCase() == e.toLocaleLowerCase();
                }),
                elem: this.config.elem,
                componentContext: this.config.componentContext,
                locatorsComponent: this,
                hasOuterFilter: false,
                hasTagColumn: e.toLocaleLowerCase() == 'blackdetect' ? false : true
            };
        }
        this.cd.detectChanges();
        this.onSelectLocatorTab.emit({series: o.series});
    }

    mediaTagging_onSetNode = o => {
        this.onSetTaggingNode.emit(o);
    };

    setTimecodeString = tc => {
        this.onSetTimecodeString.emit(tc);
    };

    setCustomLabels() {
        this.customLabels = this.utilities.getCustomLabels();
        this.cd.detectChanges();
    }
}
