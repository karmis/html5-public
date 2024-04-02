import { Injectable } from '@angular/core';

@Injectable()
export class AppSettings {
    private contributorThumb = './assets/img/contributor.jpg';

    // tslint:disable-next-line:no-empty
    constructor(){
    }
    public getContributorThumb(){
        return this.contributorThumb;
    }
}
