/**
 * Created by Sergey Trizna on 03.08.2017.
 */
import {Injectable} from "@angular/core";
import {ConsumerSettingsProvider} from "../../provider";

@Injectable()
export class ConsumerItemSettingsProvider extends ConsumerSettingsProvider {
    public settings = this.getDefaultSettings('item');
}
