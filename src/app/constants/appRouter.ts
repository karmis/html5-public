// import {MediaStatusModule} from "../views/media/modules/media-status";

export const appRouter = {
    empty: '',
    login: 'login',
    login_reset: {
        verification: 'login/reset/verification'
    },
    loginauto: 'login?auto',
    logout: 'logout',
    logoutauto: 'logout?auto',
    no_access: 'no-access',
    acquisitions: {
        search: 'acquisitions',
        workspace: 'acquisitions/workspace/:id',
    },
    acquisitions_iframe: {
        edit: 'acquisitions/edit',
        new: 'acquisitions/new',
        new_tpl: 'acquisitions/new-tpl'
    },
    media: {
        search: 'media',
        detail: 'media/detail/:id',
    },
    folders: {
        search: 'folders',
        detail: 'folders/detail/:id',
    },
    loans: {
        search: 'loans',
        detail: 'loans/detail/:id',
        create: 'loans/create',
    },
    production: {
        search: 'production',
        prod_detail: 'production-detail/:productionTypeDetail/:id',
        manager: 'production/manager',
        create: 'production-detail/:productionTypeDetail',
        clone: 'production-detail/:productionTypeDetail',
        my_productions: 'production/my-productions',
        made_items_search: 'production/made-items-search',
    },
    cachemanager: {
        search: 'cachemanager',
        detail: 'media/detail/:id',
    },
    names: {
        search: 'names',
    },
    associate: {
        search: 'associate',
        detail: 'associate/detail/:id',
    },
    associate_media: {
        search: 'associate-media',
        // detail: 'associate/detail/:id',
    },
    supplier_portal: {
        search: 'supplier-portal',
        detail: 'supplier-portal/detail/:id',
    },
    workflow: {
        search: 'workflow',
        detail: 'workflow/detail/:id',
        component_qc: 'task/component-qc/:id',
        outgest: 'task/outgest/:id',
        assessment: 'task/assessment/:id',
        segmenting: 'task/segmenting/:id',
        media_logger_task: 'task/media-logger-task/:id',
        clip_editor_task: 'task/clip-editor-task/:id',
        designer: 'workflow/designer'
    },
    task: {
        search: 'tasks',
        task: 'task',
        // component_qc: 'workflow/component-qc/:id',
    },
    task_my: {
        search: 'my-tasks'
    },
    system: {
        system: 'system',
        config: 'system/config',
        xml: 'system/config/xml',
    },
    queues: 'queues',
    // simple: {
    //     search: 'consumer',
    //     settings: 'consumer/settings',
    // },
    consumer: {
        search: 'consumer',
        start: 'consumer/start',
        settings: 'consumer/settings',
    },
    search: 'search',
    branding: 'branding',
    searchType: 'search/:staticSearchType',
    start: 'start',
    profile: 'profile',
    events_manager: 'events-manager',
    event_recordings: {
        detail_single: 'events/single/detail/:id',
        detail_multi: 'events/multi/detail/:id',
        create_single: 'events/single/create',
        create_multi: 'events/multi/create',
        detail_multi_form_prod: 'events/multi/detail/production/:prod_id',
        create_multi_form_prod: 'events/multi/create/production/:prod_id',
    },
    recording_lines: 'recording-lines',
    misr: 'misr',
    upload_screen: "upload",
    dashboard: 'dashboard',
    title: {
        search: 'titles',
        detail: 'title/detail/:id',
    },
    versions: {
        search: 'versions',
        detail: 'versions/detail/:id',
    },
    segments: {
        detail: 'segments/detail/:id',
    },
    version: 'version',
    carrier: 'carrier',
    carriers: {
        search: 'carriers',
        detail: 'carriers/detail/:id',
    },
    media_basket: 'media-basket',
    media_logger: {
        detail: 'media-logger/:id',
        job: 'media-logger-job/:id',
    },
    reports: 'reports',
    clip_editor_media: 'clip-editor/media/:id',
    clip_editor_version: 'clip-editor/version/:id',
    rce: 'rce/:id',
    mediaproxy_logplayer: 'mediaproxy-logplayer',
    work_orders: 'work-orders',
    demo_player: 'demo-player',
    change_custom_media_status: 'change-custom-media-status',
    change_custom_version_status: 'change-custom-version-status',
    demo_bigtree: 'demo/bigtree',
    fake_routes: {
    },
    confidence_monitoring: 'confidence-monitoring'
};

export const appRouterAliases = {
    'media': "base.media",
    'loans': "base.loans",
    'production': "base.productions",
    'acquisitions': 'base.acquisitions',
    'cachemanager': 'base.cachemanager',
    'names': 'base.names',
    'associate': 'base.associate',
    'associate-media': 'base.associate_media',
    'workflow': 'base.workflow',
    'tasks': 'base.tasks',
    'my-tasks': 'base.my-tasks',
    // 'system': 'base.system',
    'system/config': 'base.system_configuration',
    'system/config/xml': 'system-config.xml.title',
    'queues': 'base.queues',
    // 'consumer': 'consumer.title',
    'consumer': 'base.consumer',
    'branding': 'base.branding',
    'profile': 'base.profile.to_profile',
    'events-manager': 'base.events-manager',
    'event-recordings': 'base.event_recordings',
    'recording-lines': 'base.recording-lines',
    'misr': 'base.misr',
    'dashboard': 'base.dashboard',
    'titles': 'base.titles',
    'version': 'version.title',
    'carrier': 'carrier.title',
    'supplier-portal': 'base.supplier_portal',
    'media-basket': 'basket.title',
    'reports': 'reports.title',
    'mediaproxy-logplayer': 'base.mediaproxy-logplayer',
    'upload': 'upload_screen.title',
    'confidence-monitoring': 'base.confidence-monitoring'
};

