/**
 * Created by Sergey Trizna on 01.02.2018.
 */
import {Injectable} from "@angular/core";
import {SlickGridProvider} from "../../../providers/slick.grid.provider";
import {SlickGridConfig, SlickGridConfigModuleSetups, SlickGridConfigPluginSetups} from "../../../slick-grid.config";
import {SearchModel} from "../../../../../../models/search/common/search";
import {SlickGridPagerComp} from "../pager.comp";
import {SlickGridInfoComp} from "../info.comp";
import {SlickGridResp} from "../../../types";

@Injectable()
export class SlickGridInfoProvider {
    public compContext: SlickGridInfoComp;
    private _slickGirdProvider: SlickGridProvider;
    public total: number = 0;
    get slickGridProvider(): SlickGridProvider {
        return this._slickGirdProvider
    }

    set slickGridProvider(_context: SlickGridProvider) {
        this._slickGirdProvider = _context;
    }

    public setInfo(resp: SlickGridResp) {
        this.total = resp.Rows;
    }
}
