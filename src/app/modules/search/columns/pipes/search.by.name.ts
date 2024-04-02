import {Injector, Pipe, PipeTransform} from '@angular/core';
import {SlickGridProvider} from "../../slick-grid/providers/slick.grid.provider";

@Pipe({name: 'byName'})
export class SearchByName implements PipeTransform {
    constructor(private injector: Injector){}
    transform(value, args: string[]): any {
        let keys = [];
        try {
            // if no SlickGridProvider - will exception else  we think that it new grid
            let pr = this.injector.get(SlickGridProvider);
            for (let key in value) {
                if (!args[0] || (value[key].name.toLowerCase().indexOf(args[0].toLowerCase()) != -1)){
                    keys.push(value[key]);
                }
            };
        } catch (e){
            for (let key in value) {
                if (!args[0] || (value[key].name.toLowerCase().indexOf(args[0].toLowerCase()) != -1)){
                    keys.push(value[key]);
                }
            }
        } finally {}

        return keys;
    }
}
