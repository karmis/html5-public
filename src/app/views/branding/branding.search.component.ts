import { Component, ViewEncapsulation, } from '@angular/core';
// Form
import { SearchFormProvider } from '../../modules/search/form/providers/search.form.provider';
import { DetailData } from "../../services/viewsearch/detail.service";
import { SettingsGroupsService } from "../../services/system.config/settings.groups.service";
import { OverlayComponent } from "../../modules/overlay/overlay";
import { ConsumerSettingsProvider } from "../../modules/settings/consumer/provider";
import { ActivatedRoute } from "@angular/router";
import { BrandingSearchFormComponent } from "./components/search/branding.search.form.component";


@Component({
    selector: 'start-search',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    // changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    providers: [
        // TableSearchService,
        DetailData,
        SearchFormProvider,
        ConsumerSettingsProvider,
        SettingsGroupsService
    ],
    entryComponents: [
        OverlayComponent,
        BrandingSearchFormComponent
    ]
})

export class BrandingSearchComponent {

    staticSearchType: string;
    private sub: any;


    constructor(private route: ActivatedRoute) {

    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.staticSearchType = params['staticSearchType'];
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}



