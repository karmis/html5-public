import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation
} from '@angular/core';
import {lazyModules} from '../../../../../../../../../app.routes';
import {XMLComponent} from '../../../../../../../../../modules/search/xml/xml';
import {IMFXModalEvent} from '../../../../../../../../../modules/imfx-modal/types';
import {IMFXModalProvider} from '../../../../../../../../../modules/imfx-modal/proivders/provider';

@Component({
    selector: 'custom-metadata',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class CustomMetadataComponent {
    @Output() onChange: EventEmitter<object> = new EventEmitter<object>();
    schema = {
        Name: '',
        Id: null
    }
    @Input('label') label: string = 'settings_group.upload_layout.metadata' ;

    constructor(private modalProvider: IMFXModalProvider,
                private cdr: ChangeDetectorRef) {
    }

    @Input('value') set value(val) {
        if (val && val.Id) {
            this.schema = val;
        }
    }

    addCustomMetadata() {
        let self = this;
        const modal = this.modalProvider.showByPath(lazyModules.xml_module, XMLComponent, {
            size: 'md',
            title: 'production.metadata',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {compContext: self});

        modal.load().then((cr: ComponentRef<XMLComponent>) => {
            const content = modal.contentView.instance;
            content.setType('SCHEMAIDx');
            content.resetSelection();
            content.modalData = {
                compContext: {
                    withoutXmlTree: true
                }
            }
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    if (e.$event.state.schema) {
                        this.schema = e.$event.state.schema;
                        this.onChange.emit(this.schema);
                    } else {
                        this.onClear();
                    }
                    this.cdr.detectChanges();
                    modal.hide();
                }
                // if (!content.selectedSchemaFormList) {
                //     this.onClear();
                // }
            });

        });


    }

    onClear() {
        this.schema = {
            Name: '',
            Id: null
        }
        this.onChange.emit(this.schema);
        this.cdr.detectChanges();
    }

}
