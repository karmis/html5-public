import {Routes} from '@angular/router';
import {SecurityLoadProvider} from './providers/security/security.load.provider';
import {appRouter} from './constants/appRouter';
import {SecurityActivateProvider} from "./providers/security/security.activate";
import {NoContentComponent} from "./views/no-content";
import {NoAccessComponent} from "./views/no-access";
import {BaseComponent} from "./views/base/base.component";

export const ROUTES: Routes = [
    {
        path: appRouter.empty,
        component: BaseComponent
    },
    {
        path: appRouter.login,
        loadChildren: () => import('./views/login/index').then(m => m.LoginModule),
    },
    {
        path: appRouter.login_reset.verification,
        loadChildren: () => import('./views/login-reset-password/index').then(m => m.LoginResetPasswordModule),
    },
    {
        path: appRouter.loginauto,
        loadChildren: () => import('./views/login/index').then(m => m.LoginModule),
    },
    {
        path: appRouter.title.search,
        loadChildren: () => import('./views/titles/index').then(m => m.TitlesModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.profile,
        loadChildren: () => import('./views/profile/index').then(m => m.ProfileModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.media_basket,
        loadChildren: () => import('./views/media-basket/index').then(m => m.MediaBasketModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.events_manager,
        loadChildren: () => import('./views/events-manager/index').then(m => m.EventsManagerModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.recording_lines,
        loadChildren: () => import('./views/recording-lines/index').then(m => m.RecordingLinesModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.event_recordings.detail_single,
        loadChildren: './views/detail/event/index#EventRequestDetailsModule',
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.event_recordings.detail_multi,
        loadChildren: './views/detail/event/index#EventRequestDetailsModule',
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider],
        data: {isMulti: true}
    },
    {
        path: appRouter.event_recordings.create_single,
        loadChildren: './views/detail/event/index#EventRequestDetailsModule',
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider],
        data: {isNew: true}
    },
    {
        path: appRouter.event_recordings.create_multi,
        loadChildren: './views/detail/event/index#EventRequestDetailsModule',
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider],
        data: {isMulti: true, isNew: true}
    },
    // multi events from production
    {
        path: appRouter.event_recordings.detail_multi_form_prod,
        loadChildren: './views/detail/event/index#EventRequestDetailsModule',
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider],
        data: {isMulti: true}
    },
    {
        path: appRouter.event_recordings.create_multi_form_prod,
        loadChildren: './views/detail/event/index#EventRequestDetailsModule',
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider],
        data: {isMulti: true, isNew: true}
    },
    // multi events from production --end
    {
        path: appRouter.media_logger.detail,
        loadChildren: () => import('./views/media-logger/index').then(m => m.MediaLoggerModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.workflow.media_logger_task,
        loadChildren: () => import('./views/detail/tasks/media-logger-task/index').then(m => m.MediaLoggerTaskModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.workflow.clip_editor_task,
        loadChildren: () => import('./views/detail/tasks/clip-editor-task/index').then(m => m.ClipEditorTaskModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.workflow.designer,
        loadChildren: () => import('./views/workflow-designer/index').then(m => m.WorkflowDesignerModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    // { // old
    //     path: appRouter.search,
    //     loadChildren: './views/branding/index#BrandingSearchModule',
    //     canLoad: [SecurityLoadProvider],
    //     canActivate: [SecurityActivateProvider]
    // },
    {
        path: appRouter.branding,
        loadChildren: () => import('./views/branding/index').then(m => m.BrandingSearchModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.consumer.search,
        loadChildren: () => import('./views/consumer/index').then(m => m.ConsumerModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.consumer.start,
        loadChildren: () => import('./views/branding/index').then(m => m.BrandingSearchModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.media.search,
        loadChildren: () => import('./views/media/index').then(m => m.MediaModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider],
    },
    {
        path: appRouter.folders.search,
        loadChildren: () => import('./views/folders/index').then(m => m.FoldersModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider],
    },
    {
        path: appRouter.loans.search,
        loadChildren: './views/loan/index#LoanModule',
        // canLoad: [SecurityLoadProvider], // TODO: LOAN
        // canActivate: [SecurityActivateProvider],
    },
    {
        path: appRouter.loans.detail,
        loadChildren: './views/detail/loan/index#LoanDetailModule',
        // canLoad: [SecurityLoadProvider],
        // canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.loans.create,
        loadChildren: './views/detail/loan/index#LoanDetailModule',
        // canLoad: [SecurityLoadProvider],
        // canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.production.search,
        loadChildren: './views/production/index#ProductionModule',
    },
    {
        path: appRouter.production.prod_detail,
        loadChildren: './views/detail/production/index#ProductionDetailModule',
    },
    {
        path: appRouter.production.create,
        loadChildren: './views/detail/production/index#ProductionDetailModule',
        data: {productionTypeDetail: 'create'},
    },
    {
        path: appRouter.production.clone,
        loadChildren: './views/detail/production/index#ProductionDetailModule',
        data: {productionTypeDetail: 'clone'},
    },
    {
        path: appRouter.production.manager,
        loadChildren: './views/production/comps/production.manager/index#ProductionManagerModule',
        data: {searchType: 'productionmanager'}
    },
    {
        path: appRouter.production.my_productions,
        loadChildren: './views/production/comps/production.manager/index#ProductionManagerModule',
        data: {searchType: 'myproductions'}
    },
    {
        path: appRouter.names.search,
        loadChildren: () => import('./views/names/index').then(m => m.NamesModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.cachemanager.search,
        loadChildren: () => import('./views/cachemanager/index').then(m => m.CacheManagerModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.associate.search,
        loadChildren: () => import('./views/mapping/index').then(m => m.MappingModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.associate_media.search,
        loadChildren: './views/media-associate/index#MediaAssociateModule',
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.supplier_portal.search,
        loadChildren: () => import('./views/supplier-portal/index').then(m => m.SupplierPortalModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.dashboard,
        loadChildren: () => import('./views/dashboard/index').then(m => m.DashboardModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.reports,
        loadChildren: () => import('./views/reports/index').then(m => m.ReportsModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.version,
        loadChildren: () => import('./views/version/index').then(m => m.VersionModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.carrier,
        loadChildren: () => import('./views/carrier/index').then(m => m.CarrierModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.workflow.search,
        loadChildren: () => import('./views/workflow/index').then(m => m.WorkflowModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.task.search,
        loadChildren: () => import('./views/tasks/index').then(m => m.TasksModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.task_my.search,
        loadChildren: () => import('./views/tasks-my/index').then(m => m.TasksMyModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.workflow.detail,
        loadChildren: () => import('./views/workflow/comps/detail/index').then(m => m.WorkflowDetailsModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },

    {
        path: appRouter.workflow.component_qc,
        loadChildren: () => import('./views/detail/tasks/component.qc/index').then(m => m.ComponentQcDetails),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.workflow.outgest,
        loadChildren: () => import('./views/detail/tasks/outgest/index').then(m => m.OutgestDetailModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.workflow.assessment,
        loadChildren: () => import('./views/detail/tasks/assessment/index').then(m => m.AssessmentModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.workflow.segmenting,
        loadChildren: () => import('./views/detail/tasks/segmenting/index').then(m => m.SegmentingModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.media.detail,
        loadChildren: () => import('./views/detail/media/index').then(m => m.MediaDetailModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.versions.detail,
        loadChildren: () => import('./views/detail/version/index').then(m => m.VersionDetailModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.segments.detail,
        loadChildren: () => import('./views/detail/segment/index').then(m => m.SegmentDetailModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.carriers.detail,
        loadChildren: () => import('./views/detail/carrier/index').then(m => m.CarrierDetailModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.title.detail,
        loadChildren: () => import('./views/detail/titles/index').then(m => m.TitlesDetailModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.system.config,
        loadChildren: () => import('./views/system/config/index').then(m => m.SystemConfigModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.queues,
        loadChildren: () => import('./views/queue/index').then(m => m.QueueModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.misr,
        loadChildren: () => import('./views/misr/index').then(m => m.MisrModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.upload_screen,
        loadChildren: () => import('./views/upload/index').then(m => m.UploadScreenModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.work_orders,
        loadChildren: () => import('./views/work-orders/index').then(m => m.WorkOrdersModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.clip_editor_media,
        loadChildren: () => import('./views/clip-editor/index').then(m => m.ClipEditorModule),
        // loadChildren: () => System.import('./views/clip-editor/').then((comp: any) => {
        //     return comp.default;
        // }),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.clip_editor_version,
        loadChildren: () => import('./views/clip-editor/index').then(m => m.ClipEditorModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.mediaproxy_logplayer,
        loadChildren: () => import('./views/mediaproxy-logplayer/index').then(m => m.MediaProxyLogPlayerModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.logout,
        loadChildren: () => import('./views/logout/index').then(m => m.LogoutModule),
    },
    {
        path: appRouter.acquisitions.search,
        loadChildren: () => import('./views/acquisitions/index').then(m => m.AcquisitionsModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: appRouter.acquisitions.workspace,
        loadChildren: () => import('./views/acquisitions/comps/acquisition-workplace').then(m => m.AcquisitionsWorkspaceModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider],
    },
    {
        path: appRouter.production.made_items_search,
        loadChildren: () => import('./views/production-made-item/index').then(m => m.ProductionMadeItemModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider],
    },
    {
        path: appRouter.confidence_monitoring,
        loadChildren: () => import('./views/confidence-monitoring/index').then(m => m.ConfidenceMonitoringModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        // DO NOT DELETE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
        path: appRouter.demo_player,//'demo/video',   // Do not delete!!!!!!!
        loadChildren: () => import('./views/demo/comps/video/details').then(m => m.DemoVideoDetailsModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        // DO NOT DELETE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
        path: appRouter.demo_bigtree,//'demo/bigtree',   // Do not delete!!!!!!!
        loadChildren: () => import('./views/demo/comps/bigtree').then(m => m.BigTreeModule),
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    // {
    //     // DO NOT DELETE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
    //     path: 'demo/aspera',   // Do not delete!!!!!!!
    //     loadChildren: () => import('./views/demo/comps/aspera/index').then(m => m.DemoAsperaModule),
    //     canLoad: [SecurityLoadProvider],
    //     canActivate: [SecurityActivateProvider]
    // },
    // {
    //     path: 'deps/pdf',
    //     loadChildren: () => import('./modules/viewers/pdf/index').then(m => m.PDFViewerModule),
    //     canLoad: [SecurityLoadProvider],
    //     canActivate: [SecurityActivateProvider]
    // },


    {
        path: appRouter.no_access,
        component: NoAccessComponent,
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
    {
        path: '**',
        component: NoContentComponent,
        canLoad: [SecurityLoadProvider],
        canActivate: [SecurityActivateProvider]
    },
];

export const lazyModules = {
    report_params: {
        loadChildren: () => import('./views/reports/modules').then(m => m.ReportParamsModalModule)
    },
    workflow_assessment_history: {
        loadChildren: () => import('./views/detail/tasks/assessment/comps/history.modal').then(m => m.WorkflowAssessmentHistoryModule)
    },
    change_status_media: {
        loadChildren: () => import('./views/media/modules/media-status').then(m => m.MediaChangeStatusModule)
    },
    task_wizard_abort: {
        loadChildren: () => import('./modules/controls/task.wizards/abort').then(m => m.TaskWizardAbortModule)
    },
    load_golden_layout: {
        loadChildren: () => import('./modules/controls/layout.manager/modals/load.layout.modal').then(m => m.LoadLayoutModalModule)
    },
    save_golden_layout: {
        loadChildren: () => import('./modules/controls/layout.manager/modals/save.layout.modal').then(m => m.SaveLayoutModalModule)
    },
    template_modal: {
        loadChildren: () => import('./views/detail/production/comps/temlate-modal').then(m => m.TemplateModalModule)
    },
    error_modal: {
        loadChildren: () => import('./modules/error/modules/error-modal').then(m => m.ErrorModalModule)
    },
    error_refresh_modal: {
        loadChildren: () => import('./modules/error/modules/error-refresh').then(m => m.ErrorRefreshModalModule)
    },
    alert_modal: {
        loadChildren: () => import('./modules/imfx-modal/comps/alert').then(m => m.IMFXModalAlertModule)
    },
    attach_confirm_modal: {
        loadChildren: () => import('./views/media-associate/comps/attach-confirm').then(m => m.AttachConfirmModalModule)
    },
    wf_decision: {
        loadChildren: () => import('./views/detail/tasks/decision').then(m => m.WorkflowDecisionModule)
    },
    wf_list: {
        loadChildren: () => import('./views/workflow/comps/wf.list.comp').then(m => m.WorkflowListModule)
    },
    wf_raise: {
        loadChildren: () => import('./modules/rw.wizard').then(m => m.RaiseWorkflowWizardModule)
    },
    wf_info: {
        loadChildren: () => import('./views/workflow/comps/wizards/task.info').then(m => m.WorkflowWizardInfoModule)
    },
    wf_priority: {
        loadChildren: () => import('./views/workflow/comps/wizards/priority').then(m => m.WorkflowWizardPriorityModule)
    },
    wf_changeby: {
        loadChildren: () => import('./views/workflow/comps/changeby').then(m => m.WorkflowChangeByModalModule)
    },
    tasks_priority: {
        loadChildren: () => import('./views/tasks/comps/wizards/priority').then(m => m.TasksWizardPriorityModule)
    },
    tasks_my_priority: {
        loadChildren: () => import('./views/tasks-my/comps/wizards/priority').then(m => m.MyTasksWizardPriorityModule)
    },
    tcb_abort: {
        loadChildren: () => import('./modules/search/tasks-control-buttons/comps/abort.modal').then(m => m.TaskAbortModule)
    },
    tcb_index: {
        loadChildren: () => import('./modules/search/tasks-control-buttons').then(m => m.TasksControlButtonsModule)
    },
    change_date_by_modal: {
        loadChildren: () => import('./views/detail/titles/comps/change.date.modal').then(m => m.ChangeDateByModalModule)
    },
    remote_file_browser: {
        loadChildren: () => import('./modules/controls/file-browser').then(m => m.IMFXControlsRemoteFileBrowserModule)
    },
    xml_modal: {
        loadChildren: () => import('./modules/search/detail/components/imf.tab.component/comps/xml.modal').then(m => m.XMLModalModule)
    },
    same_filename: {
        loadChildren: () => import('./modules/upload/modules/same-file-modal').then(m => m.IMFXListOfSameFilesModule)
    },
    upload_require_file: {
        loadChildren: () => import('./modules/upload/modules/require-file-modal').then(m => m.IMFXRequireFileModule)
    },
    order_presets_grouped_modal: {
        loadChildren: () => import('./modules/order-presets-grouped-modal').then(m => m.OrderPresetsGroupedModalModule)
    },
    create_subversion: {
        loadChildren: () => import('./modules/create.subversion.modal').then(m => m.CreateSubversionModalModule)
    },
    create_episode_title: {
        loadChildren: () => import('./modules/create.episode.title.modal').then(m => m.CreateEpisodeTitleModalModule)
    },
    upload_modal: {
        loadChildren: () => import('./modules/upload').then(m => m.UploadModule)
    },
    upload_remote_modal: {
        loadChildren: () => import('./modules/upload-remote').then(m => m.UploadRemoteModule)
    },
    upload_versions_modal: {
        loadChildren: () => import('./modules/upload/modules/versions').then(m => m.VersionsInsideUploadModule)
    },
    version_search_modal: {
        loadChildren: () => import('./modules/version-search-modal').then(m => m.VersionSearchModalModule)
    },
    unattached_media_search_modal: {
        loadChildren: () => import('./views/detail/event/components/unattached.media.modal').then(m => m.UnattachedMediaSearchModalModule)
    },
    titles_search_modal: {
        loadChildren: () => import('./views/detail/event/components/titles.modal').then(m => m.TitlesSearchModalModule)
    },
    document_modal_module: {
        loadChildren: () => import('./modules/controls/document.modal/').then(m => m.DocumentModalModule)
    },
    about_info_modal: {
        loadChildren: () => import('./modules/about.info.modal').then(m => m.AboutInfoModalModule)
    },
    settings_common_tables_grid_change_modal: {
        loadChildren: () => import('./views/system/config/comps/common.tables.grid/modals/edit.modal').then(m => m.CommonTablesGridChangeModalModule)
    },
    location_module_modal: {
        loadChildren: () => import('./modules/search/location').then(m => m.LocationModule)
    },
    system_about_modal: {
        loadChildren: () => import('./modules/system-about').then(m => m.SystemAboutModule)
    },
    manager_group_modal: {
        loadChildren: () => import('./views/system/config/comps/settings.user-manager/modals/group.modal').then(m => m.ManagerGroupModalModule)
    },
    manager_user_modal: {
        loadChildren: () => import('./views/system/config/comps/settings.user-manager/modals/edit.modal').then(m => m.ManagerUserModalModule)
    },
    add_location_modal: {
        loadChildren: () => import('./views/system/config/comps/settings.user-manager/modals/add-location.modal').then(m => m.AddLocationModalModule)
    },
    names_authoring_modal: {
        loadChildren: () => import('./views/system/config/comps/settings.user-manager/modals/names-authoring.modal').then(m => m.NamesAuthoringModalModule)
    },
    load_master_change_queue_modal: {
        loadChildren: () => import('./views/system/config/comps/settings.load-master/modals/edit.queue').then(m => m.LoadMasterChangeQueueModalModule)
    },
    load_master_change_modal: {
        loadChildren: () => import('./views/system/config/comps/settings.load-master/modals/edit.modal').then(m => m.LoadMasterChangeModalModule)
    },
    user_notification_modal: {
        loadChildren: () => import('./views/system/config/comps/settings.user-manager/comps/user_notifications/modals/edit.modal').then(m => m.NotificationsEditModalModule)
    },
    channel_group_change_modal: {
        loadChildren: () => import('./views/system/config/comps/settings.channels-groups/modals/edit.modal').then(m => m.ChannelsGroupChangeModalModule)
    },
    consumer_fields_modal: {
        loadChildren: () => import('./modules/settings/consumer/fields').then(m => m.ConsumerFieldsModule)
    },
    edit_xml_modal: {
        loadChildren: () => import('./views/system/config/comps/xml/modals/edit-modal.modal').then(m => m.EditXmlModalModule)
    },
    edit_xslt_modal: {
        loadChildren: () => import('./views/system/config/comps/settings.xslt/modals/edit-modal.modal').then(m => m.EditXsltModalModule)
    },
    edit_production_template_modal: {
        loadChildren: () => import('./views/system/config/comps/productions.config/modals/edit-modal.modal').then(m => m.EditProductionTemplateModalModule)
    },
    preview_player_comp: {
        loadChildren: () => import('./modules/modal.preview.player').then(m => m.ModalPreviewPlayerModule)
    },
    export_modal: {
        loadChildren: () => import('./modules/export/index').then(m => m.ExportModule)
    },
    tab_add_data_users_modal: {
        loadChildren: () => import('./views/system/config/comps/settings.user-manager/comps/users_tab/modals/tabs.add-data-users.modal').then(m => m.TabDataUsersModalModule)
    },
    new_contact_modal_comp: {
        loadChildren: () => import('./views/system/config/comps/settings.user-manager/comps/users_tab/modals/tabs.add-data-users.modal').then(m => m.TabDataUsersModalModule)
    },
    edit_acq_modal_comp: {
        loadChildren: () => import('./views/acquisitions/comps/acquisition-workplace/modals/edit.acquisition.modal').then(m => m.EditAcquisitionModalModule)
    },
    edit_article_modal_comp: {
        loadChildren: () => import('./views/acquisitions/comps/acquisition-workplace/modals/edit.article.modal').then(m => m.EditArticleModalModule)
    },
    version_wizard: {
        loadChildren: () => import('./modules/version-wizard').then(m => m.VersionWizardModule)
    },
    media_wizard: {
        loadChildren: () => import('./views/clip-editor/comps/wizard').then(m => m.MediaWizardModule)
    },
    names_modal: {
        loadChildren: () => import('./views/names/modals/names.modal').then(m => m.NamesModalModule)
    },
    search_columns: {
        loadChildren: () => import('./modules/search/columns').then(m => m.SearchColumnsModule)
    },
    choose_rows_modal: {
        loadChildren: () => import('./modules/controls/choosing.rows.modal').then(m => m.ChoosingRowsModalModule)
    },
    xml_module: {
        loadChildren: () => import('./modules/search/xml').then(m => m.XmlModule)
    },
    users_modal: {
        loadChildren: () => import('./modules/search/users').then(m => m.UsersModule)
    },
    columns_order: {
        loadChildren: () => import('./modules/search/columns-order').then(m => m.ColumnsOrderModule)
    },
    taxonomy_modal: {
        loadChildren: () => import('./modules/search/taxonomy').then(m => m.TaxonomyModule)
    },
    prod_templates_modal: {
        loadChildren: () => import('./modules/search/prod.templates').then(m => m.ProductionTemplatesModule)
    },
    loan_modal: {
        loadChildren: () => import('./views/loan/comps/wizard').then(m => m.LoanWizardModule)
    },
    choose_item_table: {
        loadChildren: () => import('./modules/choose.item.modal').then(m => m.ChooseItemModalModule)
    },
    production_select_version: {
        loadChildren: () => import('./modules/production.select.version.modal').then(m => m.ChooseItemModalModule)
    },
    production_version_already: {
        loadChildren: () => import('./modules/production.select.version.modal/comps/version.already/index').then(m => m.VersionAlreadyModule)
    },
    make_list_modal: {
        loadChildren: () => import('./modules/make.list.modal').then(m => m.MakeListModalModule)
    },
    change_custom_status_modal: {
        loadChildren: () => import('./views/media/comp/change-custom-status').then(m => m.ChangeCustomStatusModule)
    },
    production_make_officer_modal: {
        loadChildren: () => import('./views/production/comps/make.officer.modal').then(m => m.MakeOfficerModalModule)
    },
    production_make_items_modal: {
        loadChildren: () => import('./modules/search/detail/components/production.make.list.component/comps/make.items.modal').then(m => m.MakeItemsModalModule)
    },
    version_modal: {
        loadChildren: () => import('./views/system/config/comps/global.settings/comps/version.modal').then(m => m.VersionModalModule)
    },
    wf_expand_row_module: {
        loadChildren: () => import('./views/workflow/comps/slickgrid/formatters/expand.row').then(m => m.WorkflowExpandRowModule)
    },
    view_detail_modal: {
        loadChildren: () => import('./modules/search/views/comp/view.detail.modal').then(m => m.ViewDetailModalModule)
    },
    edit_som_eom_modal: {
        loadChildren: () => import('./modules/search/detail/components/modals/edit.som.eom.modal').then(m => m.default)
    },
    save_default_layout_modal: {
        loadChildren: () => import('./modules/search/detail/components/modals/save.default.layout.modal').then(m => m.default)
    },
    add_custom_status_modal: {
        loadChildren: () => import('./modules/controls/add.custom.status.modal').then(m => m.AddCustomStatusModalModule)
    },
    add_custom_column_modal: {
        loadChildren: () => import('./modules/controls/add.customcolumn.modal').then(m => m.AddCustomColumnModalModule)
    },
    select_tracks_modal: {
        loadChildren: () => import('./views/detail/tasks/component.qc/modals/select.tracks.modal').then(m => m.SelectTracksModalModule)
    },
    imfx_modal_prompt: {
        loadChildren: () => import('./modules/imfx-modal/comps/prompt').then(m => m.IMFXModalPromptModule)
    },
    show_copy_from_modal: {
        loadChildren: () => import('./views/system/config/comps/detail.view.metadata.config/modals/copy-from.modal').then(m => m.CopyFromModalModule)
    },
    cm_dd_modal: {
        loadChildren: () => import('./views/system/config/comps/cachemanager/destination-devices/modals/cm.dd.modal').then(m => m.CacheManagerDestinationDevicesModalModule)
    },
    cm_sd_modal: {
        loadChildren: () => import('./views/system/config/comps/cachemanager/source-devices/modals/cm.sd.modal').then(m => m.CacheManagerDestinationDevicesModalModule)
    },
    cm_ct_modal: {
        loadChildren: () => import('./views/system/config/comps/cachemanager/channel-templates/modals/cm.ct.modal').then(m => m.CacheManagerDestinationDevicesModalModule)
    },
    misr_components_modal: {
        loadChildren: () => import('./views/system/config/comps/misrmanager/components/modals/misr.components.modal').then(m => m.MisrComponentsModalModule)
    },
    misr_templates_modal: {
        loadChildren: () => import('./views/system/config/comps/misrmanager/templates/modals/misr.templates.modal').then(m => m.MisrTemplatesModalModule)
    },
    misr_audio_modal: {
        loadChildren: () => import('./views/system/config/comps/misrmanager/audio/modals/misr.audio.modal').then(m => m.MisrAudioModalModule)
    },
    misr_channel_schedule_modal: {
        loadChildren: () => import('./views/system/config/comps/misrmanager/audio/modals/misr.channel.schedule.modal').then(m => m.MisrChannelScheduleModalModule)
    },
    supplier_config_search_columns: {
        loadChildren: () => import('./views/system/config/comps/settings.groups/comps/details/comps/advanced.supplier.portal/comps/views.columns').then(m => m.SearchViewsColumnsModule)
    },
    production_config_tabs_change_modal: {
        loadChildren: () => import('./views/system/config/comps/productions.config/modals/edit-modal.modal/components/tab.grid/components/edit.modal').then(m => m.ProductionConfigTabGridEditModalModule)
    },
    production_config_make_actions_edit_modal: {
        loadChildren: () => import('./views/system/config/comps/productions.config/modals/edit-modal.modal/components/make.actions.component/components/edit.modal').then(m => m.ProductionConfigMakeActionsEditModalModule)
    },
    production_config_make_actions_edit_modal_grid_modal: {
        loadChildren: () => import('./views/system/config/comps/productions.config/modals/edit-modal.modal/components/make.actions.component/components/edit.modal.grid.modal').then(m => m.ProductionConfigMakeActionsEditModalGridModalModule)
    },
    queue_set_id: {
        loadChildren: () => import('./views/queue/components/change.queue.id.modal').then(m => m.ChangeQueueIdModalModule)
    },
    confidence_monitoring_pages_modal: {
        loadChildren: () => import('./views/confidence-monitoring/comps/pages.modal').then(m => m.PagesModalModule)
    }

    // user_notification_modal: {
    //     loadChildren: () => import('./views/system/config/comps/settings.user-manager/comps/user_notifications/modals/edit.modal').then(m => m.NotificationsEditModalModule)
    // }


    // import {ChannelsGroupChangeModalComponent} from "./views/system/config/comps/settings.channels-groups/modals/edit.modal/channels.group.change.modal.component";
// import ChannelsGroupChangeModalModule from "./views/system/config/comps/settings.channels-groups/modals/edit.modal";
};
//
//
// // This will create a dedicated JS bundle for lazy module
// export const lazyWidgets: { path: string, loadChildren: () => Promise<NgModuleFactory<any> | Type<any>> }[] = [
//     {
//         path: 'app/fake/reports/params',
//         src: './views/reports/modules/index',
//         loadChildren: () => import('./views/reports/modules/index').then(m => m.ReportParamsModalModule)
//     }
// ];
//
// // This function will work as a factory for injecting lazy widget array in the main module
// export function lazyArrayToObj() {
//     const result = {};
//     for (const w of lazyWidgets) {
//         result[w.path] = w.loadChildren;
//     }
//     return result;
// }
// {
//     path: 'demo/video',
//         loadChildren: () => System.import('./views/demo/comps/video/details').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityLoadProvider],
//     canActivate: [SecurityActivateProvider]
// },


// {
//     path: 'demo',
//         loadChildren: () => System.import('./views/demo').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// {
//     path: 'demo/tree',
//         loadChildren: () => System.import('./views/demo/comps/tree').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// {
//     path: 'demo/permissions_tree',
//         loadChildren: () => System.import('./views/demo/comps/permissions_tree').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// {
//     path: 'demo/mse',
//         loadChildren: () => System.import('./views/demo/comps/mse/index').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// {
//     path: 'demo/video',
//         loadChildren: () => System.import('./views/demo/comps/video/details').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
// },
// {
//     path: 'demo/video/details/:type',
//         loadChildren: () => System.import('./views/demo/comps/video/details').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// {
//     path: 'demo/audio-synch',
//         loadChildren: () => System.import('./views/demo/comps/audio.synch/details').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// {
//     path: 'demo/video/audio-synch/:type',
//         loadChildren: () => System.import('./views/demo/comps/audio.synch/details').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// {
//     path: 'demo/timeline',
//         loadChildren: () => System.import('./views/demo/comps/timeline').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// {
//     path: 'demo/viewers',
//         loadChildren: () => System.import('./views/demo/comps/viewers').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// {
//     path: 'demo/date-formats',
//         loadChildren: () => System.import('./views/demo/comps/date-formats').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// {
//     path: 'demo/permissions',
//         loadChildren: () => System.import('./views/demo/comps/permissions').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// {
//     path: 'demo/xml',
//         loadChildren: () => System.import('./views/demo/comps/xml').then((comp: any) => {
//     return comp.default;
// }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// {
//     path: 'demo/jointjs',
//         loadChildren: () => System.import('./views/demo/comps/jointjs.interactive')
//     .then((comp: any) => {
//         return comp.default;
//     }),
//     canLoad: [SecurityProvider],
//     canActivate: [SecurityActivateProvider]
// },
// // end demo
