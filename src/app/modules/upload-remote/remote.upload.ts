import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {IMFXModalProvider} from "../imfx-modal/proivders/provider";
import {SettingsGroupsService} from '../../services/system.config/settings.groups.service';
import {UploadComponent, UploadMethod} from '../upload/upload';
import {IMFXControlsLookupsSelect2Component} from '../controls/select2/imfx.select2.lookups';
import {TranslateService} from '@ngx-translate/core';
import {IMFXControlsRemoteFileBrowserComponent, IMFXFBNode} from '../controls/file-browser/remote-file-browser';
import {IMFXModalComponent} from '../imfx-modal/imfx-modal';
import {IMFXModalEvent} from '../imfx-modal/types';
import * as $ from "jquery";
import {UploadService} from "../upload/services/upload.service";
import {SecurityService} from "../../services/security/security.service";
import {lazyModules} from "../../app.routes";
import {XMLService} from "../../services/xml/xml.service";
import {OrderPresetGroupedInputComponent} from "../../views/media-basket/components/order.preset.grouped.input/order.preset.grouped.input.component";
import {ViewsService} from '../search/views/services/views.service';
import {IMFXMLTreeComponent} from '../controls/xml.tree/imfx.xml.tree';
// let BDC = require('binary-data-chunking');
require('../upload/libs/filedrop/filedrop.js');

export type IMFXRemoteUploadModel = {
    WorkflowPresetId: number
    MiType: number
    Usage: string
    MediaFormat: number
    Owner: string
    Filename: string
    IsLocal: boolean
    Filesize: number
    Title?: string,
    VersionId?: string,
    AspectRatio?: number,
    TvStandard?: number,
    SubFolder: string,
    DeviceId: number
}

@Component({
    selector: 'imfx-multi-upload-modal',
    templateUrl: '../upload/tpl/remote-upload.html',
    styleUrls: [
        '../upload/styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush, // noway
    providers: [
        // // ControlToAdvTransfer,
        // BasketService,
        // LookupService,
        // // IMFXModalProvider,
        // // BsModalRef,
        // // BsModalService,
        // SettingsGroupsService
        ViewsService
    ]
})

export class UploadRemoteComponent extends UploadComponent {
    public uploadMethod: UploadMethod = 'remote';
    public availableAllExt: boolean = true;
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    // @ViewChild('inputFile', {static: false}) public inputFile;
    @ViewChild('inputFilename', {static: true}) public inputFilename;
    @ViewChild('controlWorkflow', {static: false}) public controlWorkflow: OrderPresetGroupedInputComponent;
    @ViewChild('controlMediaTypes', {static: true}) public controlMediaTypes: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlAspectRatio', {static: true}) public controlAspectRatio: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlTvStandards', {static: true}) public controlTvStandards: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlUsageTypes', {static: true}) public controlUsageTypes: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlItemTypes', {static: true}) public controlItemTypes: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlChannels', {static: true}) public controlChannels: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlDevices', {static: true}) public controlDevices: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlNotes', {static: true}) public controlNotes: ElementRef;
    @ViewChild('controlWorkflowNotes', {static: true}) public controlWorkflowNotes: ElementRef;
    @ViewChild('controlVersionTitle', {static: true}) public controlVersionTitle: ElementRef;
    @ViewChild('controlTitle', {static: true}) public controlTitle: ElementRef;
    @ViewChild('controlAFD', {static: true}) public controlAFD: IMFXControlsLookupsSelect2Component;
    @ViewChild('xmlTreePresets', {static: false}) public xmlTreePresets: IMFXMLTreeComponent;
    @ViewChild('overlayExport', {static: false}) public overlay;
    @ViewChild('overlayWrapper', {static: false}) public wrapper;
    @ViewChild('xmlTreeGroupSettings', {static: false}) public xmlTreeGroupSettings: IMFXMLTreeComponent;

    public promises = [];
    public availableDevicesTypesId = [37, 11, 47, 94];
    public context = this;
    private pathPrefix: string = null;
    private fileNodes: IMFXFBNode[] = [];

    constructor(public injector: Injector,
                public modalProvider: IMFXModalProvider,
                public translate: TranslateService,
                public cdr: ChangeDetectorRef,
                public sgs: SettingsGroupsService,
                public securityService: SecurityService,
                public xmlService: XMLService,
                public viewsService: ViewsService) {
        super(injector, modalProvider, translate, cdr, sgs, securityService, xmlService, viewsService);
    }

    ngAfterViewInit() {
        this.promises = [
            this.controlMediaTypes.onReady,
            this.controlAspectRatio.onReady,
            this.controlTvStandards.onReady,
            this.controlItemTypes.onReady,
            this.controlUsageTypes.onReady,
            this.controlChannels.onReady,
            // this.controlWorkflow.onReady,
            this.uploadProvider.basketService.getOrderPresets(),
            this.uploadProvider.getUploadSettings(false),
            this.controlDevices.onReady,
        ];
        this.init().subscribe(() => {
        });
    }

    filterResult(lookups: any[] = [], context: UploadRemoteComponent, sourceData) {
        if (!sourceData)
            return lookups.filter((d) => {
                return context.availableDevicesTypesId.indexOf(d.TypeId) > -1;
            });
        let map = {};
        sourceData.forEach(item => {
            map[item.Id] = item;
            }
        )
        return lookups.filter((d) => {
            return context.availableDevicesTypesId.indexOf(map[d.id].TypeId) > -1;
        });
    }

    getPaths(path: string = '/', context: UploadRemoteComponent): Promise<any> {
        return new Promise((resolve, reject) => {
            const id: number = context.controlDevices.getSelectedId() as number;
            if (id !== null) {
                const obs = context.uploadProvider.uploadService.getListOfFilesByDeviceId(
                    id, path
                );
                const sbs = obs.subscribe((res: any[]) => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
                const msbs = this.modalRef.modalEvents.subscribe((e: IMFXModalEvent) => {
                    if (e.name === 'hide') {
                        const uploadService: UploadService = context.uploadProvider.uploadService;
                        uploadService.cancelLoadListSubject.next();
                        uploadService.cancelLoadListSubject.complete();
                        if (sbs && sbs.unsubscribe) {
                            sbs.unsubscribe();
                        }
                        if (msbs && msbs.unsubscribe) {
                            msbs.unsubscribe();
                        }
                        reject();
                    }
                });
            }

        });
    }

    simulateClick($event) {
        if ($($event.target).closest('.row-item').length) {
            return true;
        }
        if ($($event.target).closest('.select-files-block-handler')) {
            this.openRemoteBrowser();
        }
    }

    public openRemoteBrowser() {
        this.pathPrefix = this.controlDevices.getSelectedText() + '(' + this.controlDevices.getSelectedId() + ')';
        let modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.remote_file_browser,
            IMFXControlsRemoteFileBrowserComponent, {
                title: 'remote_file_browser.title',
                size: 'md',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            }, {
                pathsFn: this.getPaths,
                context: this,
                viewMap: {
                    fileName: 'Filename',
                    fileSize: 'FileSize',
                    isFolder: 'IsFolder'
                },
                viewProps: [
                    'Filename',
                    'FileSize'
                ],
                selectedRows: this.fileNodes,
                isMultiSelect: true,
                deviceId: this.controlDevices.getSelectedId(),
                pathPrefix: this.pathPrefix
            });

        modal.load().then((comp: ComponentRef<IMFXControlsRemoteFileBrowserComponent>) => {
            const remoteBrowser: IMFXControlsRemoteFileBrowserComponent = comp.instance;
            // this.controlDevices.onSelect.subscribe((item: Select2EventType) => {
            //     remoteBrowser.load('/');
            // });
            // this.controlDevices.setSelectedByIds([this.controlDevices.getSelectedId()], true);
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'hide' || e.name === 'autohide') {
                    this.pathPrefix = null;
                    remoteBrowser.onChangeSelectedRows.unsubscribe();
                }
            });

            remoteBrowser.onChangeSelectedRows.subscribe((nodes: IMFXFBNode[]) => {
                this.cdr.detach();
                // clear other nodes from this storage
                // this.fileNodes = this.fileNodes.filter((item: IMFXFBNode) => {
                //     return item.getPathPrefix() !== this.pathPrefix;
                // });
                this.fileNodes = [];
                let dirtyNodes: IMFXFBNode[] = this.fileNodes.concat(nodes);
                let dIndex = {};
                $.each(dirtyNodes, (k, o: IMFXFBNode) => {
                    dIndex[o.getPath()] = o;
                });
                this.fileNodes = Object.keys(dIndex).map((key) => {
                    return dIndex[key];
                });

                // let uniqueFiles = [];
                // let uniqueFilenames = [];
                // $.each(this.uploadProvider.fileNodes, (i, node: IMFXFBNode) => {
                //     if (uniqueFilenames.indexOf(node.getName()) === -1) {
                //         uniqueFilenames.push(node.getName());
                //         uniqueFiles.push(node);
                //     }
                // });

                // const service: InterfaceUploadService = this.uploadProvider.getService('remote');

                this.uploadProvider.select(this.fileNodes, 'remote');

                // this.uploadProvider.bindFileNodesToFormData(this.uploadProvider.fileNodes);
                this.isValidForm = this.uploadProvider.isValidForm();
                this.cdr.reattach();
                this.cdr.markForCheck();
            });
            remoteBrowser.load('/');
            this.cdr.markForCheck();
        });
    }

    // public fillControls() {
    //     this.controlTitle.nativeElement.value = this.uploadProvider.getMetaData('Title') || '';
    //     let selectedFile: IMFXFBNode = this.uploadProvider.fileNodes[this.uploadProvider.activeFileItem];
    //     if (selectedFile && selectedFile.getName()) {
    //
    //     } else {
    //         this.controlMediaTypes.clearSelected();
    //     }
    //     if (this.currentStep === 1) {
    //         setTimeout(() => {
    //             this.isValidForm = this.uploadProvider.isValidForm();
    //             this.cdr.markForCheck();
    //         });
    //     }
    // }

    // protected upload() {
    //     this.uploadProvider.upload().subscribe((data: {
    //         lastAddedUploadModels: UploadModel[],
    //         allUploadModels: UploadModel[]
    //     }) => {
    //         console.log('added', data);
    //     });
    //     this.modalRef.hide();
    // }
}
