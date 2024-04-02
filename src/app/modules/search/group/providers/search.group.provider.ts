import { EventEmitter, Injectable } from '@angular/core';
import { IMFXControlsTreeComponent } from '../../../controls/tree/imfx.tree';
import {
    SearchGroupComponent,
    SearchGroupItem,
    SearchGroupOnClickByRow,
    SearchGroupOnGroupClickType
} from '../search.group.component';
import { AdvancedSearchModel } from '../../../../models/search/common/advanced.search';

@Injectable({providedIn: 'root'})
export class SearchGroupProvider {
    moduleContext:SearchGroupComponent;
    clickByRow: EventEmitter<SearchGroupOnClickByRow> = new EventEmitter<SearchGroupOnClickByRow>();
    clickByCollection: EventEmitter<number> = new EventEmitter<number>();

    public searchResultList: {}|any = null;
    public tree: IMFXControlsTreeComponent;
    public searchResultGroups: SearchGroupItem[] = [];
    public selectedGroupId: number = null;

    public getAdvancedModel() {
        const groupCrit = new AdvancedSearchModel();
        // groupCrit.setDBField('GROUP_IDS');
        // groupCrit.setField('Groups Ids');
        // groupCrit.setOperation('=');
        // groupCrit.setHumanValue(this.selectedGroupId);
        // groupCrit.setValue(this.selectedGroupId);
        // groupCrit.setGroupId(9999);

        return groupCrit;
    }
}
