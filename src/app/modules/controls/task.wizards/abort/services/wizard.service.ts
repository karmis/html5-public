import {Inject, Injectable} from "@angular/core";
import { HttpService } from '../../../../../services/http/http.service';
import { CoreService } from '../../../../../core/core.service';
@Injectable()
export class TaskWizardAbortComponentService extends CoreService {
    httpService: HttpService;

    constructor(@Inject(HttpService) _httpService: HttpService) {
        super(_httpService)
    }

}
