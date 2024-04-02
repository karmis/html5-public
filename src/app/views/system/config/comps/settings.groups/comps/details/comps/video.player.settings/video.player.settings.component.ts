import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation} from "@angular/core";

@Component({
    selector: 'video-player-settings',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class VideoPlayerSettingsComponent {
    @Input('videoPlayerSettings') public videoPlayerSettings: {[key:string]: string} = {'bgColor': '#000'};
    @Output('onChangeVideoPlayerSettings') private onChangeVideoPlayerSettings: EventEmitter<any> = new EventEmitter<any>();
    onChangeColorField($event: any, field: string) {
        this.videoPlayerSettings[field] = $event.currentTarget.value;
        this.onChangeVideoPlayerSettings.emit({schema: this.videoPlayerSettings})
    }

    pickerClick($event: any, field:string) {
        this.videoPlayerSettings[field] = $event.currentTarget.value;
        this.onChangeVideoPlayerSettings.emit({schema: this.videoPlayerSettings})
    }

    onColorFocusOut($event: any, field:string) {
        this.videoPlayerSettings[field] = $event.currentTarget.value;
        this.onChangeVideoPlayerSettings.emit({schema: this.videoPlayerSettings})
    }
}
