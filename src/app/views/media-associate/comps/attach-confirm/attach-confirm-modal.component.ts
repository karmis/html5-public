import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
    ViewRef
} from '@angular/core';
import { IMFXModalComponent } from '../../../../modules/imfx-modal/imfx-modal';
import { ClipboardProvider } from '../../../../providers/common/clipboard.provider';
import { TranslateService } from '@ngx-translate/core';
import { SlickGridRowData } from '../../../../modules/search/slick-grid/types';
import { IMFXMLTreeComponent } from '../../../../modules/controls/xml.tree/imfx.xml.tree';
import * as _ from 'lodash';
import { from, Observable, of } from 'rxjs';
import { concatMap, reduce, tap } from 'rxjs/operators';
import { XmlTreeValidationResult } from '../../../../modules/upload/upload';
import { UploadGroupSettings } from '../../../../modules/upload/types';
import { SettingsGroupsService } from '../../../../services/system.config/settings.groups.service';
import { ViewsService } from '../../../../modules/search/views/services/views.service';
import { ViewColumnsType, ViewsOriginalType } from '../../../../modules/search/views/types';

export type MappingItemListForSaveType = { MediaId: number, XmlDocument: XmlDocumentAssignType }
export type XmlDocumentAssignType = { SchemaModel: any, XmlModel: any }

@Component({
    selector: 'modal-attack-confirm',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./styles/index.scss'],
    providers: [
        ViewsService
    ]
})
export class AttachConfirmModalComponent implements OnInit {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('xmlTreePresets', {static: false}) public xmlTreePresets: IMFXMLTreeComponent;
    selectedMedia = null;
    isVersionNameValid = false;
    row: SlickGridRowData = null;
    columns: ViewColumnsType = {};
    protected text: string;
    protected media = [];
    protected textParams: any;
    protected modalRef: IMFXModalComponent;
    protected copyButton: boolean = false;
    private title: string;
    private xmlData = null;
    private hasXml: boolean = false;
    private prevIndex: number = 0;

    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef,
                private clipboardProvider: ClipboardProvider,
                private settingsGroupsService: SettingsGroupsService,
                private translate: TranslateService,
                private viewsService: ViewsService) {
        this.modalRef = this.injector.get('modalRef');
        this.row = this.modalRef.getData().row;
        this.xmlData = this.modalRef.getData().xmlData;
        this.hasXml = this.modalRef.getData().hasXml;
    }

    ngOnInit() {
        this.viewsService.getViews('VersionGrid').subscribe((views: ViewsOriginalType) => {
            this.settingsGroupsService.getSettingsUserById('uploadSettings').subscribe((uploadSettings: any) => {
                this.columns = views.ViewColumns;
                const ugs: UploadGroupSettings = JSON.parse(uploadSettings[0].DATA) as UploadGroupSettings;
                if (ugs.versionNameList && ugs.versionNameList.length) {
                    // @ts-ignore
                    const found = ugs.versionNameList.find(name => name.toLowerCase() === this.row.VERSION.toLowerCase());
                    this.isVersionNameValid = found !== undefined;
                } else {
                    this.isVersionNameValid = true;
                }
                this.cdr.detectChanges();
            })
        })
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.cdr.detectChanges()
        });
    }

    public isValidSchema(): Observable<XmlTreeValidationResult[]> {

        if (this.isVersionNameValid === false) {
            return new Observable(obs => {
                obs.next([]);
                obs.complete()
            })
        }
        this.updateCurrentMedia(); // save xml model to model
        const models: SlickGridRowData[] = this.media;
        const source = from(models);
        const sbs: Observable<XmlTreeValidationResult[]> = source.pipe(
            tap((model: SlickGridRowData) => {
                this.onSelect(model, true, false);
                if (this.xmlTreePresets) {
                    this.xmlTreePresets.applyChanges();
                    if (!(<ViewRef>this.xmlTreePresets.cdr).destroyed) {
                        this.xmlTreePresets.cdr.detectChanges();
                    }
                }
                if (!(<ViewRef>this.cdr).destroyed) {
                    this.cdr.detectChanges();
                }
                // this.cdr.detectChanges();
            }),
            concatMap((um: SlickGridRowData) => {
                return of({model: um, result: this.xmlTreePresets ? this.xmlTreePresets.isValid() : true} as XmlTreeValidationResult)
            }),
            reduce((acc, val) => {
                acc.push(val);
                return acc;
            }, [])
        );

        return sbs
    }

    setTitle(title: string) {
        this.title = this.translate.instant(title);
        this.cdr.detectChanges();
    }

    setText(text: string, textParams?: object, media = []) {
        this.text = text;
        this.textParams = textParams;
        this.media = media.map(el => {
            el.TITLE = el.TITLE.length ? el.TITLE : '[no title]';
            if (this.xmlData) {
                el.__xmlDocument = _.cloneDeep(this.xmlData.XmlModel)
            }
            return el
        });

        this.selectedMedia = this.media[0];
        this.cdr.detectChanges();
    }

    setCopyButton(state: boolean) {
        this.copyButton = state;
        this.cdr.detectChanges();
    }

    onSelect(el: SlickGridRowData | any, withValidation: boolean = true, withExpand: boolean = true) {
        this.updateCurrentMedia();
        this.selectedMedia = null;
        this.cdr.detectChanges();

        this.selectedMedia = el;
        this.cdr.detectChanges();

        if (withValidation) {
            if (this.xmlTreePresets) {
                this.xmlTreePresets.ExpandAll();
            }
        }

        if (withExpand && this.xmlTreePresets) {
            this.xmlTreePresets.isValid()
        }

    }

    onSelectNodes($event: any) {

    }

    isReadonlyXML() {
        return false;
    }

    getCurrentSchema() {
        if (this.xmlData) {
            return this.xmlData.SchemaModel
        }
    }

    getCurrentModel() {
        if (this.xmlData && this.selectedMedia) {
            return this.selectedMedia.__xmlDocument
        }
    }

    getPreparedForSaveObject(): { ItemList: MappingItemListForSaveType[] } {
        const prepared: { ItemList: MappingItemListForSaveType[] } = {ItemList: []};
        this.updateCurrentMedia();
        this.media.forEach((row: SlickGridRowData | any) => {
            const prep = {
                MediaId: row['ID'],
                XmlDocument: (this.getCurrentSchema() && row.__xmlDocument && this.isVersionNameValid) ? {
                    XmlModel: row.__xmlDocument || null,
                    SchemaModel: {}
                }:null
            }
            prepared.ItemList.push(prep)
        })

        return prepared
    }

    updateCurrentMedia() {
        const currIndex: number = this.media.findIndex((rowItem: SlickGridRowData) => rowItem.ID === this.selectedMedia['ID'])
        if (currIndex == undefined) {
            return;
        }
        if (this.media[currIndex]) {
            this.media[currIndex].__xmlDocument = this.xmlTreePresets && this.xmlTreePresets.getXmlModel(false) ? this.xmlTreePresets.getXmlModel(false).XmlModel : null;
        }
    }

    getColumnName(name: string): string {
        if (this.columns[name]) {
            return this.columns[name].TemplateName || this.columns[name].BindingName
        } else {
            return '[no label]';
        }
    }

    protected copyError() {
        const text = this.translate.instant(this.text, this.textParams);
        this.clipboardProvider.copy(text);
    }
}
