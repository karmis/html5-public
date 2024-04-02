/**
 * Created by dvvla on 28.09.2017.
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnInit,
    Output, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ThemesProvider } from "../../../../../../../../../providers/design/themes.providers";
import { Subscription } from 'rxjs';
import { Select2ItemType } from "../../../../../../../../../modules/controls/select2/types";
import { ProfileService } from "../../../../../../../../../services/profile/profile.service";
import { CustomLabels } from "../../../../../../../../../services/system.config/search.types";
import {
    IMFXControlsSelect2Component,
    Select2EventType
} from "../../../../../../../../../modules/controls/select2/imfx.select2";
import {TranslateService} from "@ngx-translate/core";
import {LayoutType} from "../../../../../../../../../modules/controls/layout.manager/models/layout.manager.model";
import {LayoutManagerService} from "../../../../../../../../../modules/controls/layout.manager/services/layout.manager.service";

@Component({
    selector: 'settings-groups-detail-defaults',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        LayoutManagerService
    ]
})

export class SettingsGroupsDetailsDefaultsComponent implements OnInit {
    @Input('configDefault') private configDefault: any;
    @Output('onChangeDefaultDefaultLayoutForType') private onChangeDefaultDefaultLayoutForType: EventEmitter<any> = new EventEmitter<any>();
    @Output('changedDefaultSearch') private changedDefaultSearch: EventEmitter<any> = new EventEmitter<any>();
    @Output('changedDefaultHomePage') private changedDefaultHomePage: EventEmitter<string> = new EventEmitter<string>();
    @Output('changedDefaultHelpdeskUrl') private changedDefaultHelpdeskUrl: EventEmitter<string> = new EventEmitter<string>();
    @Output('changedDefaultCustomLabels') private changedDefaultCustomLabels: EventEmitter<CustomLabels> = new EventEmitter<CustomLabels>();

    private theme = 'default';
    private themesChangedSubscr: Subscription;
    public allowedPages: Select2ItemType[] = [];
    public searchTypes: Select2ItemType[] = [];
    customLabels: CustomLabels = {
        comments: null,
        legal: null,
        cuts: null,
    };

    constructor(private themesProvider: ThemesProvider,
                @Inject(ChangeDetectorRef) protected cd: ChangeDetectorRef,
                private translate: TranslateService,
                private layoutManagerService: LayoutManagerService,
                private profileService: ProfileService) {
        this.themesChangedSubscr = this.themesProvider.changed.subscribe((res: any) => {
            this.theme = this.themesProvider.getCurrentTheme();
            this.cd.detectChanges();
        });
    }

    ngOnInit() {
        this.theme = this.themesProvider.getCurrentTheme();
        this.allowedPages = this.profileService.getAllowedPages();
        this.searchTypes = this.configDefault.searchTypesKeys.map(el => ({
            id: el,
            text: (this.translate.instant('settings_group.search_types.' + this.configDefault.searchTypes[el]))
        }));
        this.customLabels =  JSON.parse(JSON.stringify( this.configDefault.customLabels));
    }

    ngAfterViewInit() {
        this.InitLayoutSelectors();
    }

    searchChange($event: Select2EventType) {
        let value = $event.params.data[0] && $event.params.data[0].id || null;
        this.changedDefaultSearch.emit(value);
    }

    homePageChange($event: Select2EventType) {
        let value = $event.params.data[0] && $event.params.data[0].id || null;
        this.changedDefaultHomePage.emit(value);
    }

    changedHelpdeskUrl(s) {
        this.changedDefaultHelpdeskUrl.emit(s.target.value);
    }

    changedCustomLabels() {
        this.changedDefaultCustomLabels.emit({
            cuts: this.customLabels.cuts,
            legal: this.customLabels.legal,
            comments: this.customLabels.comments,
        });
    }


    ngOnDestroy() {
        this.themesChangedSubscr.unsubscribe();
    }

    selectLogo(index) {
        this.configDefault.logoImages.forEach(function (el, ind) {
            if (ind === index) {
                el.select = true;
            } else {
                el.select = false;
            }
        });
    }

    checkUrlThroughColorScheme(url) {
        if (typeof url == 'string') {
            return url;
        } else {
            return url[this.theme];
        }
    }

    private inAdd = false;
    private typesMap = {};
    @ViewChild('typeSelect', {static: false}) private typeSelect: IMFXControlsSelect2Component;
    @ViewChild('layoutSelect', {static: false}) private layoutSelect: IMFXControlsSelect2Component;

    public InitLayoutSelectors() {
        let selectedDefaults = this.configDefault.defaultLayoutForType;
        this.typesMap = {};
        Object.keys(LayoutType).forEach((key) => {
            selectedDefaults.some(k => k.typeId == key);
            if (!isNaN(Number(key)) && !selectedDefaults.some(k => k.typeId == key)) {
                this.typesMap[key] = {
                    name: LayoutType[key],
                    id: key
                }
            }
        });
        this.setTypesControl();
    }

    setTypesControl() {
        let items = Object.keys(this.typesMap).map((k)=>{
            return {
                id: k,
                text: this.typesMap[k].name
            }
        });
        this.typeSelect.setData(items);
        this.cd.detectChanges();
    }

    showAdd() {
        this.inAdd = true;
    }

    cancelAdd() {
        this.inAdd = false;
        this.typeSelect.clearSelect();
        this.layoutSelect.clearSelect();
    }

    onSelectLayoutType(selection) {
        this.layoutSelect.clearSelect();
        if(selection && selection.params && selection.params.data && selection.params.data.length > 0) {
            this.layoutManagerService.getSharedLayoutsForType(selection.params.data[0].id).subscribe((res)=>{
                let items = (<any>res).map((k)=>{
                    return {
                        id: k.ID,
                        text: k.Name
                    }
                });
                this.layoutSelect.setData(items);
            });
        }
        this.cd.detectChanges();
    }

    addNewLayoutDefault() {
        if(this.checkLayoutDefaultValid()) {
            let t = this.typeSelect.getSelected();
            let l = this.layoutSelect.getSelected();
            this.inAdd = false;
            this.configDefault.defaultLayoutForType.push({
                typeName: LayoutType[t],
                layoutName: this.layoutSelect.getSelectedText()[0],
                typeId: t,
                layoutId: l
            });
            delete this.typesMap[t];
            this.onChangeDefaultDefaultLayoutForType.emit({
                DefaultLayoutForType: this.configDefault.defaultLayoutForType
            });

            this.typeSelect.clearSelect();
            this.layoutSelect.clearSelect();

            this.setTypesControl();
        }
    }

    removeDefault(item) {
        this.typeSelect.clearSelect();
        this.layoutSelect.clearSelect();

        this.configDefault.defaultLayoutForType = this.configDefault.defaultLayoutForType.filter((i)=>{
            return item.typeId != i.typeId;
        });
        this.typesMap[item.typeId] = {
            name: LayoutType[item.typeId],
            id: item.typeId
        }
        this.onChangeDefaultDefaultLayoutForType.emit({
            DefaultLayoutForType: this.configDefault.defaultLayoutForType
        });
        this.setTypesControl();
    }

    hasSelectedType() {
        return this.typeSelect && this.typeSelect.getSelected() != null;
    }

    checkLayoutDefaultValid() {
        return this.typeSelect && this.typeSelect.getSelected() != null &&
            this.layoutSelect && this.layoutSelect.getSelected() != null;
    }
}
