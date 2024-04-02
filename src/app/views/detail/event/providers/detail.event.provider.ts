import {Injectable} from "@angular/core";
import * as moment from "moment";
@Injectable()
export class DetailEventProvider {
    calcDuration(startTime, endTime) {
        let duration = 0;
        if (startTime !== null && endTime !== null) {
            let start = moment(startTime, "YYYY-MM-DDTHH:mm:ss");
            let end = moment(endTime, "YYYY-MM-DDTHH:mm:ss");
            duration = end.diff(start) / 1000 / 60; // in minutes
        } else {
            duration = null;
        }

        return duration;
    }
}
