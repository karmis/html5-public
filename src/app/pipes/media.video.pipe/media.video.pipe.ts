import {Pipe, PipeTransform} from '@angular/core';
import {HttpService} from "../../services/http/http.service";

@Pipe({name: 'mediaVideoPipe', pure: true})
export class MediaVideoPipe implements PipeTransform {
    constructor(private httpService: HttpService) {
    }

    transform(res: any): any {
        const resp = res.body;
        if (resp.Smudge) {
            resp.Smudge.Url = this.httpService.getBaseUrl() + resp.Smudge.Url;
        }
        if (resp.Scene) {
            resp.Scene.Url = this.httpService.getBaseUrl() + resp.Scene.Url;
        }
        if (resp.AudioWaveform) {
            resp.AudioWaveform.Url = this.httpService.getBaseUrl() + resp.AudioWaveform.Url;
        }
        return resp;
    }
}
