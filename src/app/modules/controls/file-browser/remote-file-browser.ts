/**
 * Created by Sergey Trizna on 06.02.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Injector,
    Input,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {IMFXModalComponent} from '../../imfx-modal/imfx-modal';
import {OverlayComponent} from '../../overlay/overlay';
import {Select2ItemType} from "../select2/types";
import {SlickGridRequestError} from '../../search/slick-grid/types';
import {RemoteUploadService} from '../../upload/services/remote.upload.service';
import {forkJoin} from 'rxjs';

@Component({
    selector: 'imfx-controls-remote-file-browser',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        // BsModalService
    ]
})

export class IMFXControlsRemoteFileBrowserComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @Input('isMultiSelect') public isMultiSelect: boolean = true;
    @Input('viewProps') public viewProps: string[];
    @Input('viewMap') public viewMap: IMFXFBViewMap = {
        fileName: 'fileName',
        fileSize: 'fileSize',
        isFolder: 'isFolder'
    };
    @Input('pathPrefix') public pathPrefix = '';
    @Input('selectedRows') public selectedRows: IMFXFBNode[] = [];
    @Input('deviceId') public deviceId: number;
    public error: SlickGridRequestError = null;
    public filteredRows: IMFXFBNode[] = [];
    public nodeList: IMFXFBNode[] = [];
    public readonly onChangeSelectedRows: EventEmitter<IMFXFBNode[]> = new EventEmitter();
    @ViewChild('rfbwrapper', {static: true}) private rfbwrapper: ElementRef;
    @ViewChild('overlay', {static: true}) private overlayRef: OverlayComponent;
    private readonly backDirName = '../';
    @ViewChild('dataFilter', {static: false}) private dataFilter: ElementRef;
    @Input('context') private context: any;
    private lastClickedRow: number = undefined;
    private modalRef: IMFXModalComponent;
    private modalData: any = {};

    constructor(private cdr: ChangeDetectorRef, private injector: Injector, private remoteUploadService: RemoteUploadService) {
        this.modalRef = injector.get('modalRef');
        this.modalData = this.modalRef.getData();
        this.isMultiSelect = this.modalData.isMultiSelect || false;
        this.pathsFn = this.modalData.pathsFn || this.pathsFn;
        this.viewMap = this.modalData.viewMap || this.viewMap;
        this.viewProps = this.modalData.viewProps || this.viewProps;
        this.context = this.modalData.context || this.context;
        this.pathPrefix = this.modalData.pathPrefix || this.pathPrefix;
        this.selectedRows = this.modalData.selectedRows || this.selectedRows;
        this.deviceId = this.modalData.deviceId || this.deviceId;
    }

    private _currentPath = '/';

    get currentPath(): string {
        return this._currentPath;
    }

    load(path: string, node?: IMFXFBNode) {
        this.error = null;
        this.overlayRef.showWithoutButton(this.rfbwrapper.nativeElement);
        this.pathsFn(path, this.context).then((fsObjects: any[]) => {
            if (node && node.getName() === this.backDirName) {
                this._currentPath = this.getBackPath();
            } else {
                this._currentPath = path != '/' && path[path.length - 1] != '/' ? path + '/' : path;
            }

            // this._currentPath = this._currentPath[0]==='/'?this._currentPath.substr(1):this._currentPath

            if (fsObjects && fsObjects.length > 0) {
                this.nodeList = fsObjects.map((fsObject: any) => {
                    return new IMFXFBNode(
                        fsObject,
                        this.viewMap,
                        this._currentPath,
                        this.pathPrefix,
                        this.deviceId
                    );
                });
            } else {
                this.nodeList = [];
            }

            this.filteredRows = this.nodeList;

            if (this._currentPath !== '/') {
                // ../ (reference to up)
                this.nodeList.unshift(new IMFXFBNode(
                    {IsFolder: true, Filename: this.backDirName},
                    this.viewMap,
                    this._currentPath,
                    this.pathPrefix,
                    this.deviceId
                ));
            }
            this.cdr.detectChanges();
            this.overlayRef.hide(this.rfbwrapper.nativeElement);
        }).catch((err: { error: SlickGridRequestError }) => {
            this.error = err && err.error ? err.error : {
                "ID": 0,
                "Result": false,
                "Error": 'Connection Error',
                "ErrorCode": 0,
                "ErrorDetails": 'Connection Error'
            } as SlickGridRequestError;
            this.cdr.detectChanges();
            this.overlayRef.hide(this.rfbwrapper.nativeElement);
        });
    }

    processRowClick(item: IMFXFBNode, $event, i: number) {
        if (item.getName() === this.backDirName) {
            return;
        }


        if (this.isMultiSelect && $event.shiftKey) {
            let selRows = [];
            if (this.lastClickedRow > i) {
                selRows = this.selectedRows.length > 0 ? this.selectedRows.slice(0, 1) : this.selectedRows;
                this.selectedRows = selRows.concat(this.nodeList.slice(i, this.lastClickedRow))
                this.lastClickedRow = i;
            } else {
                selRows = this.selectedRows.length > 0 ? this.selectedRows.slice(this.selectedRows.length, 1) : this.selectedRows;
                this.selectedRows = selRows.concat(this.nodeList.slice(this.lastClickedRow, i + 1))
                this.lastClickedRow = i;
            }

            return;
        } else {
            if (this.isMultiSelect && ($event.ctrlKey || $event.metaKey)) {
                if (this.selectedRows.length > 0) {
                    let existKey;
                    $.each(this.selectedRows, (k, _item: IMFXFBNode) => {
                        if (_item.getPath() === item.getPath()) {
                            existKey = k;
                            return false;
                        }
                    });
                    if (existKey !== undefined) {
                        this.selectedRows.splice(existKey, 1);
                    } else {
                        this.selectedRows.push(item);
                    }
                } else {
                    this.selectedRows.push(item);
                }
                this.lastClickedRow = i;
            } else {
                if (this.selectedRows.length == 1 && this.selectedRows[0] == item) {
                    this.selectedRows = [];
                } else {
                    this.selectedRows = [item];
                }
                this.lastClickedRow = i;
            }
        }
    }

    execute(path: string, node: IMFXFBNode) {
        this.selectedRows.push(node);
        this.ok();
    }

    render(node: IMFXFBNode): string {
        let cols = this.viewProps.map((prop) => {
            let val = node.originalObject[prop];
            if (val === undefined) {
                val = '';
            }

            if (prop === this.viewMap.fileName) {
                val = node.getName();
            }

            if (prop === this.viewMap.fileSize) {
                if (node.getSize() > 0) {
                    val = node.getSize() + ' MB';
                } else {
                    val = '';
                }
            }
            return '<td title="' + val + '" class="col-item prop-' + prop + '">' + val + '</td>';
        });
        const iconval = node.isFolder() ? '<i class="icon icons-tiles"></i>' : '<i class="icon icons-files"></i>';
        cols.unshift('<td class="col-item icon">' + iconval + '</td>');
        return cols.join('');
    }

    clearFilter() {
        $(this.dataFilter.nativeElement).val("");
        this.filterData('');
    }

    filterData(filterValue) {
        this.filteredRows = this.nodeList.filter((x) => {
            let str = x.originalObject[this.viewMap.fileName];
            if (str !== undefined && str !== this.backDirName) {
                return str.toLowerCase().includes(filterValue.trim().toLowerCase());
            }
        });
        this.cdr.markForCheck();
    }

    getBackPath() {
        const cp = this._currentPath;
        return cp.replace(cp.split('/')[cp.split('/').length - 2], '').replace('//', '/');
    }

    isSelectedNode(node: IMFXFBNode) {
        return this.selectedRows.filter((selNode: IMFXFBNode) => {
            return selNode.getPath() === node.getPath();
        }).length === 1;
    }

    ok() {
        this.loadFilesFolder();
    }

    loadFilesFolder() {
        const foldersObs = []
        this.selectedRows = this.selectedRows.filter(el => {
            if (el.isFolder()) {
                // const currentPath = fl.Path.split('\\').slice(4).join('/') + '/';
                foldersObs.push(this.remoteUploadService.getAllFilesFromFolder(el.getDeviceId(), el.getPathWithoutPrefix().slice(1)));
                return false // TODO Why!
            } else {
                return true
            }

        })
        if (foldersObs.length) {
            this.overlayRef.showWithoutButton(this.rfbwrapper.nativeElement);
            forkJoin(foldersObs).subscribe((res: any[]) => {
                res.forEach(listFiles => {
                    this.selectedRows.push(
                        ...listFiles.map(fl => {
                            const currentPath = fl.Path.split('\\').slice(4).join('/') + '/';
                            console.log(currentPath);
                                return new IMFXFBNode(
                                    fl,
                                    this.viewMap,
                                    currentPath,
                                    this.pathPrefix,
                                    this.deviceId
                                );
                            }
                        ));
                })
                this.overlayRef.hide(this.rfbwrapper.nativeElement);
                this.onChangeSelectedRows.emit(this.selectedRows);
                this.modalRef.hide();
            }, error => {
                this.overlayRef.hide(this.rfbwrapper.nativeElement);
            })

        } else {
            this.onChangeSelectedRows.emit(this.selectedRows);
            this.modalRef.hide();
        }

    }

    @Input('pathsFn') private pathsFn = (path: string, context: any) => {
        return new Promise((resolve, reject) => {
            resolve();
        });
    };
}

export class IMFXFBNode {
    private readonly _viewMap: IMFXFBViewMap;
    private readonly _originalObject: any;
    private readonly _path: string;
    private readonly _pathPrefix: string;
    private readonly _deviceId: number;

    constructor(
        _originalObject: any,
        _viewMap: IMFXFBViewMap,
        _path: string,
        _pathPrefix: string,
        _deviceId: number
    ) {
        this._originalObject = _originalObject;
        this._viewMap = _viewMap;
        this._path = _path + this.getName();
        this._pathPrefix = _pathPrefix;
        this._deviceId = _deviceId;
    }

    private _owner: Select2ItemType;

    public get owner(): Select2ItemType {
        return this._owner;
    }

    public set owner(owner: Select2ItemType) {
        this._owner = owner;
    }

    private _endpoint: string;

    public get endpoint(): string {
        return this._endpoint;
    }

    public set endpoint(owner: string) {
        this._endpoint = owner;
    }

    private _medias: string[] = [];

    public get medias(): string[] {
        return this._medias;
    }

    public get Filesize(): number {
        return this.getSizeInBytes();
    }

    public get Finename(): string {
        return this.getName();
    }

    public get size(): number {
        return this.getSizeInBytes();
    }

    public get name(): string {
        return this.getName();
    }

    public get originalObject(): any {
        return this._originalObject;
    }

    // public set meidas(medias: string[]) {
    //     this._medias = medias;
    // }

    public getName(): string {
        return this._originalObject[this._viewMap.fileName];
    }

    public getSize(): number {
        const bytes = this.getSizeInBytes();
        return bytes !== undefined && bytes !== 0 ? parseFloat((bytes / 1024 / 1024).toFixed(2)) : 0;
    }

    public getSizeInBytes(): number {
        return this._originalObject[this._viewMap.fileSize] || 0;
    }

    public getPath(): string {
        return this.getPathPrefix() + ':' + this._path;
    }

    public getPathWithoutPrefix() {
        return this._path;
    }

    public getPathPrefix(): string {
        return this._pathPrefix;
    }

    public getSubFolder(): string {
        // return this._originalObject.Path.replace(/\\(.)/mg, "$1");
        return this._originalObject.Path.split('\\').slice(4).join('\\');

        // let pathArr = this._path.split('/');
        // pathArr.splice(-1, 1);
        // let subfolder = pathArr.length === 1 ? '' : pathArr.join('/').replace(/\//g, '\\');
        // subfolder = subfolder[0] === '\\' ? subfolder.substr(1) : subfolder;
        // return subfolder;
    }

    public getDeviceId(): number {
        return this._deviceId;
    }

    public getExtension(): string {
        return this.getName().split('.').pop();
    }

    public isFolder(): boolean {
        return this._originalObject[this._viewMap.isFolder] == true;
    }
}

export type IMFXFBViewMap = {
    fileName: string,
    fileSize: string,
    isFolder: string,
    [key: string]: string
}
