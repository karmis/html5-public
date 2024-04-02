import { TreeStandardConvertParamsType, TreeStandardItemType, TreeStandardListTypes } from '../types';

export class IMFXControlTreeProvider {
    private standartObject = {
        key: "",
        title: "",
        folder: false,
        children: [],
        dirtyObj: {},
        selected: false,
        active: false,
        lazy: false,
    };

    onDragLeave(event, externalCompReference: any) {
        console.log('onDragLeave');
    }

    onDrop(event, externalCompReference: any) {
        console.log('onDrop');
    }

    onDragEnter(event, externalCompReference: any) {
        console.log('onDragEnter');
    }

    onDragOver(event, externalCompReference: any) {
        console.log('onDragOver');
    }

    public turnArrayOfObjectToStandart(arr = [], comp: TreeStandardConvertParamsType = {
        key: 'id',
        title: 'text',
        children: 'children'
    }): TreeStandardListTypes {
        let res = [];
        let self = this;
        arr.forEach((dirtyObj) => {
            res.push(this.turnObjectToStandart(dirtyObj, comp));
        });

        return res;
    }

    public turnObjectToStandart(dirtyObj, comp: TreeStandardConvertParamsType = {
        key: 'id',
        title: 'text',
        children: 'children',
        selected: 'selected',
        active: 'active',
        additionalData: ''
    }): TreeStandardItemType {
        let obj = Object.assign({}, this.standartObject);
        obj.key = dirtyObj[comp.key];
        obj.title = dirtyObj[comp.title] == null ? "" : dirtyObj[comp.title];
        if (dirtyObj[comp.children] && dirtyObj[comp.children].length > 0) {
            obj.children = this.turnArrayOfObjectToStandart(dirtyObj[comp.children], comp);
        } else {
            delete obj.children;
        }
        if (dirtyObj[comp.selected]) {
            obj.selected = dirtyObj[comp.selected];
        }
        if (dirtyObj[comp.active]) {
            obj.active = dirtyObj[comp.active];
        }
        (obj as any).checked = true

        if (typeof comp.lazy == 'boolean') {
            obj.lazy = comp.lazy;
        } else {
            if (dirtyObj[comp.lazy]) {
                obj.lazy = dirtyObj[comp.lazy] === true || dirtyObj[comp.lazy] > 0;
            }
        }


        obj.folder = !!obj.children;
        // obj.additionalData = comp.additionalData?dirtyObj[comp.additionalData]:{};
        obj.dirtyObj = dirtyObj;

        return obj;
    }

}
