import {
    Component,
    ViewEncapsulation,
    Output,
    EventEmitter
} from '@angular/core';
import { ThemesProvider } from '../../../../../../providers/design/themes.providers';

@Component({
    selector: 'profile-colorschemas',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class ProfileColorSchemasComponent {
    @Output() changedColorSchema: EventEmitter<any> = new EventEmitter<any>();

    constructor (private themeProvider: ThemesProvider){
    }

    private schemaChange(e){
        this.themeProvider.theme_class = e.target.value;
        this.changedColorSchema.emit(this.themeProvider.theme_class);
    }
}

