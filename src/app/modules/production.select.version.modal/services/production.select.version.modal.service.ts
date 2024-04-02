import { Inject, Injectable } from '@angular/core';
import { HttpService } from '../../../services/http/http.service';
import { map } from 'rxjs/operators';

@Injectable()
export class ProductionSelectVersionModalService {


    constructor(private httpService: HttpService) {
    }

    checkVersion(id) {
        return this.httpService.post( '/api/v3/production/version/' + id, {
            "ExtendedColumns": []
        }).pipe(map((res: any) => {
            return res.body;
        })
        )
    }
}
