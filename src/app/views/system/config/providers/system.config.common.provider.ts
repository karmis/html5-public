import {Injectable} from "@angular/core";

@Injectable()
export class SystemConfigCommonProvider {

    removeFieldGroup(fields, layouts, item, compare) {
        if (item.children && item.children.length > 0) {
            for (var i = 0; i < item.children.length; i++) {
                fields.push(item.children[i]);
                fields.sort(compare);
            }
        }

        for (let j = 0; j < layouts.length; j++) {
            if (layouts[j].data.GroupID == item.data.GroupID) {
                layouts.splice(j, 1);
                return;
            }
        }
    }

}
