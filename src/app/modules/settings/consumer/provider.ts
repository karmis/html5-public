/**
 * Created by Sergey Trizna on 03.08.2017.
 */
import {ChangeDetectorRef, ComponentRef, Injectable} from '@angular/core';
import {
    GridStackOptions, ConsumerSettings, ConsumerSettingsDynamicWidgetItem,
    TransferdSimplifedType
} from './types';
import { Guid } from '../../../utils/imfx.guid';
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { SettingsGroupsService } from '../../../services/system.config/settings.groups.service';
import { Observable ,  Subscription } from 'rxjs';
import { ConsumerFieldsComponent } from './fields/modal.fields';
import { ConsumerSettingsTransferProvider } from './consumer.settings.transfer.provider';
import { IMFXModalPromptComponent } from '../../imfx-modal/comps/prompt/prompt';
import { IMFXModalComponent } from '../../imfx-modal/imfx-modal';
import { IMFXModalEvent } from '../../imfx-modal/types';
import { IMFXModalProvider } from '../../imfx-modal/proivders/provider';
import {lazyModules} from "../../../app.routes";

@Injectable()
export class ConsumerSettingsProvider {
    public settings: ConsumerSettings;
    public tmpSettings: ConsumerSettings;
    public moduleContext: any;
    public modalProvider: IMFXModalProvider;
    public storageService: SessionStorageService | LocalStorageService;
    public settingsStoragePrefix: string;
    public cdr: ChangeDetectorRef;
    public service: SettingsGroupsService;
    public transfer: ConsumerSettingsTransferProvider;
    private idOfLastDroppedElement: string;

    getDefaultItemSettings(): ConsumerSettings {
        return {
            'dynamicWidgets': [],
            'staticWidgets': {
                'cart': {
                    'enabled': true,
                    'x': 108,
                    'y': 0,
                    'width': 12,
                    'height': 9,
                    'minWidth': 5,
                    'minHeight': 2
                },
                'icons': {
                    'enabled': true,
                    'x': 44,
                    'y': 39,
                    'width': 39,
                    'height': 5,
                    'minWidth': 10,
                    'minHeight': 2
                },
                'ThumbUrl': {
                    'enabled': true,
                    'x': 0,
                    'y': 0,
                    'width': 39,
                    'height': 44,
                    'minWidth': 16,
                    'minHeight': 5,
                    'maxWidth': 44
                },
                'Title': {
                    'enabled': true,
                    'x': 40,
                    'y': 0,
                    'width': 65,
                    'height': 9,
                    'minWidth': 17,
                    'minHeight': 2
                },
                'SeriesTitle': {
                    'enabled': true,
                    'x': 40,
                    'y': 9,
                    'width': 80,
                    'height': 8,
                    'minWidth': 20,
                    'minHeight': 2
                },
                'Synopsis': {
                    'enabled': true,
                    'x': 40,
                    'y': 17,
                    'width': 80,
                    'height': 22,
                    'minWidth': 30,
                    'minHeight': 3
                },
                'Duration': {
                    'enabled': true,
                    'x': 83,
                    'y': 39,
                    'width': 14,
                    'height': 5,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'VersionId1': {
                    'enabled': false,
                    'x': 78,
                    'y': 45,
                    'width': 20,
                    'height': 4,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'ItemType': {
                    'enabled': false,
                    'x': 78,
                    'y': 41,
                    'width': 20,
                    'height': 4,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'SeasonTitle': {
                    'enabled': false,
                    'x': 78,
                    'y': 37,
                    'width': 20,
                    'height': 4,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'EpisodeNo': {
                    'enabled': false,
                    'x': 78,
                    'y': 33,
                    'width': 20,
                    'height': 4,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'SeasonNo': {
                    'enabled': false,
                    'x': 78,
                    'y': 29,
                    'width': 20,
                    'height': 4,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'IsHD': {
                    'enabled': true,
                    'x': 97,
                    'y': 39,
                    'width': 11,
                    'height': 5,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'moreDetails': {
                    'enabled': false,
                    'x': 102,
                    'y': 39,
                    'width': 18,
                    'height': 5,
                    'minWidth': 10,
                    'minHeight': 2
                }
            },
            'common': {'blockHeight': 259}
        };
    }

    getDefaultDetailSettings(): ConsumerSettings {
        return {
            'dynamicWidgets': [],
            'staticWidgets': {
                'ThumbUrl': {
                    'enabled': false,
                    'x': 0,
                    'y': 0,
                    'width': 30,
                    'height': 13,
                    'minWidth': 20,
                    'minHeight': 10,
                    'maxWidth': 30
                },
                'Title': {
                    'enabled': true,
                    'x': 0,
                    'y': 0,
                    'width': 30,
                    'height': 6,
                    'minWidth': 12,
                    'minHeight': 2
                },
                'SeriesTitle': {
                    'enabled': true,
                    'x': 0,
                    'y': 6,
                    'width': 30,
                    'height': 11,
                    'minWidth': 15,
                    'minHeight': 2
                },
                'Synopsis': {
                    'enabled': true,
                    'x': 0,
                    'y': 17,
                    'width': 30,
                    'height': 61,
                    'minWidth': 30,
                    'minHeight': 3
                },
                'Duration': {
                    'enabled': true,
                    'x': 18,
                    'y': 86,
                    'width': 12,
                    'height': 8,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'icons': {
                    'enabled': true,
                    'x': 0,
                    'y': 86,
                    'width': 18,
                    'height': 8,
                    'minWidth': 10,
                    'minHeight': 2
                },
                'cart': {
                    'enabled': true,
                    'x': 0,
                    'y': 94,
                    'width': 30,
                    'height': 13,
                    'minWidth': 5,
                    'minHeight': 2
                },
                'VersionId1': {
                    'enabled': false,
                    'x': 78,
                    'y': 45,
                    'width': 20,
                    'height': 4,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'ItemType': {
                    'enabled': false,
                    'x': 78,
                    'y': 41,
                    'width': 20,
                    'height': 4,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'SeasonTitle': {
                    'enabled': false,
                    'x': 78,
                    'y': 37,
                    'width': 20,
                    'height': 4,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'EpisodeNo': {
                    'enabled': false,
                    'x': 78,
                    'y': 33,
                    'width': 20,
                    'height': 4,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'SeasonNo': {
                    'enabled': false,
                    'x': 78,
                    'y': 29,
                    'width': 20,
                    'height': 4,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'IsHD': {
                    'enabled': true,
                    'x': 97,
                    'y': 39,
                    'width': 11,
                    'height': 5,
                    'minWidth': 11,
                    'minHeight': 2
                },
                'moreDetails': {
                    'enabled': true,
                    'x': 0,
                    'y': 78,
                    'width': 30,
                    'height': 8,
                    'minWidth': 10,
                    'minHeight': 2
                },
                'moreDetail': {
                    'enabled': true,
                    'x': 108,
                    'y': 39,
                    'width': 12,
                    'height': 5,
                    'minWidth': 10,
                    'minHeight': 2
                },
                'toDetail': {
                    'enabled': true,
                    'x': 108,
                    'y': 39,
                    'width': 12,
                    'height': 5,
                    'minWidth': 10,
                    'minHeight': 2
                }
            },
            'common': {'blockHeight': 637}
        };
    }

    getDefaultSettings(type: 'item' | 'detail' = 'item'): ConsumerSettings {
        let res: ConsumerSettings;
        if (type === 'item') {
            res = this.getDefaultItemSettings();
        } else {
            res = this.getDefaultDetailSettings();
        }
        return res;
    }

    // TODO: use method from array provider
    getIndexArrayByProperty(customId, arr, prop) {
        let index = null;
        $.each(arr, (k, o) => {
            if (o && o[prop] === customId) {
                index = k;
                return false;
            }
        });

        return index;
    }

    getStylesForWidget(customId, widgetType: 'staticWidgets' | 'dynamicWidgets' = 'staticWidgets') {
        let resp = {};
        if (widgetType === 'dynamicWidgets') {
            customId = this.getIndexArrayByProperty(customId, this.settings[widgetType], 'id');
        }

        if (customId != null && this.settings[widgetType][customId]) {
            resp = {
                'width': this.getWidthForWidget(customId, widgetType),
                'left': this.settings[widgetType][customId].x * 0.83333 + '%',
                'top': 6 * this.settings[widgetType][customId].y + 'px',
                'height': this.getHeightForWidget(customId, widgetType)
            };
        }

        return resp;
    }

    getHeightForWidget(customId, widgetType) {
        return ((this.settings[widgetType][customId].height * 6) - 6) + 'px';
    }

    getWidthForWidget(customId, widgetType) {
        return this.settings[widgetType][customId].width * 0.83333 + '%';
    }

    getGridStackOptions(): GridStackOptions {
        return {
            float: false,
            animate: false,
            cellHeight: 1,
            verticalMargin: 5,
            // height: 50,
            staticGrid: false,
            // removable: '#trash',
            removable: true,
            removeTimeout: 100,
            acceptWidgets: false
        };
    }

    /**
     * Open builder mode
     */
    open() {
        this.tmpSettings = $.extend(true, this.tmpSettings, this.settings);
        this.moduleContext.builderMode = true;
        setTimeout(() => {
            let self = this;
            $.each(this.settings.staticWidgets, (k, w) => {
                if (!w.enabled) {
                    self.deleteWidget(k);
                }
            });
            $.each(this.settings.dynamicWidgets, (k, dw) => {
                self.addDynamicWidget(dw);
            });
            this.bindJQEvents();
            this.updateBlockHeight();
        });
    }

    /**
     * Save and close builder mode
     */
    save(settingsGroupId) {
        this.moduleContext.gridStack.savePanel().subscribe((items) => {
            this.applyAndStoreSettings(this.tmpSettings);
            this.service.clearSettingsGroupById(settingsGroupId);

            this.transfer.updated.emit(<TransferdSimplifedType>{
                setupType: 'consumer' + '.' + this.moduleContext.type,
                groupId: this.moduleContext.settingsGroupId,
                setups: this.settings
            });

            this.moduleContext.builderMode = false;
            this.cdr.detectChanges();
        });
    }

    /**
     * Reset to default positions and sizes for widgets
     * @param type
     */
    reset(type, newSetups?: ConsumerSettings) {
        let defaultSettings = this.getDefaultSettings(type);
        if (newSetups) {
            defaultSettings = $.extend(true, this.getDefaultSettings(type), newSetups);
        }
        this.storageService.store(this.settingsStoragePrefix, defaultSettings);
        let grid = this.getGridStackObject();
        // Clear old elements
        $.each(this.tmpSettings.dynamicWidgets, (k, dw) => {
            if (dw && dw.id) {
                this.deleteDynamicWidget(dw.id);
            }
        });

        grid.removeAll(false);

        // /*debugger*/;


        $.each(defaultSettings.staticWidgets, (k, sw) => {
            if (defaultSettings.staticWidgets[k].enabled) {
                let el = this.getElementById(k);
                grid.makeWidget(el);
                grid.movable(el, true);
                grid.resizable(el, true);
                grid.update(el, sw.x, sw.y, sw.width, sw.height);
                el.show();
            }
        });

        this.tmpSettings = $.extend(true, this.tmpSettings, defaultSettings);
        // this.tmpSettings.dynamicWidgets = [];
        this.applyAndStoreSettings(this.tmpSettings);
        let self = this;
        setTimeout(() => {
            setTimeout(() => {
                $.each(defaultSettings.dynamicWidgets, (k, dw) => {
                    // /*debugger*/
                    if (dw && dw.id) {
                        let el = self.getElementById(dw.id);
                        self.addDynamicWidget(dw);
                    }
                });
                self.bindJQEvents();
            }, 100);
        }, 100);
    }

    /**
     * Apply new setups (like setSetups)
     * @param type
     * @param newSetups
     */
    setSetups(type, newSetups: ConsumerSettings) {
        this.reset(type, newSetups);
    }

    /**
     * Add label
     * System -> Group Settings -> Some Item  -> Details Layout -> Edit -> Add Item
     */
    addLabel() {
        if (!this.tmpSettings.dynamicWidgets) {
            this.tmpSettings.dynamicWidgets = [];
        }
        let el = $('#widget-tpl-label').clone().show();
        let grid = this.getGridStackObject();

        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.imfx_modal_prompt,
            IMFXModalPromptComponent, {
            size: 'md',
            title: 'Set Label',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then(cr => {
            let modalContent: IMFXModalPromptComponent = cr.instance;
            modalContent.setLabel('Label:');
            modalContent.setPlaceholder('Label:');
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    // generating label widget
                    let label = modalContent.getValue();
                    el.find('div.label-value').text(label);
                    let id = 'dynamic-label-' + Guid.newGuid();
                    el.attr('data-custom-id', id);
                    el.attr('id', id);

                    // storing label widget
                    let labelWidget: ConsumerSettingsDynamicWidgetItem = {
                        id: id,
                        value: label,
                        enabled: true,
                        x: 0,
                        y: 0,
                        width: 10,
                        height: 4,
                        minWidth: 3,
                        // maxWidth: 30,
                        minHeight: 2,
                        // maxHeight: 4
                    };
                    modal.hide();

                    this.tmpSettings.dynamicWidgets.push(labelWidget);

                    // creating dynamic widget
                    grid.addWidget(el, 0, 0, 10, 4, true, 3, 30, 2, 4, id);

                    this.applyAndStoreSettings(this.tmpSettings);
                    setTimeout(() => {
                        this.bindJQEvents();
                    });
                }
            });
        });
    }

    /**
     * Delete dynamic widget by customid
     * @param customid
     */
    deleteDynamicWidget(customid) {
        let grid = this.getGridStackObject();
        $.each(this.tmpSettings.dynamicWidgets, (k, o) => {
            if (o.id === customid) {
                let el = this.getElementById(customid);
                el.hide();
                if (el && el.data('_gridstack_node')) {
                    grid.removeWidget(el, true);
                }

                this.tmpSettings.dynamicWidgets.splice(k, 1);
                // let grid = this.getGridStackObject();
                // let el = this.getElementById(customid);
                // el.hide();
                // if (el.data('_gridstack_node')) {
                //     grid.removeWidget(el, false);
                //
                // }
                // $('[data-custom-id=''+customid+'']').remove();
                return false;
            }
        });

        this.applyAndStoreSettings(this.tmpSettings);
    }

    /**
     * Get actual settings for widgets
     * @returns {ConsumerSettings}
     */
    getSettings(): ConsumerSettings {
        $.extend(true, {}, this.settings, this.tmpSettings);
        this.settings.dynamicWidgets = this.tmpSettings.dynamicWidgets;

        return this.settings;
    }

    /**
     * Get list of available fields (widgets)
     * @returns {any}
     */
    getFields(): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.service.getFieldsForConsumer().subscribe((fields: any) => {
                let allFields = fields.ViewColumns;
                // delete allFields['IsHD'] = {BindingName: 'IsHD', TemplateName: 'IsHD'};
                allFields['icons'] = {BindingName: 'icons', TemplateName: 'Icons'};
                allFields['cart'] = {BindingName: 'cart', TemplateName: 'Basket'};
                allFields['moreDetails'] = {
                    BindingName: 'moreDetails',
                    TemplateName: 'More Details'
                };
                if (this.moduleContext.type === 'detail') {
                    delete allFields['ThumbUrl'];
                } else {
                    allFields['ThumbUrl'] = {BindingName: 'ThumbUrl', TemplateName: 'Thumbnail'};
                }
                observer.next(allFields);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    private fieldsModal;
    openListOfFiledsModal() {
        this.fieldsModal = this.moduleContext.modalProvider.showByPath(lazyModules.consumer_fields_modal, ConsumerFieldsComponent, {
            size: 'sm',
            title: 'consumer.field_setup',
            top: '47%',
            isFooter: false,
            height: '70vh',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {compContext: this});

        this.fieldsModal.load().then((cr: ComponentRef<ConsumerFieldsComponent>) => {

        })
    }

    private updateBlockHeight() {
        this.tmpSettings.common['blockHeight'] = $(this.moduleContext.gridStack.el.nativeElement)
                                                 .find('div.grid-stack').height();
    }

    private bindJQEvents(context = null) {
        let self = this;

        $(self.moduleContext.gridStack.el.nativeElement).on('change', function (event, items) {
            self.onChangeWidget(items);
        });

        $(self.moduleContext.gridStack.el.nativeElement).on('removed', function (event, items) {
            if (self.idOfLastDroppedElement) {
                if (self.idOfLastDroppedElement.split('-')[0] === 'dynamic') {
                    self.deleteDynamicWidget(self.idOfLastDroppedElement);
                } else {
                    self.deleteWidget(self.idOfLastDroppedElement);
                }

                self.idOfLastDroppedElement = null;
            }
        });

        $(self.moduleContext.gridStack.el.nativeElement).on('dragstop', function (event, ui) {
            self.idOfLastDroppedElement = $(event.target).attr('id');
        });
    }

    private addDynamicWidget(dw) {
        let grid = this.getGridStackObject();
        let dynType = dw.id.split('-')[1];
        if (dynType === 'label') {
            let el = $('#widget-tpl-label').clone().show();
            el.find('div.label-value').html(dw.value);
            el.attr('data-custom-id', dw.id);
            el.attr('id', dw.id);
            grid.addWidget(
                el,
                dw.x,
                dw.y,
                dw.width,
                dw.height,
                false,
                dw.minWidth,
                dw.maxWidth,
                dw.minHeight,
                dw.maxHeight,
                dw.id
            );
        }
    }

    private deleteWidget(customid) {
        this.tmpSettings.staticWidgets[customid].enabled = false;
        this.settings.staticWidgets[customid].enabled = false;
        let grid = this.getGridStackObject();
        let el = this.getElementById(customid);
        el.hide();
        if (el.data('_gridstack_node')) {
            grid.removeWidget(el, false);
        }
    }

    private getGridStackObject() {
        return $(this.moduleContext.gridStack.el.nativeElement)
                .find('.grid-stack').data('gridstack');
    }

    private onChangeWidget(items) {
        let self = this;
        let staticWidgets = {};
        let dynamicWidgets = [];
        $.each(items, (key, item) => {
            let customId = $(item.el).data('customId');
            if (!customId) {
                return true;
            }
            let m = {
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
            };

            if (customId.split('-')[0] === 'dynamic') {
                let ind = this.getIndexArrayByProperty(
                    customId,
                    this.tmpSettings.dynamicWidgets,
                    'id'
                );

                dynamicWidgets[ind] = m;
            } else {
                staticWidgets[customId] = m;
            }
        });

        this.tmpSettings.staticWidgets = $.extend(
            true,
            this.tmpSettings.staticWidgets,
            staticWidgets
        );
        $.each(dynamicWidgets, (k, dw) => {
            if (dw) {
                this.tmpSettings.dynamicWidgets[k] = $.extend(
                    true,
                    {},
                    self.tmpSettings.dynamicWidgets[k],
                    dw
                );
            }
        });

        this.applyAndStoreSettings(this.tmpSettings);
    }

    private getElementById(id) {
        return $(this.moduleContext.gridStack.el.nativeElement).find('[data-custom-id=' + id + ']');
    }

    private applyAndStoreSettings(settings: ConsumerSettings) {
        this.settings = $.extend(true, {}, this.settings, settings);
        this.settings.dynamicWidgets = settings.dynamicWidgets;
        this.updateBlockHeight();
        this.moduleContext.settings = this.settings;
        this.cdr.detectChanges();
        this.moduleContext.onSave.emit(this.settings);
    }
}
