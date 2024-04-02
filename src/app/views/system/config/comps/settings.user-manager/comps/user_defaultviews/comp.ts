import {ChangeDetectorRef, Component, Inject, ViewChild, ViewEncapsulation} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {UserManagerService} from "../../services/settings.user-manager.service";
import {TreeStandardListTypes} from "../../../../../../../modules/controls/tree/types";
import {LookupSearchLocationService} from "../../../../../../../services/lookupsearch/location.service";
import {IMFXControlsTreeComponent} from "../../../../../../../modules/controls/tree/imfx.tree";
import {ViewsService} from "../../../../../../../modules/search/views/services/views.service";
import {IMFXControlsSelect2Component} from "../../../../../../../modules/controls/select2/imfx.select2";
import {Select2ListTypes} from "../../../../../../../modules/controls/select2/types";
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import {OverlayComponent} from "../../../../../../../modules/overlay/overlay";
import {SystemConfigCommonComp} from "../../../system.config.common.comp";
import {SystemConfigCommonProvider} from "../../../../providers/system.config.common.provider";

@Component({
    selector: 'user-default-views',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        './styles/styles.scss'
    ],
    providers: [
        LookupSearchLocationService,
        UserManagerService,
        ViewsService,
        SystemConfigCommonProvider
    ]
})
export class SettingsUserDefaultViewsComponent extends SystemConfigCommonComp {
    @ViewChild('titleSelect', {static: false}) titleSelect: IMFXControlsSelect2Component;
    @ViewChild('versionSelect', {static: false}) versionSelect: IMFXControlsSelect2Component;
    @ViewChild('mediaSelect', {static: false}) mediaSelect: IMFXControlsSelect2Component;
    @ViewChild('carrierSelect', {static: false}) carrierSelect: IMFXControlsSelect2Component;
    @ViewChild('digitalCarrierSelect', {static: false}) digitalCarrierSelect: IMFXControlsSelect2Component;
    @ViewChild('bookingsSelect', {static: false}) bookingsSelect: IMFXControlsSelect2Component;
    hasUnsaved = false;
    @ViewChild('viewsWrapper', {static: true}) private viewsWrapper: any;
    @ViewChild('overlay', {static: true}) private overlay: OverlayComponent;
    @ViewChild('locationsTree', {static: false}) private tree: IMFXControlsTreeComponent;
    private initialLocations = null;
    private initialLocationsBackup = null;
    private locations: TreeStandardListTypes = [];
    private itemData = null;
    private viewTypes = [3005, 4500, 4000, 4001, 4002, 14];
    private viewTypesTranslates = ["titleselect", "versionselect", "mediaselect", "carrierselect", "digitalcarriers", "bookings"];
    private typesRefs;
    private viewsLookup = {
        "3005": [],
        "4500": [],
        "4000": [],
        "4001": [],
        "4002": [],
        "14": []
    };
    private dataLookup = [];
    private dataLookupBackup = [];

    constructor(@Inject(TranslateService) protected translate: TranslateService,
                @Inject(UserManagerService) protected userManagerService: UserManagerService,
                @Inject(ViewsService) protected viewsService: ViewsService,
                protected notificationService: NotificationService,
                protected cdr: ChangeDetectorRef) {
        super()
    }

    ngOnInit() {
        this.overlay.show(this.viewsWrapper.nativeElement);
    }

    ngAfterViewInit() {
        this.initData();
    }

    initData() {
        this.userManagerService.getLocationsConfigsDefaults().subscribe(
            (data) => {
                this.initialLocations = data.Locations;
                this.initialLocationsBackup = $.extend(true, [], data.Locations);
                let normData: TreeStandardListTypes = this.tree.turnArrayOfObjectToStandart(
                    data.Locations,
                    {
                        key: 'ID',
                        title: 'NAM',
                        children: 'DerivedChildren'
                    }
                );
                this.locations = normData;
                this.tree.setSource(this.locations);
                //this.cdr.detectChanges();
                this.initialLocations.forEach((element) => {
                    this.processDataLookup(this, element);
                });
                this.initialLocationsBackup.forEach((element) => {
                    this.processDataLookup(this, element, true);
                });
                data.ViewsLookup.forEach((element) => {
                    this.viewsLookup["" + element.TYPE_ID][element.ID] = element;
                });

                this.typesRefs = [this.titleSelect, this.versionSelect, this.mediaSelect, this.carrierSelect, this.digitalCarrierSelect, this.bookingsSelect];
                for (var i = 0; i < this.viewTypes.length; i++) {
                    let _views: Select2ListTypes = this.viewsLookup["" + this.viewTypes[i]].map((keys) => {
                        return {id: keys['ID'], text: keys['NAME']}
                    });
                    this.typesRefs[i].setData(_views, true);
                }
                this.overlay.hide(this.viewsWrapper.nativeElement);
            },
            (error: any) => {
                console.error('Failed', error);
            }
        );
    }

    processDataLookup(self, element, backup = false) {
        element["CHANGED"] = false;
        if (backup) {
            self.dataLookupBackup["" + element.ID] = element;
        } else {
            self.dataLookup["" + element.ID] = element;
        }

        if (element.DerivedChildren && element.DerivedChildren.length > 0) {
            element.DerivedChildren.forEach((element) => {
                self.processDataLookup(self, element, backup);
            });
        }
    }

    onEnterPress($event) {
        if ($event && $event.event && $event.event.key == "Enter") {
            this.onSelect($event);
        }
    }

    onSelect($event) {
        if ($event.data.targetType != "expander") {
            //Remove this if we need save changes for save, even if we select other location,
            //in this case after Save we save changes which we made in all locations
            // if(false && this.itemData) {
            //     var obj = this.dataLookup[""+this.itemData.key];
            //     var objBk = this.dataLookupBackup[""+this.itemData.key];
            //     obj.TitlesView = objBk.TitlesView;
            //     obj.VersionsView = objBk.VersionsView;
            //     obj.MediaView = objBk.MediaView;
            //     obj.CarriersView = objBk.CarriersView;
            //     obj.DigitalView = objBk.DigitalView;
            //     obj.BookingsView = objBk.BookingsView;
            //     // this.initialLocations = $.extend(true, [],  this.initialLocationsBackup);
            //     // this.initialLocations.forEach((element) => {
            //     //     this.processDataLookup(this, element);
            //     // });
            // }

            this.itemData = $event.data.node;

            for (var i = 0; i < this.locations.length; i++) {
                if ((<any>this.locations[i]).key.toString() == $event.data.node.key) {
                    var obj = (<any>this.locations[i]).dirtyObj;
                    this.typesRefs[0].setSelected(obj.TitlesView);
                    this.typesRefs[1].setSelected(obj.VersionsView);
                    this.typesRefs[2].setSelected(obj.MediaView);
                    this.typesRefs[3].setSelected(obj.CarriersView);
                    this.typesRefs[4].setSelected(obj.DigitalView);
                    this.typesRefs[5].setSelected(obj.BookingsView);
                    return;
                }
                if (this.checkChilds((<any>this.locations[i]), $event.data.node.key)) {
                    return;
                }
            }
        }
    }

    checkChilds(parent, key) {
        if (parent.children && parent.children.length > 0) {
            for (var j = 0; j < parent.children.length; j++) {
                if (parent.children[j].key.toString() == key) {
                    var obj = parent.children[j].dirtyObj;
                    this.typesRefs[0].setSelected(obj.TitlesView);
                    this.typesRefs[1].setSelected(obj.VersionsView);
                    this.typesRefs[2].setSelected(obj.MediaView);
                    this.typesRefs[3].setSelected(obj.CarriersView);
                    this.typesRefs[4].setSelected(obj.DigitalView);
                    this.typesRefs[5].setSelected(obj.BookingsView);
                    return true;
                }
                if (this.checkChilds(parent.children[j], key)) {
                    return true;
                }
            }
        }
        return false;
    }

    onSelectView(type, data) {
        for (var j = 0; j < this.viewTypes.length; j++) {
            if (this.viewTypes[j] == type) {
                this.selLocationValue(type, data);
                break;
            }
        }
    }

    selLocationValue(typeIndex, data) {
        var newId = null
        if (data != null) {
            newId = parseInt(data.params.data[0].id);
        }
        var obj = this.dataLookup["" + this.itemData.key];
        var objBk = this.dataLookupBackup["" + this.itemData.key];

        switch (typeIndex) {
            case this.viewTypes[0]:
                if (obj.TitlesView != newId && objBk.TitlesView != newId) {
                    obj["CHANGED"] = true;
                } else if (objBk.TitlesView == newId) {
                    obj["CHANGED"] = false;
                }
                obj.TitlesView = newId;
                this.typesRefs[0].setSelected(obj.TitlesView);
                break;
            case this.viewTypes[1]:
                if (obj.VersionsView != newId && objBk.VersionsView != newId) {
                    obj["CHANGED"] = true;
                } else if (objBk.VersionsView == newId) {
                    obj["CHANGED"] = false;
                }
                obj.VersionsView = newId;
                this.typesRefs[1].setSelected(obj.VersionsView);
                break;
            case this.viewTypes[2]:
                if (obj.MediaView != newId && objBk.MediaView != newId) {
                    obj["CHANGED"] = true;
                } else if (objBk.MediaView == newId) {
                    obj["CHANGED"] = false;
                }
                obj.MediaView = newId;
                this.typesRefs[2].setSelected(obj.MediaView);
                break;
            case this.viewTypes[3]:
                if (obj.CarriersView != newId && objBk.CarriersView != newId) {
                    obj["CHANGED"] = true;
                } else if (objBk.CarriersView == newId) {
                    obj["CHANGED"] = false;
                }
                obj.CarriersView = newId;
                this.typesRefs[3].setSelected(obj.CarriersView);
                break;
            case this.viewTypes[4]:
                if (obj.DigitalView != newId && objBk.DigitalView != newId) {
                    obj["CHANGED"] = true;
                } else if (objBk.DigitalView == newId) {
                    obj["CHANGED"] = false;
                }
                obj.DigitalView = newId;
                this.typesRefs[4].setSelected(obj.DigitalView);
                break;
            case this.viewTypes[5]:
                if (obj.BookingsView != newId && objBk.BookingsView != newId) {
                    obj["CHANGED"] = true;
                } else if (objBk.BookingsView == newId) {
                    obj["CHANGED"] = false;
                }
                obj.BookingsView = newId;
                this.typesRefs[5].setSelected(obj.BookingsView);
                break;
        }

        this.hasUnsaved = this.dataLookup.filter((elem) => elem["CHANGED"]).length > 0;
        this.tree.updateChanged();
    }

    saveLocationsDefaults() {
        this.overlay.show(this.viewsWrapper.nativeElement);
        this.userManagerService.saveLocations(this.initialLocations).subscribe(
            (data) => {
                this.notificationService.notifyShow(1, this.translate.instant("user_management.users.modal.save_success"));
                this.initialLocationsBackup = $.extend(true, [], this.initialLocations);
                this.initialLocations.forEach((element) => {
                    this.processDataLookup(this, element);
                });
                this.initialLocationsBackup.forEach((element) => {
                    this.processDataLookup(this, element, true);
                });
                this.tree.updateChanged();
                this.overlay.hide(this.viewsWrapper.nativeElement);
            },
            (error: any) => {
                console.error('Failed', error);
            }
        );

    }
}
