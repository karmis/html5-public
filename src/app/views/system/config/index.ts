/**
 * Created by Sergey Trizna on 22.02.2018.
 */

import {CommonModule} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
// comps
import {SystemConfigComponent} from './system.config.component';
import {SettingsGroupsComponent} from './comps/settings.groups/settings.groups.component';
import {SettingsGroupsDetailsComponent} from './comps/settings.groups/comps/details/settings.groups.details.component';
import {SettingsGroupsGridComponent} from './comps/settings.groups/comps/grid/settings.groups.grid.component';
import {SettingsGroupsDetailsDefaultsComponent} from './comps/settings.groups/comps/details/comps/defaults/defaults.component';
import {SettingsGroupsDetailsSearchByFieldsComponent} from './comps/settings.groups/comps/details/comps/search.by.fields/search.by.fields.component';
import {SettingsGroupsDetailsFacetsComponent} from './comps/settings.groups/comps/details/comps/facets/facets.component';
import {SettingsGroupsDetailsSearchScreenComponent} from './comps/settings.groups/comps/details/comps/search.screen/search.screen.component';
import {SettingsGroupsDetailsItemLayoutComponent} from './comps/settings.groups/comps/details/comps/item.layout/item.layout.component';
import {SettingsGroupsDetailsDetailsLayoutComponent} from './comps/settings.groups/comps/details/comps/details.layout/details.layout.component';
// IMFX modules
import SystemConfigXmlModule from './comps/xml/index';
import {TabsModule} from 'ngx-bootstrap/tabs';
import {ConsumerSettingsModule} from '../../../modules/settings/consumer/item';
import {ConsumerDetailSettingsModule} from '../../../modules/settings/consumer/detail';
// import {GlobalSettingsComponent} from './comps/global.settings/global.settings.component';
import {GlobalSettingsGrafanaComponent} from './comps/global.settings/comps/grafana/global.settings.grafana.component';
import {BrandingSearchFormModule} from '../../branding/components/search';
import {GlobalSettingsLoggerComponent} from './comps/global.settings/comps/logger/global.settings.logger.component';
import {OverlayModule} from '../../../modules/overlay';
import {appRouter} from '../../../constants/appRouter';
import {SlickGridModule} from '../../../modules/search/slick-grid';
import {SettingsServiceConfigComponent} from "./comps/settings.service-config/settings.service.config.component";
import {ServiceConfigGridComponent} from "./comps/settings.service-config/comps/grid/settings.service.config.grid.component";
import {ServiceConfigDetailsComponent} from "./comps/settings.service-config/comps/details/settings.service.config.details.component";
import {IMFXXMLTreeModule} from "../../../modules/controls/xml.tree";
import {IMFXAccessControlModule} from "../../../modules/access";
import {IMFXTextDirectionDirectiveModule} from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {SettingsConfigTablesComponent} from "./comps/settings.config-tables/settings.config-tables.component";
import {UserManagerUsersGridComponent} from './comps/settings.user-manager/comps/users.grid/users.grid.component';
import {SettingsUserManagerComponent} from './comps/settings.user-manager/settings.user-manager.component';
import {UserManagerGroupsGridComponent} from './comps/settings.user-manager/comps/groups.grid/groups.grid.component';
import {ManagerUserModalModule} from "./comps/settings.user-manager/modals/edit.modal";
import {ChoosingRowsModalModule} from '../../../modules/controls/choosing.rows.modal';
import SettingsUserNotificationsModule from "./comps/settings.user-manager/comps/user_notifications/index";
import SettingsUserDefaultViewsModule from "./comps/settings.user-manager/comps/user_defaultviews/index";
import {NotificationsEditModalModule} from "./comps/settings.user-manager/comps/user_notifications/modals/edit.modal";
import {GlobalSettingsHtmlPlayerHotkeysComponent} from './comps/global.settings/comps/html.player.hotkeys/global.settings.html.player.hotkeys.component';
import {SettingsGroupsDetailsSearchLayoutComponent} from "./comps/settings.groups/comps/details/comps/search-layout/search-layout.component";
import {NgxSortableModule} from 'ngx-sortable' //@TODO replace to ngx-drag-drop in search layout config and remove
import {DndModule} from 'ngx-drag-drop';
import {IMFXControlsTreeModule} from "../../../modules/controls/tree";
import {SettingsGroupsDetailsUploadLayoutComponent} from './comps/settings.groups/comps/details/comps/upload/upload.layout.component';
import {IMFXControlsSelect2Module} from '../../../modules/controls/select2';
import {GlobalErrorConfigComponent} from './comps/global.settings/comps/error/global.error.config.component';
import {DetailsViewMetadataConfig} from "./comps/detail.view.metadata.config/detail.view.metadata.config.component";
import {ColorPickerModule} from "ngx-color-picker";
import {SettingsLoadMasterComponent} from "./comps/settings.load-master/settings.load-master.component";
import {LoadMasterChangeModalModule} from "./comps/settings.load-master/modals/edit.modal";
import {LoadMasterGridComponent} from "./comps/settings.load-master/comps/grid/settings.load-master.grid.component";
import {SettingsXSLTComponent} from "./comps/settings.xslt/settings.xslt.component";
import {SettingsGroupsMisrDetailsFieldsComponent} from './comps/settings.groups/comps/details/comps/misr.details.fields/misr.details.fields.component';
import {SettingsChannelsGridComponent} from "./comps/settings.channels/settings.channels.grid.component";
import {ChannelsGroupChangeModalModule} from "./comps/settings.channels-groups/modals/edit.modal";
import {SettingsChannelsGroupsGridComponent} from "./comps/settings.channels-groups/settings.channels-groups.grid.component";
import {SettingsGroupsVersionCreationComponent} from './comps/settings.groups/comps/details/comps/version.creation/version.creation.component';
import {SettingsGroupsAdvancedAssociateComponent} from './comps/settings.groups/comps/details/comps/advanced.associate/advanced.associate.component';
import {SearchAdvancedModule} from '../../../modules/search/advanced';
import {SettingsGroupsAdvancedSupplierPortalComponent} from './comps/settings.groups/comps/details/comps/advanced.supplier.portal/advanced.supplier.portal.component';
import {IMFXSchemaTreeModule} from "./comps/xml/components/schema.tree";
import {DetailsViewCustomMetadataConfig} from "./comps/detail.view.custommetadata.config/detail.view.custommetadata.config.component";
import {SystemSettingsGridComponent} from "./comps/settings.system-settings/comps/grid/settings.system-settings.grid.component";
import {SettingsSystemSettingsComponent} from "./comps/settings.system-settings/settings.system-settings.component";
import {IMFXDropDownDirectiveModule} from "../../../directives/dropdown/dropdown.directive.module";
import {SettingsGroupsAdvancedAssociateMediaComponent} from './comps/settings.groups/comps/details/comps/advanced.associate.media/advanced.associate.media.component';
import {SafePipeModule} from "../../../modules/pipes/safePipe";
import { LoadingIconsGridComponent } from "./comps/global.settings/comps/loading-icons/loading-icons.grid.component";
import { LoadingIconsDetailComponent } from "./comps/global.settings/comps/loading-icons/comps/details/loading-icons-detail.component";
import { DragDropDirective } from "../../../directives/drag-drop/drag-drop.directive";
import { UploadFileComponent } from "./comps/global.settings/comps/upload-file/upload-file.component";
import { SetSearchModule } from "../../branding/components/set-search";
import {SettingsGroupsVideoBrowserAppComponent} from "./comps/settings.groups/comps/details/comps/video.browser.app/video.browser.app.component";
import { CacheManagerSourceDevicesComponent } from './comps/cachemanager/source-devices/source-devices.comp';
import { CacheManagerDestinationDevicesComponent } from './comps/cachemanager/destination-devices/destination-devices.comp';
import { CacheManagerChannelTemplatesComponent } from './comps/cachemanager/channel-templates/channel-templates.comp';
import { CacheManagerWfMatrixComponent } from './comps/cachemanager/wf-matrix/wf-matrix.comp';
import { OrderPresetsGroupedModule } from '../../../modules/order-presets-grouped';
import { MisrTemplateComponent } from './comps/misrmanager/templates/misr.templates.comp';
import { MisrComponentsComponent } from './comps/misrmanager/components/misr.components.comp';
import { MisrAudioComponent } from './comps/misrmanager/audio/misr.audio.comp';
import { ProductionsInfoTabConfig } from './comps/productions.template.config/productions.template.config.component';
import {ProductionsConfigModule} from "./comps/productions.config";
import {DigitOnlyModule} from 'app/directives/digit-only/digit-only.module';
import {SearchViewsModule} from "../../../modules/search/views";
import {SearchSettingsModule} from "../../../modules/search/settings";

import {SearchViewsColumnsModule} from "./comps/settings.groups/comps/details/comps/advanced.supplier.portal/comps/views.columns";
import { ButtonsViewsComponent } from "./comps/settings.groups/comps/details/comps/advanced.supplier.portal/comps/buttons/buttons.views.component";
import { TermsConditionsComponent } from "./comps/settings.groups/comps/details/comps/terms.conditions/terms.conditions.component";
import { SettingsGroupsRaiseWorkflowComponent } from './comps/settings.groups/comps/details/comps/raise.workflow/raise.workflow.component';
import { GoogleMapsApiComponent } from './comps/settings.groups/comps/details/comps/google.maps.api/google.maps.api.component';
import { CustomMetadataComponent } from './comps/settings.groups/comps/details/comps/custom.metadata/custom.metadata.component';
import {GlobalSettingsEventConfigComponent} from "./comps/global.settings/comps/event.config/event.config.component";
import { SearchColumnsModule } from '../../../modules/search/columns';
import { ColumnsOrderModule } from '../../../modules/search/columns-order';
import { GlobalSettingsHtmlPlayerHotkeysTabsComponent } from './comps/global.settings/comps/html.player.hotkeys.tabs/global.settings.html.player.hotkeys.tabs.component';
import { ConfidenceFeedComponent } from './comps/settings.groups/comps/details/comps/confidence.feed/confidence.feed.component';
import { GlobalSettingsTaxonomyConfigComponent } from './comps/global.settings/comps/taxonomy.config/taxonomy.config.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonTablesGridModule } from './comps/common.tables.grid';
import {VideoPlayerSettingsComponent} from "./comps/settings.groups/comps/details/comps/video.player.settings/video.player.settings.component";
import {MainMenuSettingsComponent} from "./comps/settings.groups/comps/details/comps/main.menu.urls/main.menu.settings.component";

// async components must be named routes for WebpackAsyncRoute
const routes = [
    {path: appRouter.empty, component: SystemConfigComponent}
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SystemConfigComponent,
        SettingsGroupsComponent,
        SettingsGroupsGridComponent,
        SettingsGroupsDetailsComponent,
        SettingsGroupsDetailsDefaultsComponent,
        SettingsGroupsDetailsSearchByFieldsComponent,
        SettingsGroupsDetailsFacetsComponent,
        SettingsGroupsDetailsSearchScreenComponent,
        SettingsGroupsDetailsItemLayoutComponent,
        SettingsGroupsDetailsDetailsLayoutComponent,
        SettingsGroupsDetailsSearchLayoutComponent,
        SettingsGroupsMisrDetailsFieldsComponent,
        SettingsGroupsVersionCreationComponent,
        SettingsGroupsAdvancedAssociateComponent,
        SettingsGroupsAdvancedAssociateMediaComponent,
        SettingsGroupsAdvancedSupplierPortalComponent,
        SettingsGroupsVideoBrowserAppComponent,
        SettingsGroupsRaiseWorkflowComponent,
        // GlobalSettingsComponent,
        GlobalSettingsGrafanaComponent,
        GlobalSettingsLoggerComponent,
        GlobalSettingsHtmlPlayerHotkeysComponent,
        GlobalSettingsHtmlPlayerHotkeysTabsComponent,
        GlobalSettingsEventConfigComponent,
        SettingsServiceConfigComponent,
        SettingsConfigTablesComponent,
        ServiceConfigGridComponent,
        SettingsChannelsGroupsGridComponent,
        LoadMasterGridComponent,
        SystemSettingsGridComponent,
        ServiceConfigDetailsComponent,
        SettingsUserManagerComponent,
        UserManagerUsersGridComponent,
        UserManagerGroupsGridComponent,
        SettingsGroupsDetailsUploadLayoutComponent,
        GlobalErrorConfigComponent,
        DetailsViewMetadataConfig,
        DetailsViewCustomMetadataConfig,
        SettingsLoadMasterComponent,
        SettingsSystemSettingsComponent,
        SettingsChannelsGridComponent,
        SettingsXSLTComponent,
        LoadingIconsGridComponent,
        LoadingIconsDetailComponent,
        DragDropDirective,
        UploadFileComponent,
        CacheManagerSourceDevicesComponent,
        CacheManagerDestinationDevicesComponent,
        CacheManagerWfMatrixComponent,
        CacheManagerChannelTemplatesComponent,
        MisrTemplateComponent,
        MisrComponentsComponent,
        MisrAudioComponent,
        UploadFileComponent,
        ProductionsInfoTabConfig,
        SettingsGroupsAdvancedSupplierPortalComponent,
        ButtonsViewsComponent,
        TermsConditionsComponent,
        GoogleMapsApiComponent,
        CustomMetadataComponent,
        ConfidenceFeedComponent,
        GlobalSettingsTaxonomyConfigComponent,
        VideoPlayerSettingsComponent,
        MainMenuSettingsComponent
    ],
    providers: [],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        TranslateModule,
        SystemConfigXmlModule,
        TabsModule,
        SlickGridModule,
        SafePipeModule,
        // Consumer settings
        ConsumerSettingsModule,
        ConsumerDetailSettingsModule,
        OverlayModule,
        IMFXXMLTreeModule,
        BrandingSearchFormModule,
        IMFXAccessControlModule,
        IMFXTextDirectionDirectiveModule,
        ChannelsGroupChangeModalModule,
        LoadMasterChangeModalModule,
        ManagerUserModalModule,
        NotificationsEditModalModule,
        ChoosingRowsModalModule,
        SettingsUserNotificationsModule,
        SettingsUserDefaultViewsModule,
        NgxSortableModule,//@TODO replace to ngx-drag-drop in search layout config and remove
        DndModule,
        IMFXControlsTreeModule,
        IMFXControlsSelect2Module,
        ColorPickerModule,
        SearchAdvancedModule,
        IMFXSchemaTreeModule,
        IMFXDropDownDirectiveModule,
        SetSearchModule,
        ReactiveFormsModule,
        OrderPresetsGroupedModule,
        ProductionsConfigModule,
        DigitOnlyModule,
        SearchViewsModule,
        SearchSettingsModule,
        SearchViewsColumnsModule,
        SearchColumnsModule,
        ColumnsOrderModule,
        DragDropModule,
        CommonTablesGridModule
    ],
    exports: []
})
export class SystemConfigModule {
    public static routes = routes;
}
