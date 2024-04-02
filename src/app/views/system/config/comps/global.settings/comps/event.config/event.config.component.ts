import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnInit,
    Output,
    Input,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectionStrategy, OnChanges, AfterViewInit, SimpleChanges, ElementRef
} from '@angular/core';
import { lazyModules } from "../../../../../../../app.routes";
import {Subject} from "rxjs";
import {DetailViewConfigService} from "../../../detail.view.metadata.config/services/settings.default.view.config.service";
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import {SessionStorageService} from "ngx-webstorage";
import {takeUntil} from "rxjs/operators";
import {DndDropEvent, DropEffect} from "ngx-drag-drop";
import {SystemConfigCommonProvider} from "../../../../providers/system.config.common.provider";

@Component({
    selector: 'global-settings-event-config',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DetailViewConfigService, SystemConfigCommonProvider]
})

export class GlobalSettingsEventConfigComponent {
    @Input('settingsGroup') public settingsGroup;
    @ViewChild('eventConfigWrapper', {static: true}) private eventConfigWrapper : ElementRef;
    @ViewChild('eventConfigOverlay', {static: true}) private eventConfigOverlay;

    private initialData;
    private layoutList = [];
    private fieldsList = [];
    private groupId = 1;
    private allActive = false;
    private destroyed$: Subject<any> = new Subject();

    constructor(protected service: DetailViewConfigService,
                protected notificationRef: NotificationService,
                public sessionStorage: SessionStorageService,
                protected cd: ChangeDetectorRef,
                public sccp: SystemConfigCommonProvider) {
    }

    ngOnInit() {
        this.updateData();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    toggleOverlay(show) {
        if(show) {
            this.eventConfigOverlay.show(this.eventConfigWrapper.nativeElement);
        }
        else {
            this.eventConfigOverlay.hide(this.eventConfigWrapper.nativeElement);
        }
        this.cd.detectChanges();
    }

    updateData() {
        this.toggleOverlay(true);
        this.service.getEventAllConfigColumns()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) =>{
                this.layoutList = [];
                this.fieldsList = [];
                this.groupId = 1;

                this.initialData = res;

                var fieldsKeys = Object.keys(res.AllColumns);
                for(var i = 0; i < fieldsKeys.length; i++) {
                    this.fieldsList.push({
                        data: {
                            Id: res.AllColumns[fieldsKeys[i]].BindingName,
                            Title: res.AllColumns[fieldsKeys[i]].FriendlyName
                        },
                        effectAllowed: "move",
                        disable: false,
                        handle: false,
                    });
                }
                this.service.getEventConfigData()
                    .pipe(takeUntil(this.destroyed$))
                    .subscribe((resp: any) =>{
                        if(resp !== null) { // if there is no event config the request returns null
                            this.fieldsList = [];
                            var fieldsKeys = Object.keys(resp.AllColumns);
                            for(var i = 0; i < fieldsKeys.length; i++) {
                                this.fieldsList.push({
                                    data: {
                                        Id: fieldsKeys[i],
                                        Title: resp.AllColumns[fieldsKeys[i]]
                                    },
                                    effectAllowed: "move",
                                    disable: false,
                                    handle: false,
                                });
                            }
                            for(var i = 0; i < resp.Groups.length; i++) {
                                this.layoutList.push({
                                    data: {
                                        GroupID: this.groupId,
                                        GroupName: "Fields Group"
                                    },
                                    effectAllowed: "move",
                                    disable: false,
                                    handle: false,
                                    children: []
                                });
                                this.groupId++;

                                for(var j = 0; j < resp.Groups[i].Columns.length; j++) {
                                    this.layoutList[this.layoutList.length - 1].children.push({
                                        data: {
                                            Id: resp.Groups[i].Columns[j].Id,
                                            Title: resp.Groups[i].Columns[j].Title
                                        },
                                        effectAllowed: "move",
                                        disable: false,
                                        handle: false,

                                    });
                                }
                            }
                        }

                        this.fieldsList.sort(this.compare);
                        this.toggleOverlay(false);
                    },
                        (err) => {
                            if (err.error && err.error.Error) {
                                this.toggleOverlay(false);
                                this.notificationRef.notifyShow(2, err.error.Error);
                            }
                        });

            });
    }

    compare(a, b) {
        const t1 = a.data.Title.toUpperCase();
        const t2 = b.data.Title.toUpperCase();

        let comparison = 0;
        if (t1 > t2) {
            comparison = 1;
        } else if (t1 < t2) {
            comparison = -1;
        }
        return comparison;
    }

    addFieldGroup() {
        this.layoutList.push({
            data: {
                GroupID: this.groupId,
                GroupName:"Fields Group"
            },
            effectAllowed: "move",
            disable: false,
            handle: false,
            children: []
        });
        this.groupId++;
    }

    onDragStart( event:DragEvent ) {
        //console.log("On Drag Start!")
    }

    onDragged( item:any, list:any[], effect:DropEffect ) {
        if( effect === "move" ) {
            const index = list.indexOf( item );
            list.splice( index, 1 );
        }
    }

    onDragEnd( event:DragEvent ) {
        //console.log("On Drag End!")
    }

    onDrop( event:DndDropEvent, list?:any[] ) {
        if(list && (event.dropEffect === "move") ) {
            let index = event.index;

            if( typeof index === "undefined" ) {

                index = list.length;
            }

            if(event.data.selected) {
                for(var i = 0; i < this.fieldsList.length; i++) {
                    if(this.fieldsList[i].selected) {
                        list.splice( index, 0, this.fieldsList[i] );
                    }
                }
                var tmp = this.fieldsList.filter((x)=>{
                    return x.selected;
                });
                this.fieldsList = this.fieldsList.filter((x)=>{
                    var valid = !x.selected;
                    if(!valid)
                        x.selected = false;
                    return valid;
                });
            }
            else {
                for(var i = 0; i < this.fieldsList.length; i++) {
                    this.fieldsList[i].selected = false;
                }
                list.splice( index, 0, event.data );
            }

            this.cd.detectChanges();
        }
    }

    saveLayout() {
        this.toggleOverlay(true);
        var data = {
            Groups: this.layoutList.map((val, index) => {
                return {
                    Columns: val.children ? val.children.map((val2, index2) => {
                        return {
                            Id: val2.data.Id,
                            Title: val2.data.Title
                        }
                    }) : []
                }
            })
        };

        this.service.updateEventConfig(data).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            if (res && res.Error) {
                this.toggleOverlay(false);
                this.notificationRef.notifyShow(2, res.Error);
            } else {
                this.notificationRef.notifyShow(1, 'events_detail.event_config.saved');
                this.toggleOverlay(false);
            }
        });
    }

}
