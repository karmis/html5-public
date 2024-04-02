import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from '@angular/core';
import { ViewsProvider } from '../../../../views/providers/views.provider';
import { ViewsConfig } from '../../../../views/views.config';
import { DeleteFormatter } from '../../../../slick-grid/formatters/delete/delete.formatter';
import { LookupService } from '../../../../../../services/lookup/lookup.service';
import { Select2Formatter } from '../../../../slick-grid/formatters/select2/select2.formatter';
import { forkJoin, Observable } from 'rxjs';

@Injectable()
export class SubtitlesViewsProvider extends ViewsProvider {
    config: ViewsConfig;
    lookup: LookupService;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
        this.lookup = this.injector.get(LookupService)
    }

    getCustomColumnsAudio(prefix = ''): Observable<any[]> {
        return new Observable((obs) => {
            forkJoin([
                this.lookup.getLookups('Languages'),
                this.lookup.getLookups('AudioContentTypes')
            ]).subscribe((data) => {
                const langData = {
                    values: data[0],
                    rule: this.lookup.getLookupRuleForConvertToSelect2Item('Languages'),
                    validationEnabled: true
                };
                const audioData = {
                    values: data[1],
                    rule: this.lookup.getLookupRuleForConvertToSelect2Item('AudioContentTypes'),
                    validationEnabled: true
                };

                const columns = [
                    {
                        id: -1,
                        field: "*",
                        name: " ",
                        width: 38,
                        sortable: false,
                        resizable: false,
                        formatter: DeleteFormatter,
                        __deps: {
                            injector: this.injector
                        }
                    },
                    {
                        id: 1,
                        name: 'Seq',
                        field: 'SEQUENCE',
                        // width: 150,
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false
                    },
                    {
                        id: 2,
                        name: 'Audio Content Type',
                        field: 'AUDIO_CONTENT_TYPE_ID',
                        selectName: prefix + 'AUDIO_CONTENT_TYPE_ID',
                        // width: 150,
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false,
                        formatter: Select2Formatter,
                        __deps: {
                            injector: this.injector,
                            data: audioData
                        }
                    },
                    {
                        id: 3,
                        name: 'Language',
                        field: 'LANGUAGE_ID',
                        selectName: prefix + 'LANGUAGE_AUDIO',
                        width: 200,
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false,
                        isFrozen: true,
                        isCustom: true,
                        formatter: Select2Formatter,
                        __deps: {
                            injector: this.injector,
                            data: langData
                        }
                    },

                ];

                obs.next(columns);
                obs.complete();
            })
        });
    }

    getCustomColumnsSubtitles(): Observable<any[]> {
        return new Observable((obs) => {
            forkJoin([this.lookup.getLookups('Languages')]).subscribe((data) => {
                let langData = {
                    values: data[0],
                    rule: this.lookup.getLookupRuleForConvertToSelect2Item('Languages'),
                    validationEnabled: true
                };

                const columns = [
                    {
                        id: -1,
                        field: "*",
                        name: " ",
                        width: 38,
                        sortable: false,
                        resizable: false,
                        formatter: DeleteFormatter,
                        __deps: {
                            injector: this.injector
                        }
                    },
                    {
                        id: 3,
                        name: 'Language',
                        field: 'LANGUAGE_ID',
                        selectName: 'LANGUAGE_SUBS',
                        width: 200,
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false,
                        isFrozen: true,
                        isCustom: true,
                        formatter: Select2Formatter,
                        __deps: {
                            injector: this.injector,
                            data: langData
                        }
                    },

                ];

                obs.next(columns);
                obs.complete();
            })
        });
    }


}
