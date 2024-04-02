import { Injectable } from "@angular/core";
import { HttpService } from "../../../services/http/http.service";
import { SessionStorageService } from "ngx-webstorage";
import { SlickGridProvider } from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import { Observable } from "rxjs";
import { HttpResponse } from "@angular/common/http";
import { SearchModel } from "../../../models/search/common/search";

@Injectable()
export class RecordingLinesService {
    constructor(public httpService: HttpService,
                public sessionStorage: SessionStorageService) {
    }

    getRowsById(id: number,
                extColumns: string[] = [],
                provider: SlickGridProvider = null
    ): Observable<HttpResponse<any>> {
        return new Observable(() => {
            const searchModel = new SearchModel();
            if (provider) {
                provider.lastSearchModel = searchModel;
            }
        });
    }
}

