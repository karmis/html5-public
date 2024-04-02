/**
 * Created by Sergey Trizna on 17.02.2017.
 */
import { Injectable } from '@angular/core';
import { appRouter } from '../../constants/appRouter';
export  type PermissionType = {
    paths: string[],
    names: string[],
    parent: number[]
}

export type ListOfPermissionTypes = {[key:number]: PermissionType}
@Injectable()
export class PermissionService {

    static getPermissionsMap(): ListOfPermissionTypes {
        return {
            0: { // common
                paths: [
                    appRouter.empty, // empty route
                    appRouter.no_access,
                    // remove from common
                    appRouter.profile,
                    appRouter.workflow.designer,
                    appRouter.search,
                    appRouter.branding,
                    appRouter.searchType,
                    appRouter.folders.search,
                    appRouter.folders.detail,
                    'demo',
                    'demo/tree',
                    'demo/mse',
                    'demo/video',
                    appRouter.demo_player,
                    appRouter.demo_bigtree,
                    'demo/aspera',
                    'demo/video/details/:type',
                    'demo/audio-synch',
                    'demo/audio-synch/details/:type',
                    'demo/tabletree',
                    'demo/permissions',
                    'demo/xml',
                    'demo/timeline',
                    'demo/date-formats',
                    'demo/fileupload',
                    'demo/viewers',
                    'demo/permissions_tree',
                    appRouter.confidence_monitoring,
                    appRouter.segments.detail
                ],
                names: [
                    'thumbnails',
                    'advsearch',
                    'advsearch-builder',
                    'advsearch-example',
                    'settings',
                    'xml',
                    'views-columns-autosize'
                ],
                parent: []
            },
            100: {
                paths: [
                    appRouter.reports
                ],
                names: [
                    'reports',

                    // "views-modify"
                ],
                parent: [
                    1600
                ]
            },
            200: {
                paths: [
                    appRouter.title.search,
                    appRouter.title.detail
                ],
                names: [
                    'title-search'
                ],
                parent: [
                    500
                ]
            },
            300: {
                paths: [
                    appRouter.clip_editor_media,
                    appRouter.clip_editor_version
                ],
                names: [
                    'clip-editor'
                ],
                parent: [
                    4000
                ]
            },
            500: {
                paths: [
                    appRouter.branding,
                    appRouter.search,
                    appRouter.searchType,
                ],
                names: [
                    "main-search"
                ],
                parent: [
                    4200
                ]
            },
            600: {
                paths: [
                    appRouter.versions.search,
                    appRouter.versions.detail,
                    appRouter.version
                ],
                names: [
                    'versions-search'
                ],
                parent: [
                    500
                ]
            },
            700: {
                paths: [
                    appRouter.media.detail,
                    appRouter.media.search
                ],
                names: [
                    'media-search'
                ],
                parent: [
                    500
                ]
            },
            11026: {
                names: [
                    'media-change-status'
                ],
                paths: [],
                parent: [
                    500
                ]
            },
            800: {
                paths: [
                    appRouter.carrier,
                    appRouter.carriers.search,
                    appRouter.carriers.detail
                ],
                names: [
                    'carrier-search'
                ],
                parent: [
                    500
                ]
            },
            900: {
                paths: [
                    appRouter.task.search,
                    appRouter.task.task,
                    appRouter.workflow.component_qc,
                    appRouter.workflow.outgest,
                    appRouter.workflow.assessment,
                    appRouter.workflow.segmenting,
                    appRouter.workflow.media_logger_task,
                    appRouter.workflow.clip_editor_task
                ],
                names: [
                    'task-search'
                ],
                parent: [
                ]
            },
			910: {
                paths: [
                    appRouter.task_my.search,
                    appRouter.task.task,
                    appRouter.workflow.component_qc,
                    appRouter.workflow.assessment,
                    appRouter.workflow.segmenting,
                    appRouter.workflow.media_logger_task,
                    appRouter.workflow.clip_editor_task
                ],
                names: [
                    "task-search-my"
                ],
                parent: [
                ]
            },
            1000: {
                paths: [
                    appRouter.media_basket
                ],
                names: [
                    'media-basket'
                ],
                parent: [
                    4000
                ]
            },
            1100: {
                paths: [
                ],
                names: [
                ],
                parent: [
                    4200
                ]
            },
            1300: {
                paths: [
                    appRouter.task.task,
                    appRouter.workflow.search,
                    appRouter.workflow.detail,
                    appRouter.workflow.component_qc,
                    appRouter.workflow.assessment,
                    appRouter.workflow.segmenting,
                    appRouter.workflow.media_logger_task,
                    appRouter.workflow.clip_editor_task
                ],
                names: [
                    'workflow-search'
                ],
                parent: [
                    1100
                ]
            },
            1500: {
                paths: [
                    appRouter.loans.search,
                    appRouter.loans.detail,
                    appRouter.loans.create,
                ],
                names: [
                    'loans'
                ],
                parent: []
            },
            1600: {
                paths: [],
                names: [],
                parent: []
            },
            1700: {
                paths: [
                    appRouter.misr
                ],
                names: [
                    'misr-search'
                ],
                parent: [
                    1600
                ]
            },
            1800: {
                paths: [],
                names: [
                    "system-menu"
                ],
                parent: [
                    4200
                ]
            },
            1900: {
                paths: [
                    appRouter.system.system,
                    appRouter.system.xml,
                    appRouter.system.config,
                    appRouter.consumer.settings,
                    appRouter.consumer.settings,
                ],
                names: [
                    'system-config'
                ],
                parent: [
                    1800
                ]
            },
            2000: {
                paths: [
                    appRouter.dashboard
                ],
                names: [
                    'dashboard'
                ],
                parent: [
                    1800
                ]
            },
            2100: {
                paths: [],
                names: [],
                parent: []
            },
            2200: {
                paths: [],
                names: [],
                parent: []
            },
            2300: {
                paths: [],
                names: [],
                parent: []
            },
            2301: {
                paths: [],
                names: [
                    'new-loan'
                ],
                parent: []
            },
            2400: {
                paths: [],
                names: [
                    'preset-workflow'
                ],
                parent: []
            },
            2500: {
                paths: [
                    appRouter.media_logger.detail,
                    appRouter.media_logger.job
                ],
                names: [
                    'media-logger'
                ],
                parent: [
                    4000
                ]
            },
            2600: {
                paths: [
                    appRouter.queues
                ],
                names: [
                    'queues-search'
                ],
                parent: [
                    1800
                ]
            },
            2800: {
                paths: [],
                names: [],
                parent: [
                    4000
                ]
            },
            3100: {
                paths: [],
                names: [
                    "views-modify",
                    "views-options"
                ],
                parent: [
                    4200
                ]
            },
            3300: {
                paths: [],
                names: [
                    "views-save",
                    "views-details",
                    "views-options"
                ],
                parent: [
                    3100
                ]
            },
            3400: {
                paths: [],
                names: [
                    "export-all",
                    "export-options"
                ],
                parent: [
                    3900
                ]
            },
            3500: {
                paths: [],
                names: [
                    "export-excel",
                    "export-options"
                ],
                parent: [
                    3900
                ]
            },
            3600: {
                paths: [],
                names: [
                    "export-pdf",
                    "export-options"
                ],
                parent: [
                    3900
                ]
            },
            3700: {
                paths: [],
                names: [
                    "export-html",
                    "export-options"
                ],
                parent: [
                    3900
                ]
            },
            3800: {
                paths: [],
                names: [
                    "export-csv",
                    "export-options"
                ],
                parent: [
                    3900
                ]
            },
            3900: {
                paths: [],
                names: [
                    "export-to-file",
                    "export-options"
                ],
                parent: [
                    4200
                ]
            },
            4000: {
                paths: [],
                names: [],
                parent: [
                    500
                ]
            },
            4200: {
                paths: [],
                names: [],
                parent: []
            },
            4300: {
                paths: [],
                names: [],
                parent: []
            },
            6000: {
                paths: [],
                names: [],
                parent: []
            },
            7000: {
                paths: [],
                names: [
                    "views-save-as",
                    "views-options"
                ],
                parent: [
                    3100
                ]
            },
            7001: {
                paths: [],
                names: [
                    "views-save-as-global",
                    "views-details",
                    "views-options"
                ],
                parent: [
                    3100
                ]
            },
            7002: {
                paths: [],
                names: [
                    "views-save-as-default",
                    "views-options"
                ],
                parent: [
                    3100
                ]
            },
            7003: {
                paths: [],
                names: [
                    'views-delete',
                    "views-options"
                ],
                parent: [
                    3100
                ]
            },
            7004: {
                paths: [],
                names: [
                    'views-reset',
                    "views-options"
                ],
                parent: [
                    3100
                ]
            },
            7005: {
                paths: [],
                names: [
                    'views-columns-setup',
                    "views-options"
                ],
                parent: [
                    3100
                ]
            },
            7006: {
                paths: [],
                names: [
                    "views-options"
                ],
                parent: [
                    3100
                ]
            },
            8001: {
                paths: [],
                names: [],
                parent: []
            },
            8002: {
                paths: [],
                names: [],
                parent: []
            },
            8003: {
                paths: [],
                names: [],
                parent: []
            },
            9100: {
                paths: [],
                names: [
                    'media-metadata-edit'
                ],
                parent: [
                    1800
                ]
            },
            9200: {
                paths: [],
                names: [],
                parent: []
            },
            11000: {
                paths: [],
                names: [],
                parent: []
            },
            11001: {
                paths: [],
                names: [],
                parent: []
            },
            11002: {
                paths: [],
                names: [],
                parent: []
            },
            11003: {
                paths: [
                    appRouter.cachemanager.search
                ],
                names: [
                    'cachemanager-search'
                ],
                parent: [
                    4200
                ]
            },
            11004: {
                paths: [],
                names: [
                    'cachemanager-config'
                ],
                parent: [
                    11003
                ]
            },
            5168: {
                paths: [],
                names: [
                    'misr-config'
                ],
                parent: [
                    10180
                ]
            },
            11005: {
                paths: [],
                names: [],
                parent: []
            },
            11006: {
                paths: [],
                names: [
                    "lock-unlock-cache"
                ],
                parent: [
                    11003
                ]
            },
            11008: {
                paths: [],
                names: [
                    "force-unforce-cache"
                ],
                parent: [
                    11003
                ]
            },
            11010: {
                paths: [],
                names: [
                    'production'
                ],
                parent: []
            },
            11012: {
                paths: [
                    appRouter.production.search
                ],
                names: [
                    'production-search'
                ],
                parent: []
            },
            11014: {
                paths: [
                    appRouter.production.manager
                ],
                names: [
                    'production-manager'
                ],
                parent: []
            },
            11016: {
                paths: [],
                names: [
                    'make-item-approve'
                ],
                parent: []
            },
            11018: {
                paths: [
                    appRouter.production.my_productions
                ],
                names: [
                    'my-production'
                ],
                parent: []
            },
            11020: {
                paths: [
                    appRouter.production.made_items_search
                ],
                names: [
                    'made-items-search'
                ],
                parent: []
            },
            11022: {
                paths: [
                    appRouter.production.prod_detail
                ],
                names: [
                    'production-detail'
                ],
                parent: []
            },
            11024: {
                paths: [],
                names: [],
                parent: []
            },
            11030: {
                paths: [
                    appRouter.events_manager,
                    appRouter.recording_lines,
                    appRouter.event_recordings.detail_single,
                    appRouter.event_recordings.detail_multi,
                    appRouter.event_recordings.detail_multi_form_prod
                ],
                names: [
                    'events-manager'
                ],
                parent: []
            },
            11031: { // new event request
                paths: [
                    appRouter.event_recordings.create_single,
                    appRouter.event_recordings.create_multi,
                    appRouter.event_recordings.create_multi_form_prod
                ],
                names: [
                    'new-event-request'
                ],
                parent: []
            },
            11040: {
                paths: [],
                names: [
                    'delete-event-request'
                ],
                parent: []
            },
            11110: {
                paths: [],
                names: [],
                parent: []
            },
            11111: {
                paths: [],
                names: [],
                parent: []
            },
            11112: {
                paths: [],
                names: [],
                parent: []
            },
            11120: {
                paths: [],
                names: [],
                parent: []
            },
            11130: {
                paths: [],
                names: [
                    "can-edit-som-eom"
                ],
                parent: [
                    700
                ]
            },
            11140: {
                paths: [],
                names: [],
                parent: [
                    1100
                ]
            },
            11150: {
                paths: [],
                names: [],
                parent: [
                    1100
                ]
            },
            12050: {
                paths: [],
                names: [
                    'create-subversion'
                ],
                parent: []
            },
            12150: {
                paths: [],
                names: [
                    'download-media'
                ],
                parent: []
            },
            12200: {
                paths: [
                    appRouter.acquisitions.search,
                    appRouter.acquisitions.workspace,
                    appRouter.acquisitions_iframe.edit,
                    appRouter.acquisitions_iframe.new,
                    appRouter.acquisitions_iframe.new_tpl
                ],
                names: [],
                parent: []
            },
            12300: {
                paths: [
                    appRouter.names.search,
                ],
                names: [],
                parent: []
            },
            123400: {
                paths: [],
                names: [
                    'media-payout-control'
                ],
                parent: []
            },
            12384: {
                paths: [],
                names: [
                    'folders'
                ],
                parent: []
            },
            12351: {
                paths: [
                    appRouter.work_orders
                ],
                names: [],
                parent: [
                    12350
                ]
            },
            12352: {
                paths: [],
                names: [
                    'reset-checks'
                ],
                parent: [
                    12350
                ]
            },
            12375: {
                paths: [],
                names: [
                    'title-deadline-date'
                ],
                parent: [
                    200
                ]
            },
            12380: {
                paths: [],
                names: [
                    'unattach-media'
                ],
                parent: []
            },
            1200012: {
                paths: [],
                names: [
                    'play_restricted_content'
                ],
                parent: []
            },
            12360: { // upload
                paths: [
                    appRouter.upload_screen
                ],
                names: [
                    'media_upload'
                ],
                parent: []
            },
            12365: { // remote media log in
                paths: [],
                names: [
                    'remote-media-login'
                ],
                parent: []
            },
            12370: { // download
                paths: [],
                names: [
                    'download-file',
                    'download-file-to-desktop'
                ],
                parent: []
            },
            12371: {
                paths: [
                    appRouter.associate.search,
                    appRouter.associate.detail
                ],
                names: [],
                parent: []
            },
            12372: {
                paths: [
                    appRouter.mediaproxy_logplayer
                ],
                names: [],
                parent: []
            },
            12373: {
                paths: [
                    // appRouter.supplier_portal.search
                ],
                names: [],
                parent: []
            },
            12374: {
                paths: [
                    appRouter.consumer.start,
                    appRouter.consumer.search,
                ],
                names: [],
                parent: []
            },
            12376: {
                paths: [
                    appRouter.associate_media.search
                ],
                names: [],
                parent: []
            },
            12377: {
                paths: [
                    appRouter.change_custom_media_status
                ],
                names: [],
                parent: []
            },
            12378: {
                paths: [
                    appRouter.change_custom_version_status
                ],
                names: [],
                parent: []
            },
            12379: {
                paths: [],
                names: [
                    'helpdesk'
                ],
                parent: []
            },
            12381: {
                paths: [],
                names: [
                    'app-info-extended'
                ],
                parent: []
            },
            12382: {
                paths: [],
                names: [
                    'ums-manager-link'
                ],
                parent: []
            },
            12383: {
                paths: [],
                names: [
                    'video-browser-link'
                ],
                parent: []
            },
            12391: {
                paths: [],
                names: [
                    'delete-user'
                ],
                parent: []
            },
            12394: {
                paths: [],
                names: [
                    'clear-set-queue-id'
                ],
                parent: []
            },
            12392: {
                paths: [],
                names: [
                    'set-media-thumb'
                ],
                parent: []
            },
            12393: {
                paths: [],
                names: [
                    'set-version-thumb'
                ],
                parent: []
            },
            12397: {
                paths: [],
                names: [
                    'confidence-monitoring'
                ],
                parent: []
            },
            12401 : {
                paths: [],
                names: [
                    'set-series-thumb'
                ],
                parent: []
            }
        }
    }

    static getPermissionsModesMap(): any {
        return {
            ConfigOnly: {
                paths: [
                    appRouter.empty, // empty route
                    appRouter.no_access,
                    appRouter.system.config,
                ],
                names: [],
                parent: []
            }
        }
    }
}
