/**
 * Created by Sergey Trizna on 11.10.2017.
 */
import {Injectable} from "@angular/core";
@Injectable()
export class DownloadService {
    public downloadFile(data: any, type) {
        let blob = new Blob([data], {type: type});
        let url = window.URL.createObjectURL(blob);
        window.open(url);
    }
}

