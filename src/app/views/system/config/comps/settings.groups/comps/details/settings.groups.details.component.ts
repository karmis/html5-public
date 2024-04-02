import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {SettingsGroupsService} from '../../../../../../../services/system.config/settings.groups.service';
import {SettingsGroupParams} from './settings.group.params';
import {NotificationService} from '../../../../../../../modules/notification/services/notification.service';
import {CustomLabels, SearchTypes} from '../../../../../../../services/system.config/search.types';
import {BrandingSearchFormComponent} from '../../../../../../branding/components/search/branding.search.form.component';
import {Icons} from '../../../../../../../services/system.config/icons';
import {TransferdSimplifedType} from '../../../../../../../modules/settings/consumer/types';
import {ConsumerSettingsTransferProvider} from '../../../../../../../modules/settings/consumer/consumer.settings.transfer.provider';
import {SearchAdvancedService} from "../../../../../../../modules/search/advanced/services/search.advanced.service";
import {SessionStorageService} from "ngx-webstorage";
import {OverlayComponent} from '../../../../../../../modules/overlay/overlay';
import {forkJoin, Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ServerGroupStorageService} from "../../../../../../../services/storage/server.group.storage.service";
import {ServerStorageService} from '../../../../../../../services/storage/server.storage.service';
import {SettingsGroupsAdvancedAssociateComponent} from './comps/advanced.associate/advanced.associate.component';
import {SettingsGroupsDetailsItemLayoutComponent} from './comps/item.layout/item.layout.component';
import {SettingsGroupsDetailsDetailsLayoutComponent} from './comps/details.layout/details.layout.component';
import {SettingsGroupsDetailsSearchScreenComponent} from './comps/search.screen/search.screen.component';
import {TranslateService} from '@ngx-translate/core';
import {
    AdvanceType,
    SettingsGroupsAdvancedSupplierPortalComponent
} from './comps/advanced.supplier.portal/advanced.supplier.portal.component';
import {SettingsGroupsDetailsUploadLayoutComponent} from './comps/upload/upload.layout.component';
import {Select2ItemType} from "../../../../../../../modules/controls/select2/types";
import {SettingsGroupGridItemType, SettingsGroupType, TMSettingsKeyType} from "../../../../types";
import {SettingsGroupsAdvancedAssociateMediaComponent} from './comps/advanced.associate.media/advanced.associate.media.component';
import {HttpErrorResponse} from '@angular/common/http';
import {LoadingIconsService} from "../../../global.settings/comps/loading-icons/providers/loading-icons.service";
import {BaseProvider} from "../../../../../../base/providers/base.provider";
import {PREFERENCES} from "./preferences.const";
import {SettingsGroupsDetailsDefaultsComponent} from "./comps/defaults/defaults.component";
import {SearchSavedService} from "../../../../../../../modules/search/saved/services/search.saved.service";
import {Observable} from "rxjs/Rx";
import {BasketService} from "../../../../../../../services/basket/basket.service";
import {LookupService} from "../../../../../../../services/lookup/lookup.service";

@Component({
    selector: 'settings-groups-detail',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [BrandingSearchFormComponent],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SearchAdvancedService,
        SearchSavedService,
        BasketService
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SettingsGroupsDetailsComponent implements OnInit {
    selectedSearchByFields: number = 0;
    public advancedSchemaSettings = null;
    // TODO: change to ngmodel
    preparedSubCategories: any[] = [];
    protected activeSubCategory = 0;
    protected subCategories: {
        id: number,
        name: string,
        children?: {
            name: string
        }[]
    }[] = [
        {id: 0, name: 'settings_group.default'},
        {id: 1, name: 'settings_group.start_search'},
        {
            id: 2, name: 'settings_group.search_by_fields', children: [
                {name: 'Media'},
                {name: 'Version'},
                {name: 'Consumer'},
                {name: 'Title'},
                {name: 'Media Portal'},
                {name: 'Video Browser'},
            ]
        },
        // { id: 3, name:'settings_group.facets' },
        {id: 4, name: 'settings_group.item_layout'},
        {id: 5, name: 'settings_group.details_layout'},
        {id: 6, name: 'settings_group.search_layout.title'},
        {id: 7, name: 'settings_group.upload_layout.title'},
        {id: 8, name: 'remote_upload.title'},
        {id: 9, name: 'settings_group.misr_details_fields.title'},
        {id: 10, name: 'settings_group.version_creation.title'},
        {id: 11, name: 'settings_group.advanced_associate.title'},
        {id: 12, name: 'settings_group.advanced_associate_media.title'},
        {id: 13, name: 'settings_group.advanced_supplier_portal.title'},
        {id: 14, name: 'details_view_metadata.title'},
        {id: 15, name: 'settings_group.video_browser_app.title'},
        {id: 16, name: 'settings_group.confidence_feed.title'},
        {id: 17, name: 'settings_group.terms_conditions.title'},
        {id: 18, name: 'settings_group.raise_workflow_settings.title'},
        {id: 19, name: 'settings_group.google_maps_api.title'},
        {id: 20, name: 'settings_group.video_player.title'},
        {id: 21, name: 'settings_group.main_menu_links.title'},
    ];
    protected settingsGroup: SettingsGroupType;
    protected settingsGroupName: string;
    protected settingsGroupDescription: string;
    protected logoImages;
    protected searchTypes = SearchTypes;
    protected searchTypesKeys;
    protected helpdeskUrl = null;
    protected customLabels: CustomLabels = {
        comments: null,
        legal: null,
        cuts: null,
    };
    protected defaultSearch;
    protected defaultHomePage;
    protected defaultLayoutForType = [];
    protected configDefault: {
        defaultSearch: any,
        logoImages: any,
        searchTypes: any,
        searchTypesKeys: any,
        helpdeskUrl: null,
        customLabels: CustomLabels
    };
    protected startSearchSettings = null;
    protected columnsMediaAll = null;
    protected columnsMedia: Select2ItemType[];
    protected columnsVersion;
    protected columnsSimple;
    protected columnsTitle;
    protected columnsMediaPortal;
    protected columnsVideoBrowser;
    protected defaultSearchColumnsMedia = null;
    protected defaultSearchColumnsVersion = null;
    protected defaultSearchColumnsSimple = null;
    protected defaultSearchColumnsTitle = null;
    protected defaultSearchColumnsMediaPortal = null;
    protected defaultSearchColumnsVideoBrowser = null;
    protected availableSearchFields = [];
    protected searchFields: {
        key: string;
        enabled: boolean;
    }[] = null;
    protected availableFacets = [];
    protected facets: {
        key: string;
        enabled: boolean;
    }[] = null;
    protected consumerItemSettings = null;
    protected consumerDetailsSettings = null;
    protected layoutSettings = null;
    // public uploadSearchSettings: EventEmitter<any> = new EventEmitter<any>();
    protected uploadSearchSettings = null;
    protected remoteUploadSearchSettings = null;
    protected defaultSearchMisrDetailsMediaColumns = null;
    protected columnsMisrDetailsMedia;
    protected versionCreationSettings: {
        availableVersionNames: any[]
    } = null;
    protected advancedMediaAssociateSettings = null;
    protected advancedVersionAssociateSettings = null;
    protected advancedMediaAssociateSavedSearchId = null;
    protected advancedVersionAssociateSavedSearchId = null;
    protected wfRiseSettings = null;
    protected advancedUnasMediaAssociateMediaSettings = null;
    protected advancedMediaAssociateMediaSettings = null;
    protected advancedUnasMediaAssociateMediaSavedSearchId = null;
    protected advancedMediaAssociateMediaSavedSearchId = null;
    protected associateMediaWFRiseSettings = null;
    protected advancedAllOrdersSearchCriteria = null;
    protected advancedDelHistorySearchCriteria = null;
    protected versionNameOrder = [];
    protected versionCompleteSettings = null;
    protected supplierPortalDefaultViewsAllOrders = null;
    protected supplierPortalDefaultViewsDelHistory = null;
    protected videoBrowserAppSettings = null;
    protected confidenceFeedSettings = null;
    protected googleMapsApiSettings = null;
    protected termsConditionsData = null;
    protected raiseWorkflowSettings = null;
    protected videoPlayerSettings = null;
    protected mainMenuSettings = [];
    @ViewChild('settingsGroupsDetailSearchScreenComponent', {static: false}) private settingsGroupsDetailSearchScreenComponent: SettingsGroupsDetailsSearchScreenComponent;
    @ViewChild('settingsGroupsDetailsItemLayoutComponent', {static: false}) private settingsGroupsDetailsItemLayoutComponent: SettingsGroupsDetailsItemLayoutComponent;
    @ViewChild('settingsGroupsDetailsDetailsLayoutComponent', {static: false}) private settingsGroupsDetailsDetailsLayoutComponent: SettingsGroupsDetailsDetailsLayoutComponent;
    @ViewChild('settingsGroupsAdvancedAssociateComponent', {static: false}) private settingsGroupsAdvancedAssociateComponent: SettingsGroupsAdvancedAssociateComponent;
    @ViewChild('settingsGroupsAdvancedAssociateMediaComponent', {static: false}) private settingsGroupsAdvancedAssociateMediaComponent: SettingsGroupsAdvancedAssociateMediaComponent;
    @ViewChild('settingsGroupsDetailsUploadLayoutComponent', {static: false}) private settingsGroupsDetailsUploadLayoutComponent: SettingsGroupsDetailsUploadLayoutComponent;
    @ViewChild('settingsGroupsDetailsRemoteUploadLayoutComponent', {static: false}) private settingsGroupsDetailsRemoteUploadLayoutComponent: SettingsGroupsDetailsUploadLayoutComponent;
    @ViewChild('settingsGroupsAdvancedSupplierPortalComponent', {static: false}) private settingsGroupsAdvancedSupplierPortalComponent: SettingsGroupsAdvancedSupplierPortalComponent;
    @ViewChild('settingsGroupDetails', {static: false}) private settingsGroupDetails: any;
    @ViewChild('overlayGroupDetails', {static: false}) private overlayGroupDetails: OverlayComponent;
    @ViewChild('configDefaultsComp', {static: false}) private configDefaultsComp: SettingsGroupsDetailsDefaultsComponent;
    @Output() private back: EventEmitter<any> = new EventEmitter<any>();
    private storagePrefix: string = 'config.user.group.preferences';
    private loading: boolean = false;
    private context = this;
    private destroyed$: Subject<any> = new Subject();
    private subAddedNewGroup: Subscription;
    private associateMediaVersionColumnsOrderSettings: any;
    private associateMediaMediaColumnsOrderSettings: any;
    private associateMediaUnAssocColumnsOrderSettings = null;
    private associateMediaAssocColumnsOrderSettings = null;
    private supplierAllOrdersColumnsSetup = null;
    private supplierDelHistColumnsSetup = null;

    constructor(private cdr: ChangeDetectorRef,
                private settingsGroupsService: SettingsGroupsService,
                private notificationRef: NotificationService,
                private advancedService: SearchAdvancedService,
                private savedSearchService: SearchSavedService,
                private sessionStorage: SessionStorageService,
                private serverStorage: ServerStorageService,
                private serverGroupStorageService: ServerGroupStorageService,
                private translate: TranslateService,
                private transfer: ConsumerSettingsTransferProvider,
                private loadingIconsService: LoadingIconsService,
                private basketService: BasketService,
                private lookupService: LookupService,
                protected baseProvider: BaseProvider) {

        //prepare start data
        this.logoImages = Object.keys(Icons).map(k => {
            return {
                id: k,
                url: Icons[k],
                select: false
            };
        });
        this.logoImages.filter(el => el.id === 'NOLOGO')[0].select = true;

        this.searchTypesKeys = Object.keys(this.searchTypes);
        //prepare start data
    };

    ngOnInit() {
        this.subAddedNewGroup = this.settingsGroupsService.addedNewGroup.subscribe(group => {
            this.settingsGroup = group;
        });

        this.prepareSubCategories();
    }

    ngOnDestroy() {
        this.subAddedNewGroup.unsubscribe();
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    selectSubCategory(item, i) {
        if (typeof item === 'number') {
            if (item === 2) {
                this.selectedSearchByFields = i;
            }
        } else {
            this.activeSubCategory = i;
        }
    }

    initSettingsGroupDetail(settingsGroup: SettingsGroupGridItemType, isClone: boolean = false) {
        if (settingsGroup.Id !== undefined) {
            this.overlayGroupDetails.show(this.settingsGroupDetails.nativeElement);
            let subj = new Subject();
            let obs = this.settingsGroupsService.getSettingsGroupById(settingsGroup.Id, true);
            obs.subscribe(subj);
            subj.pipe(
                takeUntil(this.destroyed$)
            ).subscribe((sg: any) => {
                // get data!!!
                this.fetchConfigData().subscribe(() => {
                    this.setSettingsGroup(sg, isClone);
                    this.overlayGroupDetails.hide(this.settingsGroupDetails.nativeElement);
                    this.cdr.detectChanges();
                });
            });
        } else {
            //@ts-ignore
            this.setSettingsGroup({} as SettingsGroupType);
            Promise.resolve().then(() => {
                this.cdr.detectChanges();
            });
        }
    }

    fetchConfigData(): Observable<void> {
        return new Observable((observer) => {
            forkJoin([
                this.savedSearchService.getListOfSavedSearches('Media', true),
                this.savedSearchService.getListOfSavedSearches('Version', true),
                this.savedSearchService.getSavedSearches('MediaPortal', 'all', true),
                this.advancedService.getFields('MediaPortal', true),
                this.advancedService.getFields('Media', true),
                this.basketService.getOrderPresets(true),
                this.lookupService.getLookups('SearchSupportedOperators'),
                this.settingsGroupsService.getFieldsForConsumer(true),

            ]).subscribe((res) => {
                observer.next();
                observer.complete();
            });
        });
    }

    loadDetailDefaults() {
        let logoImageSettings = this.getSetting('logoImage');
        if (logoImageSettings && logoImageSettings.DATA) {
            let logoData = JSON.parse(logoImageSettings.DATA);
            this.logoImages.forEach(function (el, ind) {
                if (el.id === logoData.LogoImage) {
                    el.select = true;
                } else {
                    el.select = false;
                }
            });
        }

        let configDefault = {
            defaultHomePage: null,
            defaultSearch: null,
            defaultLayoutForType: [],
            logoImages: this.logoImages,
            searchTypes: this.searchTypes,
            searchTypesKeys: this.searchTypesKeys,
            helpdeskUrl: this.helpdeskUrl,
            customLabels: this.customLabels
        };

        let defaultLayoutForTypeSettings = this.getSetting(PREFERENCES.defaultLayoutForType);
        if (defaultLayoutForTypeSettings && defaultLayoutForTypeSettings.DATA) {
            let data = JSON.parse(defaultLayoutForTypeSettings.DATA);

            configDefault.defaultLayoutForType = data.DefaultLayoutForType;
            this.defaultLayoutForType = data.DefaultLayoutForType;
        }

        let defaultSearchSettings = this.getSetting('defaultSearch');
        if (defaultSearchSettings && defaultSearchSettings.DATA) {
            let data = JSON.parse(defaultSearchSettings.DATA);

            configDefault.defaultSearch = data.DefaultSearch;
            this.defaultSearch = data.DefaultSearch;
        }

        let defaultHomePageSettings = this.getSetting('defaultHomePage');
        if (defaultHomePageSettings && defaultHomePageSettings.DATA) {
            let data = JSON.parse(defaultHomePageSettings.DATA);
            configDefault.defaultHomePage = data.DefaultHomePage;
            this.defaultHomePage = data.DefaultHomePage;
        }
        let defaultHelpdeskUrl = this.getSetting('helpdeskUrl');

        if (defaultHelpdeskUrl && defaultHelpdeskUrl.DATA) {
            let data = JSON.parse(defaultHelpdeskUrl.DATA);
            configDefault.helpdeskUrl = data.HelpdeskUrl;
            this.helpdeskUrl = data.HelpdeskUrl;
        }

        const defaultCustomLabels = this.getSetting('customLabels');
        if (defaultCustomLabels && defaultCustomLabels.DATA) {
            let data = JSON.parse(defaultCustomLabels.DATA);
            configDefault.customLabels = data.CustomLabels;
            this.customLabels = data.CustomLabels;
        }

        this.configDefault = configDefault;
    }

    onChangeDefaultSearch(s: string) {
        this.defaultSearch = s;
    }

    onChangeDefaultDefaultLayoutForType(s: any) {
        this.defaultLayoutForType = s.DefaultLayoutForType;
    }

    onChangeDefaultHomePage(s: string) {
        this.defaultHomePage = s;
    }

    onChangeDefaultHelpdeskUrl(s: string) {
        this.helpdeskUrl = s;
    }

    onChangeDefaultCustomLabels(customLabels: CustomLabels) {
        this.customLabels = customLabels;
    }

    loadDetailSearchScreen() {
        // toDo JSON.parse
        let startSettings = this.getOrAddSettings('startSearch');// get exist value or create default
        // this.startSearchData =
        this.startSearchSettings = startSettings;
        // this.startSearchSettings.emit(startSettings);
    }

    loadDetailSearchByFieldsAndMisrDetailsFields() {
        let defaultSearchColumnsMedia = this.getOrAddSettings('defaultSearchColumnsMedia');
        // if (defaultSearchColumnsMedia)
        this.defaultSearchColumnsMedia = JSON.parse(defaultSearchColumnsMedia.DATA);
        this.defaultSearchColumnsMedia = Array.isArray(this.defaultSearchColumnsMedia) ? this.defaultSearchColumnsMedia : [];

        let defaultSearchColumnsVersion = this.getOrAddSettings('defaultSearchColumnsVersion');
        // if (defaultSearchColumnsVersion)
        this.defaultSearchColumnsVersion = JSON.parse(defaultSearchColumnsVersion.DATA);
        this.defaultSearchColumnsVersion = Array.isArray(this.defaultSearchColumnsVersion) ? this.defaultSearchColumnsVersion : [];

        let defaultSearchColumnsSimple = this.getOrAddSettings('defaultSearchColumnsSimple');
        this.defaultSearchColumnsSimple = JSON.parse(defaultSearchColumnsSimple.DATA);
        this.defaultSearchColumnsSimple = Array.isArray(this.defaultSearchColumnsSimple) ? this.defaultSearchColumnsSimple : [];

        let defaultSearchColumnsTitle = this.getOrAddSettings('defaultSearchColumnsTitle');
        this.defaultSearchColumnsTitle = JSON.parse(defaultSearchColumnsTitle.DATA);
        this.defaultSearchColumnsTitle = Array.isArray(this.defaultSearchColumnsTitle) ? this.defaultSearchColumnsTitle : [];

        let defaultSearchColumnsMediaPortal = this.getOrAddSettings('defaultSearchColumnsMediaPortal');
        this.defaultSearchColumnsMediaPortal = JSON.parse(defaultSearchColumnsMediaPortal.DATA);
        this.defaultSearchColumnsMediaPortal = Array.isArray(this.defaultSearchColumnsMediaPortal) ? this.defaultSearchColumnsMediaPortal : [];

        let defaultSearchColumnsVideoBrowser = this.getOrAddSettings('defaultSearchColumnsVideoBrowser');
        this.defaultSearchColumnsVideoBrowser = JSON.parse(defaultSearchColumnsVideoBrowser.DATA);
        this.defaultSearchColumnsVideoBrowser = Array.isArray(this.defaultSearchColumnsVideoBrowser) ? this.defaultSearchColumnsVideoBrowser : [];

        let defaultSearchMisrDetailsMediaColumns = this.getOrAddSettings('defaultSearchMisrDetailsMediaColumns');
        this.defaultSearchMisrDetailsMediaColumns = JSON.parse(defaultSearchMisrDetailsMediaColumns.DATA);
        this.defaultSearchMisrDetailsMediaColumns = Array.isArray(this.defaultSearchMisrDetailsMediaColumns) ? this.defaultSearchMisrDetailsMediaColumns : [];


        this.settingsGroupsService.getSearchFields().pipe(
            takeUntil(this.destroyed$)
        ).subscribe(res => {
            this.searchFields = res.map(el => ({
                key: el,
                enabled: this.availableSearchFields.indexOf(el) > -1
            }));
            this.cdr.detectChanges();
        });


        this.advancedService.getSearchByFields().pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            this.columnsMediaAll = res['Media'];
            this.columnsMisrDetailsMedia = this.columnsMediaAll;
            this.columnsMedia = res['Media'];
            this.columnsVersion = res['Version'];
            this.columnsSimple = res['ChameleonSearch'];
            this.columnsTitle = res['TitleSearch'];
            this.columnsMediaPortal = res['MediaPortal'];
            this.columnsVideoBrowser = res['VideosSearch'];
            this.cdr.detectChanges();
        });
    }

    onChangeSearchDefaultFields(data) {
        if (data != null) {
            this.defaultSearchColumnsMedia = data.defaultSearchColumnsMedia;
            this.defaultSearchColumnsVersion = data.defaultSearchColumnsVersion;
            this.defaultSearchColumnsSimple = data.defaultSearchColumnsSimple;
            this.defaultSearchColumnsTitle = data.defaultSearchColumnsTitle;
            this.defaultSearchColumnsMediaPortal = data.defaultSearchColumnsMediaPortal;
            this.defaultSearchColumnsVideoBrowser = data.defaultSearchColumnsVideoBrowser;
        }
        // }
        //
        // searchByFieldItemChanged() {
        this.transfer.updated.emit(<TransferdSimplifedType>{
            setupType: 'search_by_fileds',
            groupId: this.settingsGroup.ID,
            setups: this.availableSearchFields
        });
    }

    onChangeSearchDefaultMisrFields(data) {
        if (data != null) {
            this.defaultSearchMisrDetailsMediaColumns = data.defaultSearchMisrDetailsMediaColumns;
        }
    }

    loadDetailFacets() {
        this.settingsGroupsService.getFacets().pipe(
            takeUntil(this.destroyed$)
        ).subscribe(res => {
            this.facets = res.map(el => ({
                key: el,
                enabled: this.availableFacets.indexOf(el) > -1
            }));
            this.cdr.detectChanges();
        });
    }

    onChangeFacetItem() {
        this.transfer.updated.emit(<TransferdSimplifedType>{
            setupType: 'facets',
            groupId: this.settingsGroup.ID,
            setups: this.availableSearchFields
        });
    }

    loadDetailsItemLayoutDetailLayout(settingsGroup) {
        let ConsumerSettings = this.getOrAddSettings('consumer');
        if (ConsumerSettings && ConsumerSettings.DATA) {
            let data: SettingsGroupParams = <SettingsGroupParams>JSON
                .parse(ConsumerSettings.DATA);
            this.availableFacets = data.AvailableFacets;
            this.availableSearchFields = data.AvailableSearchFields;
            // preheat setups for Consumer
            let itemSimple = {
                data: data.ConsumerItemLayout,
                id: settingsGroup.ID
            };
            this.consumerItemSettings = itemSimple;

            let detailSimple = {
                data: data.ConsumerDetailLayout,
                id: settingsGroup.ID
            };
            this.consumerDetailsSettings = detailSimple;
        } else {
            //default value
            this.consumerItemSettings = {};
            this.consumerDetailsSettings = {};
        }
    }

    loadDetailSearchLayout() {
        let layoutSettings = this.getOrAddSettings('searchLayoutConfig');
        // if (layoutSettings)
        this.layoutSettings = JSON.parse(layoutSettings.DATA) || {};
    }

    onChangeSearchLayout($event) {
        this.layoutSettings = $event;
    }

    loadDetailUploadLayout() {
        let uploadSettings = this.getOrAddSettings('uploadSettings');
        // if (uploadSettings)
        this.uploadSearchSettings = JSON.parse(uploadSettings.DATA) || {};
    }

    loadDetailRemoteUploadLayout() {
        let uploadSettings = this.getOrAddSettings('remoteUploadSettings');
        // if (uploadSettings)
        this.remoteUploadSearchSettings = JSON.parse(uploadSettings.DATA) || {};
    }

    onChangeUploadSearchSettings($event) {
        this.uploadSearchSettings = $event;
    }

    onChangeRemoteUploadSearchSettings($event) {
        this.remoteUploadSearchSettings = $event;
    }

    loadVersionCreation() {
        let versionCreationSettings = this.getOrAddSettings('versionCreationSettings');
        // if (versionCreationSettings)
        this.versionCreationSettings = JSON.parse(versionCreationSettings.DATA) || {};
    }

    onChangeVersionCreationSettings($event) {
        this.versionCreationSettings = $event;
    }

    loadAdvancedAssociate() {
        const advancedMediaAssociateSettings = this.getOrAddSettings('associate.advanced_search.media.setups');
        const advancedVersionAssociateSettings = this.getOrAddSettings('associate.advanced_search.version.setups');
        const advancedMediaAssociateSavedSearchId = this.getOrAddSettings('associate.advanced_search.media.setups_saved_search_id');
        const advancedVersionAssociateSavedSearchId = this.getOrAddSettings('associate.advanced_search.version.setups_saved_search_id');
        const wfRiseSettings = this.getOrAddSettings('associate.wfrise.setups');
        this.advancedMediaAssociateSettings = JSON.parse(advancedMediaAssociateSettings.DATA);
        this.advancedVersionAssociateSettings = JSON.parse(advancedVersionAssociateSettings.DATA);
        this.advancedMediaAssociateSavedSearchId = JSON.parse(advancedMediaAssociateSavedSearchId.DATA);
        this.advancedVersionAssociateSavedSearchId = JSON.parse(advancedVersionAssociateSavedSearchId.DATA);
        this.advancedMediaAssociateSettings = Array.isArray(this.advancedMediaAssociateSettings) ? this.advancedMediaAssociateSettings : [];
        this.advancedVersionAssociateSettings = Array.isArray(this.advancedVersionAssociateSettings) ? this.advancedVersionAssociateSettings : [];
        this.wfRiseSettings = JSON.parse(wfRiseSettings.DATA) || {};
        this.associateMediaMediaColumnsOrderSettings = JSON.parse(this.getOrAddSettings('associate.media.columns.order.setups').DATA);
        this.associateMediaVersionColumnsOrderSettings = JSON.parse(this.getOrAddSettings('associate.version.columns.order.setups').DATA);
        const advancedSchemaSettings = this.getOrAddSettings('associate.schema');
        this.advancedSchemaSettings = JSON.parse(advancedSchemaSettings.DATA);
        this.advancedSchemaSettings = this.advancedSchemaSettings ? this.advancedSchemaSettings : {Id: null, Name: ''};
    }

    loadAdvancedAssociateMedia() {
        const advancedUnasMediaAssociateMediaSettings = this.getOrAddSettings('associate_media.advanced_search.media.setups');
        const advancedMediaAssociateMediaSettings = this.getOrAddSettings('associate_media.advanced_search.version.setups');
        const advancedUnasMediaAssociateMediaSavedSearchId = this.getOrAddSettings('associate_media.advanced_search.media.setups_saved_search_id');
        const advancedMediaAssociateMediaSavedSearchId = this.getOrAddSettings('associate_media.advanced_search.version.setups_saved_search_id');
        const associateMediaWFRiseSettings = this.getOrAddSettings('associate_media.wfrise.setups');
        const unAssocColumnsOrderSettings = this.getOrAddSettings('associate_media.unassoc.version.columns.order.setups');
        const assocColumnsOrderSettings = this.getOrAddSettings('associate_media.assoc.version.columns.order.setups');

        this.advancedUnasMediaAssociateMediaSettings = JSON.parse(advancedUnasMediaAssociateMediaSettings.DATA);
        this.advancedMediaAssociateMediaSettings = JSON.parse(advancedMediaAssociateMediaSettings.DATA);
        this.advancedUnasMediaAssociateMediaSavedSearchId = JSON.parse(advancedUnasMediaAssociateMediaSavedSearchId.DATA);
        this.advancedMediaAssociateMediaSavedSearchId = JSON.parse(advancedMediaAssociateMediaSavedSearchId.DATA);
        this.associateMediaUnAssocColumnsOrderSettings = JSON.parse(unAssocColumnsOrderSettings.DATA) || {};
        this.associateMediaAssocColumnsOrderSettings = JSON.parse(assocColumnsOrderSettings.DATA) || {};

        this.advancedUnasMediaAssociateMediaSettings = Array.isArray(this.advancedUnasMediaAssociateMediaSettings) ? this.advancedUnasMediaAssociateMediaSettings : [];
        this.advancedMediaAssociateMediaSettings = Array.isArray(this.advancedMediaAssociateMediaSettings) ? this.advancedMediaAssociateMediaSettings : [];
        this.associateMediaWFRiseSettings = JSON.parse(associateMediaWFRiseSettings.DATA) || {};
    }

    loadAdvancedSupplierPortal() {
        this.advancedAllOrdersSearchCriteria = JSON.parse(this.getOrAddSettings(PREFERENCES.allOrdersSearchCriteria).DATA);
        this.advancedAllOrdersSearchCriteria = Array.isArray(this.advancedAllOrdersSearchCriteria) ? this.advancedAllOrdersSearchCriteria : [];

        this.advancedDelHistorySearchCriteria = JSON.parse(this.getOrAddSettings(PREFERENCES.delHistorySearchCriteria).DATA);
        this.advancedDelHistorySearchCriteria = Array.isArray(this.advancedDelHistorySearchCriteria) ? this.advancedDelHistorySearchCriteria : [];

        this.versionNameOrder = JSON.parse(this.getOrAddSettings(PREFERENCES.versionNameOrder).DATA);
        this.versionNameOrder = Array.isArray(this.versionNameOrder) ? this.versionNameOrder : [];

        this.versionCompleteSettings = JSON.parse(this.getOrAddSettings('supplier_portal.version_complete.setups').DATA) || {};
        this.supplierPortalDefaultViewsAllOrders = JSON.parse(this.getOrAddSettings(PREFERENCES.allOrdersDefaultView).DATA) || {};
        this.supplierPortalDefaultViewsDelHistory = JSON.parse(this.getOrAddSettings(PREFERENCES.delHistoryDefaultView).DATA) || {};

        // const supplierAllOrdersColumnsSetup = this.getOrAddSettings('associate_media.unassoc.version.columns.order.setups');
        // const assocColumnsOrderSettings = this.getOrAddSettings('associate_media.assoc.version.columns.order.setups');
        //
        // this.associateMediaUnAssocColumnsOrderSettings = JSON.parse(unAssocColumnsOrderSettings.DATA) || {};
        // this.associateMediaAssocColumnsOrderSettings = JSON.parse(assocColumnsOrderSettings.DATA) || {};

        // const supplierAllOrdersColumnsSetup = this.getOrAddSettings('supplier.all.columns.order.setups');
        // const supplierDelHistColumnsSetup = this.getOrAddSettings('supplier.del.columns.order.setups');
        this.supplierAllOrdersColumnsSetup = JSON.parse(this.getOrAddSettings('supplier.all.columns.order.setups').DATA);
        this.supplierDelHistColumnsSetup = JSON.parse(this.getOrAddSettings('supplier.del.columns.order.setups').DATA);
    }

    loadVideoBrowserApp() {
        const videoBrowserAppSettings = this.getOrAddSettings('videoBrowserAppSettings');
        this.videoBrowserAppSettings = JSON.parse(videoBrowserAppSettings.DATA) || {};
    }

    loadConfidenceFeedSettings() {
        const confidenceFeedSettings = this.getOrAddSettings('confidenceFeedSettings');
        this.confidenceFeedSettings = JSON.parse(confidenceFeedSettings.DATA) || [];
    }

    loadGoogleMapsApiSettings() {
        const googleMapsApiSettings = this.getOrAddSettings('googleMapsApiSettings');
        this.googleMapsApiSettings = JSON.parse(googleMapsApiSettings.DATA) || {};
    }

    loadTermsConditions() {
        this.termsConditionsData = JSON.parse(this.getOrAddSettings(PREFERENCES.termsConditions).DATA) || {};
    }

    onChangeVideoBrowserAppSettings($event) {
        this.videoBrowserAppSettings = $event;
    }

    onChangeConfidenceFeedSettings($event) {
        this.confidenceFeedSettings = $event;
    }

    onChangeGoogleMapsApiSettings($event) {
        this.googleMapsApiSettings = $event;
    }

    loadRaiseWorkflowSettings() {
        let raiseWorkflowSettings = this.getOrAddSettings('raiseWorkflowSettings');
        // if (versionCreationSettings)
        this.raiseWorkflowSettings = JSON.parse(raiseWorkflowSettings.DATA) || {};
    }

    onChangeVideoPlayerSettings($event) {
        this.videoPlayerSettings = $event;
    }

    loadVideoPlayerSettings() {
        let videoPlayerSettings = this.getOrAddSettings('videoPlayerSettings');
        this.videoPlayerSettings = JSON.parse(videoPlayerSettings.DATA) || {};
    }

    onChangeMainMenuSettings($event) {
        this.mainMenuSettings = $event;
    }

    loadMainMenuSettings() {
        let mainMenuSettings = this.getOrAddSettings('mainMenuSettings');
        this.mainMenuSettings = JSON.parse(mainMenuSettings.DATA) || [];
    }

    onChangeRaiseWorkflowSettings($event) {
        this.raiseWorkflowSettings = $event;
    }

    setSettingsGroup(settingsGroup: SettingsGroupType, isClone: boolean = false) {
        this.settingsGroup = settingsGroup;
        this.settingsGroupName = this.settingsGroup.NAME;
        this.settingsGroupDescription = this.settingsGroup.DESCRIPTION;
        if (settingsGroup.VISUAL_ASSETS_GROUP_ID) {
            this.loadingIconsService.selectGroup({ID: settingsGroup.VISUAL_ASSETS_GROUP_ID, NAME: null});
        } else {
            this.loadingIconsService.selectGroup({ID: null, NAME: null});
        }

        this.loadDetailsItemLayoutDetailLayout(settingsGroup);
        this.loadDetailDefaults();
        this.loadDetailSearchScreen();
        this.loadDetailUploadLayout();
        this.loadDetailRemoteUploadLayout();
        this.loadDetailSearchByFieldsAndMisrDetailsFields();
        this.loadDetailFacets();
        this.loadDetailSearchLayout();
        this.loadVersionCreation();
        this.loadAdvancedAssociate();
        this.loadAdvancedAssociateMedia();
        this.loadAdvancedSupplierPortal();
        this.loadVideoBrowserApp();
        this.loadConfidenceFeedSettings();
        this.loadTermsConditions();
        this.loadRaiseWorkflowSettings();
        this.loadVideoPlayerSettings();
        this.loadMainMenuSettings();
        this.loadGoogleMapsApiSettings();

        if (isClone) {
            delete (this.settingsGroup.ID);
        }
    }

    processFields(res) {
        var mediaFields = [];
        for (var i = 0; i < res.items.length; i++) {
            if (res.props[res.items[i].id].SearchEditorType == "TextBox") {
                mediaFields.push({
                    id: res.items[i].id,
                    text: res.items[i].text
                });
            }
        }
        return mediaFields;
    }

    goBack() {
        this.back.emit();
    }

    saveSettings($event) {
        // /*debugger*/
    }

    getIsValidUploadLayout() {
        return this.settingsGroupsDetailsUploadLayoutComponent.getIsValidUploadTypeSettings();
    }

    getIsValidStatusAssociateAdvSchema(type: 'media' | 'version') {
        return this.settingsGroupsAdvancedAssociateComponent.getIsValidAdvSchema(type);
    }

    getIsValidStatusAssociateMediaAdvSchema(type: 'media' | 'unassociated-media') {
        return this.settingsGroupsAdvancedAssociateMediaComponent.getIsValidAdvSchema(type);
    }

    getIsValidStatusSupplierPortalAdvSchema(type: AdvanceType) {
        return this.settingsGroupsAdvancedSupplierPortalComponent.getIsValidAdvSchema(type);
    }

    getAndShowIsValidCommon() {
        let errArray = [];

        if (!this.settingsGroupName && this.settingsGroup.ID !== 0)
            errArray.push(this.translate.instant('settings_group.empty_name_error'));

        if (!this.getIsValidUploadLayout())
            errArray.push(this.translate.instant('settings_group.upload_layout.invalid_upload_type_settings'));

        if (!this.getIsValidStatusAssociateAdvSchema('media'))
            errArray.push(this.translate.instant('settings_group.advanced_associate.invalid_adv_scheme_media'));

        if (!this.getIsValidStatusAssociateAdvSchema('version'))
            errArray.push(this.translate.instant('settings_group.advanced_associate.invalid_adv_scheme_version'));

        if (!this.getIsValidStatusAssociateMediaAdvSchema('media'))
            errArray.push(this.translate.instant('settings_group.advanced_associate_media.invalid_adv_scheme_media'));

        if (!this.getIsValidStatusAssociateMediaAdvSchema('unassociated-media'))
            errArray.push(this.translate.instant('settings_group.advanced_associate_media.invalid_adv_scheme_unassociated_media'));

        //toDo checking for associate media
        if (!this.getIsValidStatusSupplierPortalAdvSchema("allOrders"))
            errArray.push(this.translate.instant('settings_group.advanced_supplier_portal.invalid_adv_scheme'));
        //toDo checking for associate media
        if (!this.getIsValidStatusSupplierPortalAdvSchema("delHistory"))
            errArray.push(this.translate.instant('settings_group.advanced_supplier_portal.invalid_adv_scheme'));

        if (errArray.length > 0) {
            for (let item of errArray) {
                this.notificationRef.notifyShow(2, item);
            }
            return false;
        } else {
            return true;
        }
    }

    prepareSubCategories() {
        const subCats = [];
        this.subCategories.forEach((cat) => {
            const newCat = Object.assign({}, cat, {name: this.translate.instant(cat.name), children: []});
            if (cat.children && cat.children.length > 0) {
                cat.children.forEach((child) => {
                    const newChild = Object.assign({}, child, {title: this.translate.instant(child.name)});
                    newCat.children.push(newChild)
                });
                cat.children.sort((a, b) => {
                    return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
                })
            }
            subCats.push(newCat);
        });
        subCats.sort((a, b) => {
            return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
        })

        this.preparedSubCategories = subCats;
    }

    private getSetting(key) {
        if (this.settingsGroup.TM_SETTINGS_KEYS) {
            return this.settingsGroup.TM_SETTINGS_KEYS.filter(el => el.KEY === key)[0] || null;
        }
    }

    private getOrAddSettings(key) {
        this.settingsGroup.TM_SETTINGS_KEYS = this.settingsGroup.TM_SETTINGS_KEYS || [];
        let found = this.settingsGroup.TM_SETTINGS_KEYS.filter(el => el.KEY === key)[0];
        if (!found) {
            let setting: TMSettingsKeyType = {
                // 'ID': 0,
                // 'GROUP_ID': 0,
                'KEY': key,
                'VALUE': null,
                'DATA': null
            };
            this.settingsGroup.TM_SETTINGS_KEYS.push(setting);
            return setting;
        }
        return found;
    }

    private saveSettingsGroup() {
        if (!this.getAndShowIsValidCommon())
            return;
        this.settingsGroup.NAME = this.settingsGroupName;
        this.settingsGroup.DESCRIPTION = this.settingsGroupDescription;

        if (this.loadingIconsService.groupSelected) {
            this.settingsGroup.VISUAL_ASSETS_GROUP_ID = this.loadingIconsService.groupSelected.ID;
        }
        if (this.loadingIconsService.groupSelected === null) {
            this.settingsGroup.VISUAL_ASSETS_GROUP_ID = null;
        }

        let ConsumerSettings = this.getOrAddSettings('consumer');
        ConsumerSettings.DATA = JSON.stringify(<SettingsGroupParams>{
            AvailableFacets: this.facets.filter(el => el.enabled).map(el => el.key),
            AvailableSearchFields: this.searchFields.filter(el => el.enabled).map(el => el.key),
            ConsumerItemLayout: this.settingsGroupsDetailsItemLayoutComponent.consumerItemSettingsComponent.getSettings(),
            ConsumerDetailLayout: this.settingsGroupsDetailsDetailsLayoutComponent.consumerDetailSettingsComponent.getSettings(),
        });
        let defaultSearchSettings = this.getOrAddSettings('defaultSearch');
        defaultSearchSettings.DATA = JSON.stringify({
            DefaultSearch: this.defaultSearch
        });

        let defaultHomePageSettings = this.getOrAddSettings('defaultHomePage');
        defaultHomePageSettings.DATA = JSON.stringify({
            DefaultHomePage: this.defaultHomePage
        });

        let defaultLayoutForTypeSettings = this.getOrAddSettings('defaultLayoutForType');
        defaultLayoutForTypeSettings.DATA = JSON.stringify({
            DefaultLayoutForType: this.defaultLayoutForType
        });

        const defaultHelpdeskUrl = this.getOrAddSettings('helpdeskUrl');
        defaultHelpdeskUrl.DATA = JSON.stringify({
            HelpdeskUrl: this.helpdeskUrl
        });

        const defaultCustomLabels = this.getOrAddSettings('customLabels');
        defaultCustomLabels.DATA = JSON.stringify({
            CustomLabels: this.customLabels
        });

        let defaultLeayoutSettings = this.getOrAddSettings('searchLayoutConfig');
        defaultLeayoutSettings.DATA = JSON.stringify(this.layoutSettings);

        let defaultSearchColumnsMedia = this.getOrAddSettings('defaultSearchColumnsMedia');
        defaultSearchColumnsMedia.DATA = JSON.stringify(this.defaultSearchColumnsMedia);

        let defaultSearchColumnsVersion = this.getOrAddSettings('defaultSearchColumnsVersion');
        defaultSearchColumnsVersion.DATA = JSON.stringify(this.defaultSearchColumnsVersion);

        let defaultSearchColumnsSimple = this.getOrAddSettings('defaultSearchColumnsSimple');
        defaultSearchColumnsSimple.DATA = JSON.stringify(this.defaultSearchColumnsSimple);

        let defaultSearchColumnsTitle = this.getOrAddSettings('defaultSearchColumnsTitle');
        defaultSearchColumnsTitle.DATA = JSON.stringify(this.defaultSearchColumnsTitle);

        let defaultSearchColumnsMediaPortal = this.getOrAddSettings('defaultSearchColumnsMediaPortal');
        defaultSearchColumnsMediaPortal.DATA = JSON.stringify(this.defaultSearchColumnsMediaPortal);

        let defaultSearchColumnsVideoBrowser = this.getOrAddSettings('defaultSearchColumnsVideoBrowser');
        defaultSearchColumnsVideoBrowser.DATA = JSON.stringify(this.defaultSearchColumnsVideoBrowser);

        let defaultSearchMisrDetailsMediaColumns = this.getOrAddSettings('defaultSearchMisrDetailsMediaColumns');
        defaultSearchMisrDetailsMediaColumns.DATA = JSON.stringify(this.defaultSearchMisrDetailsMediaColumns);

        let versionCreationSettings = this.getOrAddSettings('versionCreationSettings');
        versionCreationSettings.DATA = JSON.stringify(this.versionCreationSettings);

        let startSearchSetting = this.getOrAddSettings('startSearch');
        // let data = this.startSearchData.startSearchForm.getCustomizedParams();
        let data = this.settingsGroupsDetailSearchScreenComponent.startSearchFormComponent.getCustomizedParams();
        startSearchSetting.DATA = JSON.stringify({
            Title: data.title,
            Subtitle: data.subtitle,
            Background: data.selectedBackground,
            Logo: data.selectedSearchLogo,
            Opacity: data.selectedOpacity
        });


        this.advancedMediaAssociateSettings = this.settingsGroupsAdvancedAssociateComponent.getAdvancedAssociateSettings('media');
        this.advancedVersionAssociateSettings = this.settingsGroupsAdvancedAssociateComponent.getAdvancedAssociateSettings('version');
        const advancedAssociateSavedSearchIds: { media: number, version: number } = this.settingsGroupsAdvancedAssociateComponent.getAdvancedAssociateSavedSearchSettings();
        this.advancedMediaAssociateSavedSearchId = advancedAssociateSavedSearchIds.media;
        this.advancedVersionAssociateSavedSearchId = advancedAssociateSavedSearchIds.version;
        let advancedMediaAssociateSettings = this.getOrAddSettings('associate.advanced_search.media.setups');

        let advancedSchemaSettings = this.getOrAddSettings('associate.schema');
        console.log(this.settingsGroupsAdvancedAssociateComponent.advancedSchemaSettings);
        advancedSchemaSettings.DATA = JSON.stringify(this.settingsGroupsAdvancedAssociateComponent.advancedSchemaSettings);

        let advancedVersionAssociateSettings = this.getOrAddSettings('associate.advanced_search.version.setups');
        const advancedMediaAssociateSavedSearchId = this.getOrAddSettings('associate.advanced_search.media.setups_saved_search_id');
        const advancedVersionAssociateSavedSearchId = this.getOrAddSettings('associate.advanced_search.version.setups_saved_search_id');
        advancedMediaAssociateSettings.DATA = JSON.stringify(this.advancedMediaAssociateSettings);
        advancedVersionAssociateSettings.DATA = JSON.stringify(this.advancedVersionAssociateSettings);
        advancedMediaAssociateSavedSearchId.DATA = JSON.stringify(this.advancedMediaAssociateSavedSearchId);
        advancedVersionAssociateSavedSearchId.DATA = JSON.stringify(this.advancedVersionAssociateSavedSearchId);
        this.wfRiseSettings = this.settingsGroupsAdvancedAssociateComponent.getWfRiseSettings();
        let wfRiseSettings = this.getOrAddSettings('associate.wfrise.setups');
        wfRiseSettings.DATA = JSON.stringify(this.wfRiseSettings);


        this.advancedUnasMediaAssociateMediaSettings = this.settingsGroupsAdvancedAssociateMediaComponent.getAdvancedAssociateMediaSettings('unassociated-media');
        this.advancedMediaAssociateMediaSettings = this.settingsGroupsAdvancedAssociateMediaComponent.getAdvancedAssociateMediaSettings('media');


        // columns
        // assoc media
        const unAssocColumnsOrderSettings = this.getOrAddSettings('associate_media.unassoc.version.columns.order.setups');
        const assocColumnsOrderSettings = this.getOrAddSettings('associate_media.assoc.version.columns.order.setups');
        unAssocColumnsOrderSettings.DATA = JSON.stringify(this.settingsGroupsAdvancedAssociateMediaComponent.associateMediaUnAssocColumnsOrderSettings);
        assocColumnsOrderSettings.DATA = JSON.stringify(this.settingsGroupsAdvancedAssociateMediaComponent.associateMediaAssocColumnsOrderSettings);

        // supplier portal (supplier media)
        const supplierAllOrdersColumnsSetup = this.getOrAddSettings('supplier.all.columns.order.setups');
        const supplierDelHistColumnsSetup = this.getOrAddSettings('supplier.del.columns.order.setups');
        supplierAllOrdersColumnsSetup.DATA = JSON.stringify(this.settingsGroupsAdvancedSupplierPortalComponent.supplierAllOrdersColumnsSetup);
        supplierDelHistColumnsSetup.DATA = JSON.stringify(this.settingsGroupsAdvancedSupplierPortalComponent.supplierDelHistColumnsSetup);
        debugger;

        // assoc
        const associateMediaMediaColumnsOrderSettings = this.getOrAddSettings('associate.media.columns.order.setups');
        const associateMediaVersionColumnsOrderSettings = this.getOrAddSettings('associate.version.columns.order.setups');
        associateMediaVersionColumnsOrderSettings.DATA = JSON.stringify(this.settingsGroupsAdvancedAssociateComponent.associateMediaVersionColumnsOrderSettings);
        associateMediaMediaColumnsOrderSettings.DATA = JSON.stringify(this.settingsGroupsAdvancedAssociateComponent.associateMediaMediaColumnsOrderSettings);
        debugger;


        const advancedAssociateMediaSavedSearchIds: { 'media': number, 'unassociated-media': number } = this.settingsGroupsAdvancedAssociateMediaComponent.getAdvancedAssociateMediaSavedSearchSettings();
        this.advancedUnasMediaAssociateMediaSavedSearchId = advancedAssociateMediaSavedSearchIds['unassociated-media'];
        this.advancedMediaAssociateMediaSavedSearchId = advancedAssociateMediaSavedSearchIds['media'];
        let advancedUnasMediaAssociateMediaSettings = this.getOrAddSettings('associate_media.advanced_search.media.setups');
        let advancedMediaAssociateMediaSettings = this.getOrAddSettings('associate_media.advanced_search.version.setups');
        const advancedUnasMediaAssociateMediaSavedSearchId = this.getOrAddSettings('associate_media.advanced_search.media.setups_saved_search_id');
        const advancedMediaAssociateMediaSavedSearchId = this.getOrAddSettings('associate_media.advanced_search.version.setups_saved_search_id');
        advancedUnasMediaAssociateMediaSettings.DATA = JSON.stringify(this.advancedUnasMediaAssociateMediaSettings);
        advancedMediaAssociateMediaSettings.DATA = JSON.stringify(this.advancedMediaAssociateMediaSettings);
        advancedUnasMediaAssociateMediaSavedSearchId.DATA = JSON.stringify(this.advancedUnasMediaAssociateMediaSavedSearchId);
        advancedMediaAssociateMediaSavedSearchId.DATA = JSON.stringify(this.advancedMediaAssociateMediaSavedSearchId);

        this.associateMediaWFRiseSettings = this.settingsGroupsAdvancedAssociateMediaComponent.getAssociatedMediaWFRiseSettings();
        let associatedMediaWFRiseSettings = this.getOrAddSettings('associate_media.wfrise.setups');
        associatedMediaWFRiseSettings.DATA = JSON.stringify(this.associateMediaWFRiseSettings);
        // Media Portal
        this.advancedAllOrdersSearchCriteria = this.settingsGroupsAdvancedSupplierPortalComponent.getAdvancedSettings("allOrders");
        const advancedAllOrdersSearchCriteria = this.getOrAddSettings(PREFERENCES.allOrdersSearchCriteria);
        advancedAllOrdersSearchCriteria.DATA = JSON.stringify(this.advancedAllOrdersSearchCriteria);

        this.advancedDelHistorySearchCriteria = this.settingsGroupsAdvancedSupplierPortalComponent.getAdvancedSettings("delHistory");
        const advancedDelHistorySearchCriteria = this.getOrAddSettings(PREFERENCES.delHistorySearchCriteria);
        advancedDelHistorySearchCriteria.DATA = JSON.stringify(this.advancedDelHistorySearchCriteria);

        this.versionNameOrder = this.settingsGroupsAdvancedSupplierPortalComponent.getAdvancedSettings("versionNameOrder");
        const versionNameOrder = this.getOrAddSettings(PREFERENCES.versionNameOrder);
        versionNameOrder.DATA = JSON.stringify(this.versionNameOrder);
        //***
        this.versionCompleteSettings = this.settingsGroupsAdvancedSupplierPortalComponent.getVersionCompleteSupplierPortalSettings();
        const versionCompleteSettings = this.getOrAddSettings('supplier_portal.version_complete.setups');
        versionCompleteSettings.DATA = JSON.stringify(this.versionCompleteSettings);

        // supplier portal - grid view for media portal
        this.supplierPortalDefaultViewsAllOrders = this.settingsGroupsAdvancedSupplierPortalComponent.getData('allOrders');
        const supplierPortalDefaultViewsAllOrders = this.getOrAddSettings(PREFERENCES.allOrdersDefaultView);
        supplierPortalDefaultViewsAllOrders.DATA = JSON.stringify(this.supplierPortalDefaultViewsAllOrders);

        this.supplierPortalDefaultViewsDelHistory = this.settingsGroupsAdvancedSupplierPortalComponent.getData('delHistory');
        const supplierPortalDefaultViewsDelHistory = this.getOrAddSettings(PREFERENCES.delHistoryDefaultView);
        supplierPortalDefaultViewsDelHistory.DATA = JSON.stringify(this.supplierPortalDefaultViewsDelHistory);

        const videoBrowserAppSettings = this.getOrAddSettings('videoBrowserAppSettings');
        videoBrowserAppSettings.DATA = JSON.stringify(this.videoBrowserAppSettings);

        const confidenceFeedSettings = this.getOrAddSettings('confidenceFeedSettings');
        confidenceFeedSettings.DATA = JSON.stringify(this.confidenceFeedSettings);

        this.getOrAddSettings(PREFERENCES.termsConditions).DATA = JSON.stringify(this.termsConditionsData);

        const raiseWorkflowSettings = this.getOrAddSettings('raiseWorkflowSettings');
        raiseWorkflowSettings.DATA = JSON.stringify(this.raiseWorkflowSettings);

        const videoPlayerSettings = this.getOrAddSettings('videoPlayerSettings');
        videoPlayerSettings.DATA = JSON.stringify(this.videoPlayerSettings);

        const mainMenuSettings = this.getOrAddSettings('mainMenuSettings');
        mainMenuSettings.DATA = JSON.stringify(this.mainMenuSettings);

        //-------google maps---------
        const googleMapsApiSettings = this.getOrAddSettings('googleMapsApiSettings');
        googleMapsApiSettings.DATA = JSON.stringify(this.googleMapsApiSettings);

        let logoImage = this.logoImages.filter(function (el) {
            return el.select === true;
        });
        if (logoImage.length) {
            let logoImageSettings = this.getOrAddSettings('logoImage');
            logoImageSettings.DATA = JSON.stringify({
                LogoImage: logoImage[0].id
            });
        }

        if (this.uploadSearchSettings) {
            let uploadSearchSettings = this.getOrAddSettings('uploadSettings');
            uploadSearchSettings.DATA = JSON.stringify(this.uploadSearchSettings);
        }
        if (this.remoteUploadSearchSettings) {
            let remoteUploadSearchSettings = this.getOrAddSettings('remoteUploadSettings');
            remoteUploadSearchSettings.DATA = JSON.stringify(this.remoteUploadSearchSettings);
        }

        this.settingsGroup.EntityKey = null;
        this.settingsGroup.TM_SETTINGS_KEYS = this.settingsGroup.TM_SETTINGS_KEYS.map(el => {
            el.EntityKey = null;
            el.TM_SETTINGS_GROUPS = null;
            el.TM_SETTINGS_GROUPS = null;
            el.TM_SETTINGS_GROUPSReference = null;
            return el;
        });

        this.loading = true;

        this.settingsGroupsService.saveSettingsGroup(this.settingsGroup).pipe(
            takeUntil(this.destroyed$)
        ).subscribe(res => {
            this.settingsGroup.ID = res.ID;
            this.loading = false;
            this.notificationRef.notifyShow(1, 'settings_group.save_success');
            // logoImage[0] && this.settingsGroupsService.logoChanged.emit(logoImage[0].id);
            this.settingsGroupsService.getSettingsUserById('defaultSearchColumnsMedia').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                if (res && res.length > 0) {
                    if (res[0].DATA != null) {
                        // var data = JSON.parse(res[0].DATA);
                        // write data as string like another user group settings
                        this.sessionStorage.store(this.storagePrefix + "." + "defaultSearchColumnsMedia", res[0].DATA);
                    }
                }
            });
            this.settingsGroupsService.getSettingsUserById('defaultSearchColumnsVersion').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                if (res && res.length > 0) {
                    if (res[0].DATA != null) {
                        // var data = JSON.parse(res[0].DATA);
                        // write data as string like another user group settings
                        this.sessionStorage.store(this.storagePrefix + "." + "defaultSearchColumnsVersion", res[0].DATA);
                    }
                }
            });
            this.settingsGroupsService.getSettingsUserById('defaultSearchColumnsSimple').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                if (res && res.length > 0) {
                    if (res[0].DATA != null) {
                        // var data = JSON.parse(res[0].DATA);
                        // write data as string like another user group settings
                        this.sessionStorage.store(this.storagePrefix + "." + "defaultSearchColumnsSimple", res[0].DATA);
                    }
                }
            });

            this.settingsGroupsService.getSettingsUserById('defaultSearchColumnsTitle').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                if (res && res.length > 0) {
                    if (res[0].DATA != null) {
                        // var data = JSON.parse(res[0].DATA);
                        // write data as string like another user group settings
                        this.sessionStorage.store(this.storagePrefix + "." + "defaultSearchColumnsTitle", res[0].DATA);
                    }
                }
            });

            this.settingsGroupsService.getSettingsUserById('defaultSearchColumnsMediaPortal').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                if (res && res.length > 0) {
                    if (res[0].DATA != null) {
                        // var data = JSON.parse(res[0].DATA);
                        // write data as string like another user group settings
                        this.sessionStorage.store(this.storagePrefix + "." + "defaultSearchColumnsMediaPortal", res[0].DATA);
                    }
                }
            });

            this.settingsGroupsService.getSettingsUserById('defaultSearchColumnsVideoBrowser').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                if (res && res.length > 0) {
                    if (res[0].DATA != null) {
                        // var data = JSON.parse(res[0].DATA);
                        // write data as string like another user group settings
                        this.sessionStorage.store(this.storagePrefix + "." + "defaultSearchColumnsVideoBrowser", res[0].DATA);
                    }
                }
            });

            this.settingsGroupsService.getSettingsUserById('defaultSearchMisrDetailsMediaColumns').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                if (res && res.length > 0) {
                    if (res[0].DATA != null) {
                        // var data = JSON.parse(res[0].DATA);
                        // write data as string like another user group settings
                        this.sessionStorage.store(this.storagePrefix + "." + "defaultSearchMisrDetailsMediaColumns", res[0].DATA);
                    }
                }
            });
            this.settingsGroupsService.getSettingsUserById('versionCreationSettings').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                if (res && res.length > 0) {
                    if (res[0].DATA != null) {
                        // var data = JSON.parse(res[0].DATA);
                        // write data as string like another user group settings
                        this.sessionStorage.store(this.storagePrefix + "." + "versionCreationSettings", res[0].DATA);
                    }
                }
            });
            this.settingsGroupsService.getSettingsUserById('raiseWorkflowSettings').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                if (res && res.length > 0) {
                    if (res[0].DATA != null) {
                        // var data = JSON.parse(res[0].DATA);
                        // write data as string like another user group settings
                        this.sessionStorage.store(this.storagePrefix + "." + "raiseWorkflowSettings", res[0].DATA);
                    }
                }
            });
            this.settingsGroupsService.getSettingsUserById('videoPlayerSettings').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                if (res && res.length > 0) {
                    if (res[0].DATA != null) {
                        // var data = JSON.parse(res[0].DATA);
                        // write data as string like another user group settings
                        this.sessionStorage.store(this.storagePrefix + "." + "videoPlayerSettings", res[0].DATA);
                    }
                }
            });
            this.settingsGroupsService.getSettingsUserById('mainMenuSettings').pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                if (res && res.length > 0) {
                    if (res[0].DATA != null) {
                        // var data = JSON.parse(res[0].DATA);
                        // write data as string like another user group settings
                        this.sessionStorage.store(this.storagePrefix + "." + "mainMenuSettings", res[0].DATA);
                    }
                }
            });
            this.serverStorage.clear('associate_media_workflow').subscribe(() => {
                // this.modalRef.hide();
                // clearobs.unsubscribe();
            });
            this.serverStorage.clear('media_associate_media_workflow').subscribe(() => {
                // this.modalRef.hide();
                // clearobs.unsubscribe();
            });
            this.notificationRef.notifyShow(1, 'settings_group.re_login');
            this.cdr.detectChanges();
        }, (err: HttpErrorResponse) => {
            this.notificationRef.notifyShow(2, err.error.Message);
            this.loading = false;
            this.cdr.detectChanges();
        });


    }

}
