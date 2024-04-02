import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter,
  Injector, OnInit,
  ViewEncapsulation
} from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import {Router} from "@angular/router";
import {LoadLayoutModalProvider} from "./load.layout.modal.provider";
import {LayoutManagerDefaults, LayoutManagerModel, LayoutType} from "../../models/layout.manager.model";
import {LayoutManagerService} from "../../services/layout.manager.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'load-layout-modal',
  templateUrl: 'tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    LayoutManagerService,
    LoadLayoutModalProvider
  ]
})

export class LoadLayoutModalComponent implements OnInit, AfterViewInit {

    private data: any;
    private showOverlay: boolean = false;
    private layouts: Array<LayoutManagerModel> = [];
    private layoutsFiltered: Array<LayoutManagerModel> = [];
    private layoutType: LayoutType;
    private filterString: string = "";
    private selectedLayout: LayoutManagerModel;
    private changeEmitter: EventEmitter<LayoutManagerModel>;
    private _layout: LayoutManagerModel;
    public routerEventsSubscr: Subscription;

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                private translate: TranslateService,
                private layoutService: LayoutManagerService,
                private loadLayoutProvider: LoadLayoutModalProvider,
                private router: Router) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });

        this.loadLayoutProvider.moduleContext = this;

        // modal data
        this.data = this.injector.get('modalRef');
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy(){
        this.routerEventsSubscr.unsubscribe();
    }

    setType(type: LayoutType, layout: LayoutManagerModel, changeEmitter: EventEmitter<LayoutManagerModel>) {
        this.changeEmitter = changeEmitter;
        this.layoutType = type;
        this._layout = layout;
        this.layoutService.getLayouts(this.layoutType).subscribe((res: any) => {
            this.layouts = res.body;
            this.layoutsFiltered = this.layouts;
            this.filerLayouts(true);
            this.toggleOverlay(false);
        });
    }

    openLayout() {
        this.toggleOverlay(true);
        this.layoutService.getLayout(this.selectedLayout.Id).subscribe((res: any) => {
            this.changeEmitter.emit(<LayoutManagerModel>(<any>res));
            this.closeModal();
        });
    }

    filerLayouts(reset: boolean = false) {
        if (reset) {
            this.selectedLayout = null;
            this.filterString = "";
            this.layoutsFiltered = this.layouts;
            return;
        }
        if (this.filterString.trim().length > 0) {
            this.selectedLayout = null;
            this.layoutsFiltered = this.layouts.filter(item => item.Name.toLowerCase().indexOf(this.filterString.trim().toLowerCase()) > -1);
        }
        else if (this.filterString.trim().length == 0) {
            this.selectedLayout = null;
            this.filterString = "";
            this.layoutsFiltered = this.layouts;
        }
        this.cdr.detectChanges();
    }

    selectLayout(layout: LayoutManagerModel) {
        this.selectedLayout = layout;
        this.cdr.detectChanges();
    }

    deleteLayout(layout: LayoutManagerModel) {
        if(!layout.IsMine)
            return;

        this.toggleOverlay(true);
        this.layoutService.deleteLayout(layout.Id).subscribe((res: any) => {
            if (this._layout.Id == layout.Id) {
                this._layout = <LayoutManagerModel>{
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
                    default:
                        this._layout.Layout = LayoutManagerDefaults.Logging;
                        break;
                }
                this.changeEmitter.emit(this._layout);
            }
            this.setType(this.layoutType, this._layout, this.changeEmitter);
        });
    }

    closeModal() {
        this.showOverlay = true;
        this.data.hide();
    }

    toggleOverlay(show) {
        this.showOverlay = show;
        this.cdr.detectChanges();
    }
}
