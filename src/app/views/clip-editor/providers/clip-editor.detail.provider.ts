import { DetailProvider } from "../../../modules/search/detail/providers/detail.provider";
import { SlickGridRowData } from "../../../modules/search/slick-grid/types";
import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class ClipEditorDetailProvider extends DetailProvider {

    removeIdFromUrl(id: string) {
        let urlArray = window.location.hash.split('/');
        let newUrl = '';
        let idsArray = []
        if (urlArray.length === 4) {
            idsArray = urlArray.splice(-1)[0].split(',');
                newUrl = urlArray.join('/') + '/';
        }

        idsArray = idsArray.filter(idUrl => idUrl != id)
        newUrl = newUrl + idsArray.join(',')

        window.history.replaceState({}, '',newUrl);
    }

    addIdInUrl(items: SlickGridRowData[]) {
        let urlArray = window.location.hash.split('/');
        let newUrl = '';
        let idsArray = []
        if (urlArray.length === 4) {
            idsArray = urlArray.splice(-1)[0].split(',');
            newUrl = urlArray.join('/') + '/';
        }

        // idsArray = idsArray.filter(idUrl => idUrl != id)
        idsArray = [
            ...idsArray,
            ...items.map(el => String(el.ID))
            ];
        idsArray = this.arrayUnique(idsArray);
       // const newUrl = window.location.hash + ',' + items.map(el => el.ID).join(',');
        newUrl = newUrl + idsArray.join(',')
        window.history.replaceState({}, '',newUrl);
    }

    private arrayUnique(array) {
        var a = array.concat();
        for(var i=0; i<a.length; ++i) {
            for(var j=i+1; j<a.length; ++j) {
                if(a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
        return a;
    }
}
