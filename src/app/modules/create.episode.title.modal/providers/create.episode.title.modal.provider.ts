import { Injectable } from '@angular/core';
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CreateEpisodeTitleModalProvider {
    addedTitleSub: Subject<string> = new Subject<string>()
}
