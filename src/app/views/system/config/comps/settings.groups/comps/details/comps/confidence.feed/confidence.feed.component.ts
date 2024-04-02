import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnInit,
    Output,
    Input,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectionStrategy, OnChanges, AfterViewInit, SimpleChanges, ViewChildren, QueryList, Injector
} from '@angular/core';
import { IMFXModalProvider } from '../../../../../../../../../modules/imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../../../../../../../../../modules/imfx-modal/imfx-modal';
import { lazyModules } from '../../../../../../../../../app.routes';
import { IMFXModalPromptComponent } from '../../../../../../../../../modules/imfx-modal/comps/prompt/prompt';
import { IMFXModalEvent } from '../../../../../../../../../modules/imfx-modal/types';
import { map } from 'rxjs/operators';
import { HttpService } from '../../../../../../../../../services/http/http.service';
import { IMFXControlsSelect2Component } from '../../../../../../../../../modules/controls/select2/imfx.select2';
import { DndDropEvent, DropEffect } from 'ngx-drag-drop';
import { IMFXModalAlertComponent } from '../../../../../../../../../modules/imfx-modal/comps/alert/alert';

@Component({
    selector: 'settings-groups-confidence-feed',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class ConfidenceFeedComponent implements OnInit, OnChanges, AfterViewInit {
    @Input('settings') private settings;
    @Output('changedSettings') private changedSettings: EventEmitter<any> = new EventEmitter<any>();
    @ViewChildren('controls') public controls: QueryList<IMFXControlsSelect2Component>;

    selectedItemId = null;

    devices = [];
    selectedDevices = [];

    data: any[] = [
        {
            id: 0,
            pageName: 'Page 1',
            devices: [1, 10]
        },
        {
            id: 1,
            pageName: 'Page 2',
            devices: [2058]
        },
        {
            id: 2,
            pageName: 'Page 3',
            devices: []
        },
    ]

    constructor(
        private cdr: ChangeDetectorRef,
        private modalProvider: IMFXModalProvider,
        private injector: Injector,
        public httpService: HttpService
    ) {

    }

    ngOnInit() {
        this.httpService
            .get(
                '/api/v3/Config/ConfidenceFeedDevices'
            ).pipe(
            map((res: any) => {
                return res.body;
            })).subscribe(data => {
            this.devices = data.map(el => {
                return {
                    text: el.NAME,
                    id: el.ID
                }
            })
        })
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        if (simpleChanges.settings && simpleChanges.settings.currentValue) {
            this.setValues(simpleChanges.settings.currentValue);
        }
    }

    ngAfterViewInit() {
    }

    setValues(val: any[]) {
        const obj = JSON.parse(JSON.stringify(val));
        if ($.isEmptyObject(obj) && !Array.isArray(obj)) {
            return;
        }
        this.data = obj;
    }

    onChangedSettings() {
        this.changedSettings.emit(this.data);
    }

    onSelectPage(item) {
        this.selectedItemId = item.id;
        this.setDevices();
        this.onChangedSettings();
    }

    addItems() {
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.imfx_modal_prompt,
            IMFXModalPromptComponent, {
                size: 'md',
                title: 'Add Page',
                position: 'center',
                footer: 'cancel|ok'
            });
        modal.load().then(cr => {
            const modalContent: IMFXModalPromptComponent = cr.instance;
            modalContent.setLabel('New Page');
            modalContent.setPlaceholder('settings_group.version_creation.modal_add_name.placeholder');
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    const name = modalContent.getValue();

                    this.data.push({
                        id: Math.random(),
                        pageName: name,
                        devices: []
                    });

                    this.onChangedSettings();
                    this.cdr.detectChanges();
                    modal.hide();
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    deletePage(id) {
        const modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
                size: 'sm',
                title: 'modal.titles.confirm',
                position: 'center',
                footer: 'cancel|ok'
            });
        modal.load().then(cr => {
            const modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                'common.confirmation',
            );
            const sub = modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {

                    if (this.selectedItemId === id) {
                        this.selectedItemId = null;
                    }
                    this.data = this.data.filter(el => el.id !== id);
                    this.onChangedSettings();
                }
                sub.unsubscribe();
                modal.hide();

            });
        });
    }

    deleteDevice(id) {
        this.itemSelected.devices.splice(id, 1);
        this.setDevices();
        this.onChangedSettings();
    }

    addDevices() {
        this.itemSelected.devices.push(null);
        this.selectedDevices.push({
            data: {
                id: Math.random(),
                deviceId: null
            },
            effectAllowed: "move",
            disable: false,
            handle: false,
        });
        this.onChangedSettings();
    }

    onChangeDevices(event, index) {
        const newDeviceId = Number(event.params.data[0].id);
        const existId = this.itemSelected.devices.find((el, i) => el === newDeviceId && i !== index);
        if (existId !== undefined) {
            this.controls.forEach((comp, i) => {
                if (i === index) {
                    comp.clearSelected();
                }
            })
            this.itemSelected.devices[index] = null;
            this.selectedDevices[index].data.deviceId = null;
        } else {
            this.itemSelected.devices[index] = newDeviceId;
            this.selectedDevices[index].data.deviceId = newDeviceId;
        }

        this.onChangedSettings();
    }

    setDevices() {
        const dev = [...this.data.find(el => el.id === this.selectedItemId).devices];
        this.selectedDevices = dev.map(el => {
            return {
                data: {
                    id: Math.random(),
                    deviceId: el
                },
                effectAllowed: "move",
                disable: false,
                handle: false,
            }
        })
    }

    onDragStart(event: DragEvent) {
        //console.log("On Drag Start!")
    }

    onDragged(item: any, list: any[], effect: DropEffect) {
        if (effect === "move") {
            const index = list.indexOf(item);
            list.splice(index, 1);
        }
    }

    onDragEnd(event: DragEvent) {
        //console.log("On Drag End!")
    }

    onDrop(event: DndDropEvent, list?: any[]) {
        this.selectedDevices = this.selectedDevices.map(el => {
            if (el.data.id === event.data.data.id) {
                el.data.id = -999;
            }
            return el
        });
        const newIndex = event.index;
        const start = this.selectedDevices.slice(0, newIndex);
        const end = this.selectedDevices.slice(newIndex, this.selectedDevices.length);
        this.selectedDevices = [...start];
        this.selectedDevices.push(event.data);
        this.selectedDevices.push(...end);
        this.selectedDevices = this.selectedDevices.filter(el => el.data.id != -999);

        this.itemSelected.devices = this.selectedDevices.map(el => el.data.deviceId);
        this.onChangedSettings();
    }

    get itemSelected() {
        return this.data.find(el => el.id === this.selectedItemId)
    }
}
