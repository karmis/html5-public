import { Inject, Injectable } from '@angular/core';
import { HttpService } from '../../../services/http/http.service';

@Injectable()
export class ChooseItemModalService {
    httpService;

    constructor(@Inject(HttpService) _httpService: HttpService) {
        this.httpService = _httpService;
    }
}
