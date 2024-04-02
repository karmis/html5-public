/**
 * Created by Sergey Trizna on 23.03.2017.
 */
import {AccordionConfig} from '../accordion.config';
import {
    Injectable
} from '@angular/core';


export interface AccordionProviderInterface {
    /**
     * Config of module
     */
    config: AccordionConfig;

    contentReadyEvent: any;
  
    initLoggerData(): any;
  
    navigateToPage(item): any;
}

@Injectable()
export class AccordionProvider implements AccordionProviderInterface {
    config: AccordionConfig;

    contentReadyEvent(){}
    initLoggerData(){}
    navigateToPage(item){}
}
