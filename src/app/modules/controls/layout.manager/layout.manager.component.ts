import {
    Component, ViewEncapsulation, Input, Output, EventEmitter, HostListener, ElementRef,
    ViewChild, ComponentRef
} from '@angular/core';
import {
  LayoutManagerDefaults, LayoutManagerModel, LayoutType
} from './models/layout.manager.model';
import { LayoutManagerService } from './services/layout.manager.service';
import { SaveLayoutModalComponent } from './modals/save.layout.modal/save.layout.modal.component';
import { SaveLayoutModalProvider } from './modals/save.layout.modal/save.layout.modal.provider';
import { LoadLayoutModalComponent } from './modals/load.layout.modal/load.layout.modal.component';
import { IMFXModalProvider } from '../../imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../../imfx-modal/imfx-modal';
import {NotificationService} from "../../notification/services/notification.service";
import {appRouter} from "../../../constants/appRouter";
import {lazyModules} from "../../../app.routes";

@Component({
  selector: 'layout-manager',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [
    LayoutManagerService,
    SaveLayoutModalProvider,
  ],
  entryComponents: [
    // SaveLayoutModalComponent
  ]
})

export class LayoutManagerComponent {
    @Input() layoutType: LayoutType = LayoutType.Logging;
    @Input() layoutModel: any;
    @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSave: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDefaultReady: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('layoutManager', {static: false}) layoutManager: ElementRef;
    private opened: boolean = false;
    private onSaving: EventEmitter<LayoutManagerModel> = new EventEmitter<LayoutManagerModel>();
    private onLoading: EventEmitter<LayoutManagerModel> = new EventEmitter<LayoutManagerModel>();
    private _layout: LayoutManagerModel;
    private modal: IMFXModalComponent;

    constructor(protected layoutService: LayoutManagerService,
                protected notificationService: NotificationService,
                protected modalProvider: IMFXModalProvider) {

        this.onLoading.subscribe((res: any) => {
            this.loadLayoutHandler(res);
        });
        this.onSaving.subscribe((res: any) => {
            this.saveLayoutHandler(res);
        });
    }

    ngOnInit() {
        this._layout = <LayoutManagerModel> {
            'Id': 0,
            'Name': '',
            'IsShared': false,
            'IsDefault': false,
            'IsMine': true,
            'TypeId': this.layoutType,
            'Layout': '{}',
            'UserId': 0
        };
        switch (this.layoutType) {
            case LayoutType.Assess:
                this._layout.Layout = LayoutManagerDefaults.Assess;
                break;
            case LayoutType.Dashboard:
                this._layout.Layout = LayoutManagerDefaults.Dashboard;
                break;
            case LayoutType.ClipEditorVersion:
                this._layout.Layout = LayoutManagerDefaults.ClipEditorVersion;
                break;
            case LayoutType.ClipEditorMedia:
                this._layout.Layout = LayoutManagerDefaults.ClipEditorMedia;
                break;
            case LayoutType.TaskLogger:
                this._layout.Layout = LayoutManagerDefaults.TaskLogger;
                break;
            case LayoutType.ComponentQC:
                this._layout.Layout = LayoutManagerDefaults.ComponentQC;
                break;
            case LayoutType.SubtitlesQC:
                this._layout.Layout = LayoutManagerDefaults.SubtitlesQC;
                break;
            case LayoutType.Production:
                this._layout.Layout = LayoutManagerDefaults.Production;
                break;
            case LayoutType.Segmenting:
                this._layout.Layout = LayoutManagerDefaults.Segmenting;
                break;
            default:
                this._layout.Layout = LayoutManagerDefaults.Logging;
                break;
        }
        this.layoutService.getDefaultLayout(this.layoutType).subscribe((res: any) => {
            this.onDefaultReady.emit({actualModel: res, defaultModel: this._layout});
        });
    }

    open($event) {
        this.modal = this.modalProvider.showByPath(lazyModules.load_golden_layout,
            LoadLayoutModalComponent,
            {
            size: 'sm',
            title: 'layout-manager.open',
            class: 'stretch-modal imfx-modal layout-modal',
            footer: false,
        });
        this.modal.load().then((comp: ComponentRef<LoadLayoutModalComponent>) => {
            let content = this.modal.contentView.instance;
            content.toggleOverlay(true);
            content.setType(this.layoutType, this._layout, this.onLoading);
        });
        this.opened = false;
    }

    save($event) {
        if(this._layout.Id == 0) {
            this.saveAs($event);
        }
        else {
            if (this.layoutModel) {
                this._layout = this.layoutModel;
            }

            this.layoutService.saveLayout(this._layout).subscribe((res: any) => {
                if (res) {
                    this.notificationService.notifyShow(1, "Layout " + this._layout.Name + " Saved");
                    this._layout.Id = res['ID'];
                    this.onSaving.emit(this._layout);
                    this.opened = false;
                }
            });
        }
    }

    layoutDetail($event) {
        if (this.layoutModel) {
            this._layout = this.layoutModel;
        }

        this.modal = this.modalProvider.showByPath(lazyModules.save_golden_layout,
            SaveLayoutModalComponent, {
            size: 'sm',
            title: 'layout-manager.layoutdetil',
            footer: false,
        });
        this.modal.load().then((comp: ComponentRef<SaveLayoutModalComponent>) => {
            let content = this.modal.contentView.instance;
            content.toggleOverlay(true);
            content.setData(this.layoutType, this._layout, this.onSave, true);
        });

        this.opened = false;
    }

    saveAs($event) {
        if (this.layoutModel) {
            this._layout = this.layoutModel;
        }
        this.modal = this.modalProvider.showByPath(lazyModules.save_golden_layout,
            SaveLayoutModalComponent, {
            size: 'sm',
            title: 'layout-manager.saveas',
            footer: false,
        });
        this.modal.load().then((comp: ComponentRef<SaveLayoutModalComponent>) => {
            let content = this.modal.contentView.instance;
            content.toggleOverlay(true);
            content.setData(this.layoutType, this._layout, this.onSave, true, true);
        });

        this.opened = false;
    }

    ngOnChanges() {
        if (this.layoutModel) {
            this._layout = this.layoutModel;
        }
    }

    reset($event) {
        let _layout = <LayoutManagerModel> {
            'Id': 0,
            'Name': '',
            'IsShared': false,
            'IsDefault': false,
            'IsMine': true,
            'TypeId': this.layoutType,
            'Layout': '{}',
            'UserId': 0
        };
        switch (this.layoutType) {
            case LayoutType.Assess:
                _layout.Layout = LayoutManagerDefaults.Assess;
                break;
            case LayoutType.Dashboard:
                _layout.Layout = LayoutManagerDefaults.Dashboard;
                break;
            case LayoutType.ClipEditorVersion:
                _layout.Layout = LayoutManagerDefaults.ClipEditorVersion;
                break;
            case LayoutType.ClipEditorMedia:
                _layout.Layout = LayoutManagerDefaults.ClipEditorMedia;
                break;
            case LayoutType.TaskLogger:
                _layout.Layout = LayoutManagerDefaults.TaskLogger;
                break;
            case LayoutType.ComponentQC:
                _layout.Layout = LayoutManagerDefaults.ComponentQC;
                break;
            case LayoutType.SubtitlesQC:
                _layout.Layout = LayoutManagerDefaults.SubtitlesQC;
                break;
            case LayoutType.TaskClipEditor:
                _layout.Layout = LayoutManagerDefaults.TaskClipEditor;
                break;
            case LayoutType.Production:
                _layout.Layout = LayoutManagerDefaults.Production;
                break;
            case LayoutType.Segmenting:
                _layout.Layout = LayoutManagerDefaults.Segmenting;
                break;
                case LayoutType.Outgest:
                _layout.Layout = LayoutManagerDefaults.Outgest;
                break;
            default:
                _layout.Layout = LayoutManagerDefaults.Logging;
                break;
        }
        this._layout = _layout;
        this.changeLayout(_layout);
        this.opened = false;
    }

    toggleDropdown() {
        this.opened = !this.opened;
    }

    @HostListener('document:mousedown', ['$event'])
    onMousedown(event) {
        if (!this.layoutManager.nativeElement.contains(event.target)) {
            this.opened = false;
        }
    }

    private loadLayoutHandler(layout: LayoutManagerModel) {
        this._layout = layout;
        this.changeLayout(this._layout);
    }

    private saveLayoutHandler(layout: LayoutManagerModel) {
        this._layout = layout;
        this.onSave.emit(layout);
    }

    private changeLayout(layout: LayoutManagerModel) {
        this.onChange.emit(layout);
    }
}
