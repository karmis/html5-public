/**
 * Created by Sergey Trizna on 23.03.2017.
 */
import * as $ from 'jquery';
import {
    Component,
    ViewEncapsulation,
    Input,
} from '@angular/core';

import { AccordionProvider, AccordionProviderInterface } from './providers/accordion.provider'
import { AccordionService, AccordionServiceInterface } from './services/accordion.service';
import { AccordionConfig } from './accordion.config';
import { BaseSearchUtil } from '../search/utils/utils';

@Component({
    selector: 'accordion',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        AccordionProvider,
        AccordionService
    ]
})
export class AccordionComponent extends BaseSearchUtil {
    /**
     * Default config
     * @type {ViewsConfig}
     */
    config = <AccordionConfig>{
        componentContext: <any>null,
        options: {
            service: <AccordionServiceInterface>null,
            provider: <AccordionProviderInterface>null,
            selectedRow: 0
        },
    };

    /**
     * Extend default config
     * @param config
     */
    @Input('config') set setConfig(config) {
        this.config = $.extend(true, this.config, config);
    }

    constructor(protected service: AccordionService,
                protected provider: AccordionProvider) {
        super();
    }

    ngOnInit() {
        // Set default provider/services if custom is null
        this.initializeData(this, 'provider');
        this.initializeData(this, 'service');
        this.passConfigToProvider(this);

        this.config.options.provider.initLoggerData()
    }

    public contentReady() {
        setTimeout(() => {
            this.config.options.provider.contentReadyEvent(), 0
        });
    }

    ngAfterViewInit() {
        this.contentReady();
    }

    setClickedRow(index) {
        this.config.options.selectedRow = index;
    }

    navigateToPage(item) {
        return this.config.options.provider.navigateToPage(item);
    }
}
