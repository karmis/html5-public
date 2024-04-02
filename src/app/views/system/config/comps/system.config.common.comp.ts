import {IMFXControlsTreeComponent} from "../../../../modules/controls/tree/imfx.tree";

export class SystemConfigCommonComp {
    allActive = false;
    initialData;
    templatesList = [];
    templatesListFiltered = [];
    layoutList = [];
    fieldsList = [];
    templateConfigTypes = null;
    allFields = [];
    allFieldsLookup = {};
    tabsList = [];
    activeTabsList = [];
    groupId = 1;
    activeView = 1;
    selectedTemplate = null;
    selectedTemplateType = null;
    itemForEdit: any = {};

    isNew = true;

    toggleAll(state) {
        state ? this.allActive = true : this.allActive = false;
        this.activeTabsList = [];
        for (let i = 0; i < this.tabsList.length; i++) {
            if (state) {
                this.tabsList[i].Active = true;
                this.activeTabsList.push(this.tabsList[i].Id);
            } else {
                this.tabsList[i].Active = false;
            }
        }
    }

    changeTabState(state, item) {
        state ? item.Active = true : item.Active = false;
        if (state) {
            this.activeTabsList.push(item.Id);
        } else {
            this.activeTabsList.splice(this.activeTabsList.indexOf(item.Id), 1);
        }
        if (this.activeTabsList.length != this.tabsList.length) {
            this.allActive = false;
        } else {
            this.allActive = true;
        }
    }

    filterTree($event, treeComp: IMFXControlsTreeComponent) {
        var filterStr = $event ? $event.target.value : "";
        treeComp.filterCallback(filterStr, function (str, node) {
            if (node.title != null) {
                let normTitle = str.toLowerCase();
                let normNodeTitle = node.title.toLowerCase();
                return (normNodeTitle.indexOf(normTitle) !== -1);
            }

            return false;
        });
    }
}
