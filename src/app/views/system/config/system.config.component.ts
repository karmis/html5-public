import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { SystemConfigXmlComponent } from "./comps/xml/xml.component";
import { ServiceConfigService } from "../../../services/system.config/settings.service-config.service";
import { SecurityService, systemModes } from "../../../services/security/security.service";
import { IMFXControlsTreeComponent } from "../../../modules/controls/tree/imfx.tree";
import { SettingsUserManagerComponent } from "./comps/settings.user-manager/settings.user-manager.component";
import { DetailsViewCustomMetadataConfig } from "./comps/detail.view.custommetadata.config/detail.view.custommetadata.config.component";
import { BaseProvider } from "../../base/providers/base.provider";
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'system-config',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    entryComponents: [
        SystemConfigXmlComponent
    ],
    providers: [
        ServiceConfigService
    ]
})
export class SystemConfigComponent implements OnInit {
    filterText = '';
    protected isDevOrTestMode: boolean = false;
    @ViewChild('detailsMetadataSubtree', {static: false}) private detailsMetadataSubtree: IMFXControlsTreeComponent;
    @ViewChild('userManager', {static: false}) private userManager: SettingsUserManagerComponent;
    @ViewChild('detailsCustomMetadataConfig', {static: false}) private detailsCustomMetadataConfig: DetailsViewCustomMetadataConfig;
    private selectedComponent: "ug" | "xml" | "gs" | "sc" | "ct" | "ch" | "chg" | "ss" | "um" | ""
        | "cm_destination_dev" | "cm_source_devices" | "cm_channel_templates" | "cm_wf_matrix" |
        "misr_templates_comp" | "misr_components_comp" | "misr_audio_subs" | "tc" | "pt";
    private typesList = [];
    private selectedserviceConfigType = null;
    private isHidden = false;
    private selectedDetailMetadata = {
        detailType: null,
        detailSubType: null,
        selectedId: null,
        detailSubTypeFriendlyName: null
    };
    private selectedCustomMetadata = null;
    private userManagerIdList = ["USERS", "GROUPS", "NOTIFICATIONS", "VIEWS"];
    private customMetadataIdList = [
        {
            key: 1,
            val: "Some Item 1"
        },
        {
            key: 2,
            val: "Some Item 2"
        },
        {
            key: 3,
            val: "Some Item 3"
        }
    ];
    private selectedTable = null;
    private selectedCategory = null;
    private selectedSubCategory = null;
    private menuItems: {
        title: string,
        item?: string,
        callback?: void,
        children?: any[],
        isDevOrTestMode?: boolean,
        permissionByName?: string
    }[] = [
        { //Channel Manager
            title: 'channels.manager_title',
            children: [
                {
                    title: 'channels.title',
                    item: 'ch'
                },
                {
                    title: 'channels-groups.title',
                    item: 'chg'
                }
            ]
        },
        { //Cache Manager
            title: 'base.cachemanager',
            permissionByName: 'cachemanager-config',
            children: [
                {
                    title: 'cachemanager.config.destination_dev',
                    item: 'cm_destination_dev'
                },
                {
                    title: 'cachemanager.config.source_devices',
                    item: 'cm_source_devices'
                },
                {
                    title: 'cachemanager.config.channel_templates',
                    item: 'cm_channel_templates'
                },
                {
                    title: 'cachemanager.config.wf_matrix',
                    item: 'cm_wf_matrix'
                }
            ]
        },
        { //Misr Manager
            title: 'base.misrmanager',
            children: [
                {
                    title: 'misrmanager.config.misr_templates_comp',
                    item: 'misr_templates_comp'
                },
                {
                    title: 'misrmanager.config.misr_components_comp',
                    item: 'misr_components_comp'
                },
                {
                    title: 'misrmanager.config.misr_audio_subs_comp',
                    item: 'misr_audio_subs'
                }
            ]
        },
        { //Config Tables
            title: 'config_tables.title',
            item: 'ct'
        },
        { //Global Settings
            title: 'global_settings.title',
            // item: 'gs'
            children: [
                {
                    title: 'global_settings.system_config_title',
                    item: 'gl' //'global'
                },
                {
                    title: 'global_settings.grafana',
                    item: 'gf' // 'grafana'
                },
                {
                    title: 'global_settings.player_shortcuts.title',
                    item: 'ph' // 'html-player-hotkeys'
                },
                {
                    title: 'settings_group.branding.title_tab',
                    item: 'li' // 'loading-icons'
                },
                {
                    title: 'settings_group.event_config.title',
                    item: 'ec' // 'event-config'
                },
                {
                    title: 'settings_group.taxonomy_config.title',
                    item: 'tx' // 'taxonomy-config'
                }
            ]
        },
        { //Settings Group
            title: 'settings_group.title',
            item: 'ug'
        },
        { //Load Master
            title: 'load_master.title',
            item: 'lm'
        },
        { //Services Configuration
            title: 'global_settings.service_config',
            children: []
        },
        { //User Management
            title: 'user_management.title',
            children: [
                {
                    title: 'user_management.users.title',
                    item: 'um'
                },
                {
                    title: 'user_management.groups.title',
                    item: 'um'
                },
                {
                    title: 'user_management.notifications.title',
                    item: 'um'
                },
                {
                    title: 'user_management.views.title',
                    item: 'um'
                }
            ]
        },
        // { //Custom Metadata
        //     title: 'details_view_custommetadata.title',
        //     children: []
        // },
        { //XML Configuration
            title: 'global_settings.xml_config',
            children: [
                {
                    title: 'system-config.xml.title',
                    item: 'xml'
                },
                {
                    title: 'system-config.xslt.title',
                    item: 'xslt'
                }
            ]
        },
        { //System Settings
            title: 'system_settings.title',
            item: 'ss'
        },
        { //Production
            title: 'production.title',
            children: [
                {
                    title: 'production.template_config.title',
                    item: 'tc'
                },
                {
                    title: 'production.production_templates.title',
                    item: 'pt'
                }
            ]
        }
    ];
    private categories = [];
    private globalSettingsConfig: any = {};

    constructor(protected cdr: ChangeDetectorRef,
                protected securityService: SecurityService,
                protected serviceConfigService: ServiceConfigService,
                protected baseProvider: BaseProvider,
                protected translate: TranslateService,
    ) {

    }

    ngOnInit() {
        if (this.moduleAllowed()) {
            this.selectItem("ug");
        } else {
            this.selectedComponent = "";
        }
        let self = this;
        this.serviceConfigService.getSettingsServiceConfigTypesList().subscribe((res: any) => {
            self.typesList = [];
            let keys = Object.keys(res);
            for (var i = 0; i < keys.length; i++) {
                self.typesList.push({
                    key: keys[i],
                    val: res[keys[i]]
                });
            }

            //entry service config
            // const item = self.menuItems.find(el => el.title == 'global_settings.service_config');
            // item.children = self.typesList.map(el => ({title: el.val, item: el.key}));
            self.menuItems[7].children = self.typesList.map(el => ({
                title: el.val,
                item: 'sc',
                callback: () => {
                    self.selectTypeItem(el.key);
                }
            }));

            this.prepareCategories();
        });

        // //entry custom metadata data
        // self.menuItems[9].children = self.customMetadataIdList.map(el => ({
        //     title: el.val,
        //     item: 'dvcm',
        //     callback: () => {
        //         self.selectCustomMetadataId(el.key);
        //     }
        // }));

        //entry user manager data
        self.menuItems[8].children.forEach((el, i) => {
            el.callback = () => {
                self.selectUserManager(self.userManagerIdList[i]);
            };
        });

        this.isDevOrTestMode = this.baseProvider.isDevServer || this.baseProvider.isTestServer;
    }

    moduleAllowed() {
        return this.securityService.getCurrentMode() != systemModes.ConfigOnly;
    }

    clickCategory(i) {
        if (this.selectedCategory == i) {
            this.selectedCategory = null;
        } else {
            this.selectedCategory = i;
        }

    }

    clickSubCategory(i, j) {
        this.selectedCategory = i;
        this.selectedSubCategory = j;
    }

    isInCategory(item) {
        return !!item.children.find(el => el.item == this.selectedComponent);
    }

    selectTypeItem(id) {
        this.selectedserviceConfigType = -1;
        this.cdr.detectChanges();
        this.selectedserviceConfigType = id;
        this.selectItem('sc');
    }

    selectUserManager(type) {
        this.cdr.detectChanges();
        this.selectedTable = type;
        this.userManager.selectTable(type);
    }

    selectCustomMetadataId(key) {
        this.selectedCustomMetadata = key;
        this.selectItem('dvcm');
        setTimeout(() => {
            this.detailsCustomMetadataConfig.updateData();
        });
    }

    toggleSidebar() {
        this.isHidden = !this.isHidden;
        this.cdr.detectChanges();
    }

    selectItem(i) {
        // if (i != 'sc') {
        //     this.showTypesState = false;
        //     this.selectedserviceConfigType = null;
        // }
        this.selectedComponent = i;
    }

    prepareCategories() {
        const categories = [];
        this.menuItems.forEach((cat) => {
            const newCat = Object.assign({}, cat, {title: this.translate.instant(cat.title), children: []});
            // newCat.callback = cat.callback;
            if (cat.children && cat.children.length > 0) {
                let hasFlag = false;
                cat.children.forEach((child) => {
                    const newChild = Object.assign({}, child, {
                        title: this.translate.instant(child.title),
                        children: []
                    });

                    if (newChild.title.toLowerCase().includes(this.filterText.toLowerCase())) {
                        hasFlag = true;
                        newCat.children.push(newChild);
                    }
                });
                newCat.children.sort((a, b) => {
                    return (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0);
                });
                if (hasFlag) {
                    categories.push(newCat);
                }
            } else {
                if (newCat.title.toLowerCase().includes(this.filterText.toLowerCase())) {
                    categories.push(newCat);
                }
            }

        });
        categories.sort((a, b) => {
            return (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0);
        })
        this.categories = categories;
        // return subCats;
    }

    onChangeConfig($event) {
        this.globalSettingsConfig = $event;
        this.cdr.markForCheck();
    }

    menuFilterKeyup($event) {
        this.filterText = $event.target.value;
        this.prepareCategories();
    }
}
