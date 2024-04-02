import {ViewType} from "../search/views/types";
import {FinalSearchRequestType} from "../search/slick-grid/types";

export type ExportModelType = FinalSearchRequestType & {
    ExportType: string,
    SearchType: string,
    View: ViewType
}
