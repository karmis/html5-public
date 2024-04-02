import {HttpService} from "../../../../services/http/http.service";
import {Injectable} from "@angular/core";
import {Observable,  Subscription } from "rxjs";
import { map } from 'rxjs/operators';
import {HttpResponse} from "@angular/common/http";
import {UploadResponseModel} from "../../../upload/types";
import {UploadServiceErrorResponse} from "../../../upload/services/interface.upload.service";

@Injectable()
export class HTMLPlayerService {
    constructor(private httpService: HttpService) {
    }
    public getPresignedUrl(id: number): Observable<Subscription> {
        return this.httpService.get('/api/v3/video/presigned-url/' + id)
            .pipe(map((res:any) => res.body));
    }

    public saveAsNewThumbnail(type : 'version' | 'media' | 'title', id, data) {
        return this.httpService.post(
            '/api/v3/' + type + '/' + id + '/thumbnail',
            {
                "ImageData": data
            });
    }
}
