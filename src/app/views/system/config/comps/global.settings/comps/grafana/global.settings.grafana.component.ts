import {
  ChangeDetectorRef, Component, OnInit, ViewEncapsulation, ViewChild
} from '@angular/core';
import {
  SettingsGroupsService
} from '../../../../../../../services/system.config/settings.groups.service';
import {
  NotificationService
} from '../../../../../../../modules/notification/services/notification.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';
import { ThemesProvider } from '../../../../../../../providers/design/themes.providers';
import { IMFXModalComponent } from '../../../../../../../modules/imfx-modal/imfx-modal';
import { IMFXModalAlertComponent } from '../../../../../../../modules/imfx-modal/comps/alert/alert';
import { IMFXModalProvider } from '../../../../../../../modules/imfx-modal/proivders/provider';
import { IMFXModalEvent } from '../../../../../../../modules/imfx-modal/types';
import { lazyModules } from "../../../../../../../app.routes";

@Component({
  selector: 'global-settings-grafana',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  entryComponents: [],
  encapsulation: ViewEncapsulation.None,
  providers: [
    SettingsGroupsService,
    ThemesProvider
  ]
})

export class GlobalSettingsGrafanaComponent implements OnInit {

  @ViewChild('grafanaWrapper', {static: false}) private grafanaWrapper;
  private addReady = true;
  private activeUpdate;
  private data;
  private grafanaData: GrafanaData = {EmbedData: '', FriendlyName: '', ResultUrl: null};
  private grafanaDataArray: Array<GrafanaData> = [];

  constructor(private cdr: ChangeDetectorRef,
              private settingsGroupsService: SettingsGroupsService,
              private themesProvider: ThemesProvider,
              protected modalProvider: IMFXModalProvider,
              private notificationRef: NotificationService) {
  };

  ngOnInit() {
    this.initGrafanaItems();
  }

  getSetting(key) {
    if (this.data.TM_SETTINGS_KEYS) {
      return this.data.TM_SETTINGS_KEYS.filter(el  => el.KEY === key)[0];
    }
  }

  initGrafanaItems() {
    let self = this;
    this.settingsGroupsService.getSettingsGroupById(0).subscribe((res: any) => {
      if (res) {
        self.data = {
          'ID': res.ID,
          'NAME': res.NAME,
          'DESCRIPTION': res.DESCRIPTION,
          'TM_SETTINGS_KEYS': res.TM_SETTINGS_KEYS.map(el => {
            el.EntityKey = null;
            el.TM_SETTINGS_GROUPS = null;
            el.TM_SETTINGS_GROUPSReference = null;
            return el;
          }),
        "VISUAL_ASSETS_GROUP_ID": res.VISUAL_ASSETS_GROUP_ID
        };
        let grafanaSettings = self.getSetting('grafana');
        if (grafanaSettings) {
          self.grafanaDataArray = <Array<GrafanaData>>JSON.parse(grafanaSettings.DATA);
        }
      }
    });
  }

  getTargetUrl(iframe) {
    let pattern = /src=['"](.*?)['"]/; // finds the whole url
    let match = pattern.exec(iframe);
    if(match && match.length > 0)
        return match[1];

    return null;
  }

  toggleAdd(state) {
    this.addReady = state;
    if (state) {
      this.grafanaData.FriendlyName = '';
      this.grafanaData.EmbedData = '';
      this.grafanaData.ResultUrl = null;
    }
  }

  toggleUpdate(i, state) {
    if (!state) {
      this.activeUpdate = i;
    } else {
      this.activeUpdate = -1;
      $('#g-update-input-' + i).val(this.grafanaDataArray[i].FriendlyName.trim());
      $('#g-update-textarea-' + i).val(this.grafanaDataArray[i].EmbedData.trim());
    }

  }

  addGrafanaPanel() {
    let self = this;
    if (this.grafanaData.FriendlyName.trim().length > 0
    && this.grafanaData.EmbedData.trim().length > 0 ) {
      this.grafanaData.ResultUrl = this.getTargetUrl(this.grafanaData.EmbedData.trim());
      if(this.grafanaData.ResultUrl == null) {
          self.notificationRef.notifyShow(2, 'global_settings.error_incorrect_format');
          return;
      }
      let _tmp: GrafanaData = {EmbedData: '', FriendlyName: '', ResultUrl: null};
      _tmp.EmbedData = this.grafanaData.EmbedData.trim();
      _tmp.ResultUrl = this.grafanaData.ResultUrl;
      _tmp.FriendlyName = this.grafanaData.FriendlyName.trim();
      this.grafanaDataArray.push(_tmp);
      this.cdr.detectChanges();
      /*debugger*/;
      if (this.getSetting('grafana')) {
        this.data.TM_SETTINGS_KEYS.filter(el => el.KEY === 'grafana')[0]
        .DATA = JSON.stringify(this.grafanaDataArray);
      } else {
        this.data.TM_SETTINGS_KEYS.push({
          'KEY': 'grafana',
          'DATA': JSON.stringify([this.grafanaData]),
        });
      }
      this.settingsGroupsService.saveSettingsGroup(this.data).subscribe((res: any) => {
        self.notificationRef.notifyShow(1, 'global_settings.save_success');
        self.toggleAdd(true);
        self.settingsGroupsService.saveSessionStorage(0, res);
      });
    } else {
      if (this.grafanaData.FriendlyName.trim().length === 0) {
        self.notificationRef.notifyShow(2, 'global_settings.error_empty_fn');
      } else {
        self.notificationRef.notifyShow(2, 'global_settings.error_empty_em');
      }
    }
  }

  deleteGrafanaPanel(i) {
    let self = this;
    let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
        IMFXModalAlertComponent, {
      size: 'md',
      title: 'modal.titles.confirm',
      position: 'center',
      footer: 'cancel|ok'
    });
      modal.load().then(cr => {
          let modalContent: IMFXModalAlertComponent = cr.instance;
          modalContent.setText(
              'global_settings.modal_remove_conformation',
              {friendlyName: self.grafanaDataArray[i].FriendlyName}
          );
          modal.modalEvents.subscribe((e: IMFXModalEvent) => {
              if (e.name === 'ok') {
                  self.grafanaDataArray.splice(i, 1);
                  self.data.TM_SETTINGS_KEYS.filter(el => el.KEY === 'grafana')[0]
                      .DATA = JSON.stringify(self.grafanaDataArray);
                  self.settingsGroupsService.saveSettingsGroup(self.data).subscribe((res: any) => {
                      self.notificationRef.notifyShow(1, 'global_settings.remove_success');
                      self.settingsGroupsService.saveSessionStorage(0, res);
                  });
                  modal.hide();
              } else if (e.name === 'hide') {
                  modal.hide();
              }
          });
      });
  }

  updateGrafanaPanel(i) {
    let friendly = $('#g-update-input-' + i).val().trim();
    let embed = $('#g-update-textarea-' + i).val().trim();
    let self = this;
    if (friendly.trim().length > 0 && embed.trim().length > 0) {
      this.grafanaDataArray[i].FriendlyName = friendly;
      this.grafanaDataArray[i].EmbedData = embed;
      this.grafanaDataArray[i].ResultUrl = this.getTargetUrl(embed);
      this.data.TM_SETTINGS_KEYS.filter(el => el.KEY === 'grafana')[0]
      .DATA = JSON.stringify(self.grafanaDataArray);
      this.settingsGroupsService.saveSettingsGroup(self.data).subscribe((res: any) => {
        self.notificationRef.notifyShow(1, 'global_settings.save_success');
        self.toggleUpdate(i, true);
        self.settingsGroupsService.saveSessionStorage(0, res);
      });
    } else {
      if (friendly.trim().length === 0) {
        this.notificationRef.notifyShow(2, 'global_settings.error_empty_fn');
      } else {
        this.notificationRef.notifyShow(2, 'global_settings.error_empty_em');
      }
    }
  }
}

export class GrafanaData {
  public FriendlyName: string = '';
  public EmbedData: string = '';
  public ResultUrl: SafeResourceUrl = null;
}
