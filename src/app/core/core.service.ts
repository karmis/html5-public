/**
 * Created by Sergey Trizna on 27.11.2017.
 */
import {HttpService} from "../services/http/http.service";

export class CoreService {
    protected httpService: HttpService;

    constructor(/*@Inject(HttpService)*/ _httpService: HttpService) {
        this.httpService = _httpService;
    }
}
