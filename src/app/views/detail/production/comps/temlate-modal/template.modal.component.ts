import {
    AfterViewInit,
    ChangeDetectorRef,
    Component, EventEmitter,
    Injector,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { IMFXModalComponent } from '../../../../../modules/imfx-modal/imfx-modal';
import { ProductionService } from '../../../../../services/production/production.service';
import { IMFXControlsSelect2Component } from '../../../../../modules/controls/select2/imfx.select2';

@Component({
    selector: 'template-production',
    templateUrl: 'tpl/template-modal.component.html',
    styleUrls: [
        'styles/index.scss'
    ],
    providers: [
    ],
    encapsulation: ViewEncapsulation.None,
})
export class TemplateModalComponent implements OnInit {
    @ViewChild('selectTemplateControl', {static: false}) selectTemplateControl: IMFXControlsSelect2Component;
    @ViewChild('selectChannelControl', {static: false}) selectChannelControl: IMFXControlsSelect2Component;

    state = {
        Lookups: null,
        Template: null,
        TemplateConfig: null,
        TemplateId: null,
        Channel: null,
    }
    isValid = false;
    showOverlay = true;
    private modalRef: IMFXModalComponent;

    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef,
                private productionService: ProductionService) {
        this.modalRef = this.injector.get('modalRef');
    }

    ngOnInit(): void {
        this.productionService.getTemplates().subscribe(res => {
            this.state.Lookups = res.Lookups;
            this.bindTemplates(res.Data);
            this.toggleOverlay(false);
        });
    }

    onOk() {
        this.modalRef.modalEvents.emit({
            name: 'ok',
            state: this.state
        });
    }

    onCancel() {
        this.modalRef.modalEvents.emit({
            name: 'hide',
            state: this.state
        });
    }

    private bindTemplates(Data) {
        Data = Data.filter(x => x.ACTIVE);
        const selectData = Data.map(el => ({
            id: el.ID,
            text: el.NAME
        }))
        this.selectTemplateControl.setData(selectData);
    }

    private bindChannels(Data) {
        if(Data && Data.length > 0) {
            const selectData = Data.map(el => ({
                id: el.CH_CODE,
                text: el.CH_FULL
            }))
            this.selectChannelControl.setData(selectData);
        }
        this.checkValid();
    }

    onSelectConfig(ev) {
        this.state.Channel = null;
        this.state.TemplateId = null;
        this.selectChannelControl.clearSelect();
        this.toggleOverlay(true);
        if(ev.params.data && ev.params.data.length > 0) {
            this.productionService.getTemplate(ev.params.data[0].id)
                .subscribe(template => {
                    this.productionService.getTemplateGroups(template.Data[0].CONFIG_ID).subscribe((templateConfig)=>{
                        this.state.TemplateId = ev.params.data[0].id;
                        this.state.Template = template;
                        this.state.TemplateConfig = templateConfig;
                        this.bindChannels(template.Data[0].CHANNELS);
                        this.toggleOverlay(false);
                    }, (err) => {
                        this.toggleOverlay(false);
                    })
                }, (err) => {
                    this.toggleOverlay(false);
                });
        }
        this.checkValid();
    }

    onSelectChannel(ev) {
        if(ev.params.data && ev.params.data.length > 0) {
            this.state.Channel = ev.params.data[0].id;

        }
        else {
            this.state.Channel = null;
        }
        this.checkValid();
    }

    checkValid() {
        this.isValid = this.state.Channel !== null && this.state.TemplateId !== null;
        this.cdr.detectChanges();
    }

    toggleOverlay(show) {
        this.showOverlay = show;
        this.cdr.detectChanges();
    }
}
