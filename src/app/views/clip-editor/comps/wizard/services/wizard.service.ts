import {Inject, Injectable} from "@angular/core";
import {HttpService} from "../../../../../services/http/http.service";
@Injectable()
export class MediaWizardService {
    httpService;

    constructor(@Inject(HttpService) _httpService: HttpService) {
        this.httpService = _httpService;
    }
}
