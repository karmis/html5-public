import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NotificationService } from "../../../../../../../modules/notification/services/notification.service";
import { TranslateService } from '@ngx-translate/core';
import {SearchFormConfig} from "../../../../../../../modules/search/form/search.form.config";
import {AppSettingsInterface} from "../../../../../../../modules/common/app.settings/app.settings.interface";
import {SearchFormProvider} from "../../../../../../../modules/search/form/providers/search.form.provider";
import {NamesTreeComponent} from "../../../../../../names/comps/names.tree/names.tree.component";
import {CoreSearchComponent} from "../../../../../../../core/core.search.comp";
import {SearchRecentProvider} from "../../../../../../../modules/search/recent/providers/search.recent.provider";
import {SearchAdvancedProvider} from "../../../../../../../modules/search/advanced/providers/search.advanced.provider";
import {ActivatedRoute, Router} from "@angular/router";
import {ConsumerSettingsTransferProvider} from "../../../../../../../modules/settings/consumer/consumer.settings.transfer.provider";
import {ExportProvider} from "../../../../../../../modules/export/providers/export.provider";
import {SearchSettingsProvider} from "../../../../../../../modules/search/settings/providers/search.settings.provider";
import {NamesAppSettings} from "../../../../../../names/constants/constants";
import {MediaService} from "../../../../../../../services/media/media.service";
import {SearchAdvancedConfig} from "../../../../../../../modules/search/advanced/search.advanced.config";

@Component({
    selector: 'names-authoring-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        NamesAppSettings,
        SearchFormProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        SearchSettingsProvider,
        MediaService
    ]
})

export class NamesAuthoringModalComponent extends CoreSearchComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('namesTree', {static: true}) private namesTree: NamesTreeComponent;

    private modalRef: any;
    private context;
    private selectedItem;

    public searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            currentMode: 'Titles',
            arraysOfResults: [],//['titles', 'series', 'contributors'],
            appSettings: <AppSettingsInterface>null,
            provider: <SearchFormProvider>null
        }
    };

    public searchAdvancedConfig = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'Names',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder'
        }
    };

    constructor(public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected router: Router,
                protected route: ActivatedRoute,
                protected simpleTransferProvider: ConsumerSettingsTransferProvider,
                public exportProvider: ExportProvider,
                protected searchSettingsProvider: SearchSettingsProvider,
                protected injector: Injector,
                protected notificationService: NotificationService) {
        super(injector);
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.context = d.context;

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        // advanced search
        this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;

        this.selectedItem = null;
    }

    ngOnInit() {
        this.namesTree.onSelectAuthoring.subscribe((res)=>{
            this.selectedItem = {ID:res.ENTITY_ID, NAME: res.NAME};
        });
    }

    closeModal() {
        this.modalRef.hide();
    }

    saveData() {
        this.modalRef.emitClickFooterBtn('ok', this.selectedItem);
        this.modalRef.hide();
    }
}
