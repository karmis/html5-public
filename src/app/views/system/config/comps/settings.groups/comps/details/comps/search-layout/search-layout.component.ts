import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {UserManagerService} from "../../../../../settings.user-manager/services/settings.user-manager.service";
import {XMLService} from "../../../../../../../../../services/xml/xml.service";

import * as l from 'lodash';
import {IMFXSchemaTreeComponent} from "../../../../../xml/components/schema.tree/schema.tree.component";
import {map} from "rxjs/operators";
import {XmlSchemaListTypes} from "../../../../../../../../../modules/controls/xml.tree/types";
import {XmlSchemaListPipe} from "../../../../../../../../../modules/pipes/xml.schema.list/xml.schema.list.pipe";

@Component({
    selector: 'settings-groups-detail-search-layout',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        UserManagerService
    ]
})

export class SettingsGroupsDetailsSearchLayoutComponent implements OnInit {

    @ViewChild('SchemasTree', {static: false}) private tree: IMFXSchemaTreeComponent;

    // @Input('context') private context: any;
    // @Input('settingsGroup') private settingsGroup: any;
    @Input('layoutSettings') private layoutSettings: any;
    @Output('changeSearchLayout') private changeSearchLayout: EventEmitter<any> = new EventEmitter<any>();

    private media_tabsOrder = null;
    private media_defaultSchema = null;
    private media_defaultTab = null;

    private associate_tabsOrder = null;
    private associate_defaultSchema = null;
    private associate_defaultTab = null;

    private schemaSelectionActive = false;

    private schemas: any = [];
    private schemaTypes: any = [];
    private originSchemas: any[] = [];
    private originSchemaTypes: any[] = [];

    private data = {
        mediaSearch: {
            tabsOrder: [
                {Id: 0, Name: "Info"},
                {Id: 1, Name: "Timed Text"},
                {Id: 2, Name: "Locators"},
                {Id: 3, Name: "Metadata"}
            ],
            defaultSchema: null,
            defaultTab: 0
        },
        associate: {
            tabsOrder: [
                {Id: 0, Name: "Info"},
                {Id: 1, Name: "Timed Text"},
                {Id: 2, Name: "Locators"},
                {Id: 3, Name: "Metadata"}
            ],
            defaultSchema: null,
            defaultTab: 0
        }

    };

    constructor(@Inject(UserManagerService) protected userManagerService: UserManagerService,
                private xmlService: XMLService,
                private cdr: ChangeDetectorRef,
                public xmlSchemaListPipe: XmlSchemaListPipe) {

    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        if (this.layoutSettings != null && !$.isEmptyObject(this.layoutSettings)) {
            if (this.layoutSettings.mediaSearch != null && !$.isEmptyObject(this.layoutSettings.mediaSearch)) {
                this.data.mediaSearch = this.layoutSettings.mediaSearch;
            } else if (this.layoutSettings.tabsOrder != null && !$.isEmptyObject(this.layoutSettings.tabsOrder)) { // TODO: remove it some latter
                this.data.mediaSearch = l.cloneDeep(this.layoutSettings);
                this.data.associate = l.cloneDeep(this.layoutSettings);
            }
            if (this.layoutSettings.associate != null && !$.isEmptyObject(this.layoutSettings.associate)) {
                this.data.associate = this.layoutSettings.associate;
            }
        }

        this.media_tabsOrder = this.data.mediaSearch.tabsOrder;
        this.media_defaultSchema = this.data.mediaSearch.defaultSchema;
        this.media_defaultTab = this.data.mediaSearch.defaultTab;
        this.associate_tabsOrder = this.data.associate.tabsOrder;
        this.associate_defaultSchema = this.data.associate.defaultSchema;
        this.associate_defaultTab = this.data.associate.defaultTab;

        this.onChangeSearchLayout();
        let self = this;
        this.xmlService.getSchemaList()
            .pipe(map((res: XmlSchemaListTypes) => {
                    const originSchemaTypes = this.xmlSchemaListPipe.transform(res);
                    if (this.tree && false === $.isEmptyObject(originSchemaTypes)) {
                        this.tree.initManually(originSchemaTypes);
                        setTimeout(() => {
                            this.tree.setFocus();
                        }, 0);

                        // this.toggleOverlay(false);
                        this.cdr.detectChanges()
                    }
                },
                (error: any) => {
                    console.error('Failed', error);
                }
            ));
    }

    openSchemaSelection(prefix) {
        this.tree.selectedItemId = this[prefix + '_defaultSchema'] != null ? this[prefix + '_defaultSchema'].Id : null;
    }

    onSelectSchema($event, prefix) {
        this[prefix + '_defaultSchema'] = {
            Id: $event.item.Id,
            Name: $event.item.Name,
        };
        this.schemaSelectionActive = false;
        this.tree.selectedItemId = this[prefix + '_defaultSchema'].Id;
        this.onChangeSearchLayout();
    }

    cleanSchema(prefix) {
        this[prefix + '_defaultSchema'] = null;
        this.onChangeSearchLayout();
        this.tree.selectedItemId = null;
    }

    changeDefaultTab(id, prefix) {
        this[prefix + '_defaultTab'] = id;
        this.onChangeSearchLayout();
    }

    listSorted($event, prefix) {
        this[prefix + '_tabsOrder'] = $event;
        this.onChangeSearchLayout();
    }

    onChangeSearchLayout() {
        this.changeSearchLayout.emit({
            mediaSearch: {
                tabsOrder: this.media_tabsOrder,
                defaultSchema: this.media_defaultSchema,
                defaultTab: this.media_defaultTab
            },
            associate: {
                tabsOrder: this.associate_tabsOrder,
                defaultSchema: this.associate_defaultSchema,
                defaultTab: this.associate_defaultTab
            }
        });
    }
}
