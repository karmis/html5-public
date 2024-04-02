import {AbstractPlayerProvider} from "./abstract.player.provider";
import {Injectable} from "@angular/core";
@Injectable()

export class LanguagesProvider extends AbstractPlayerProvider {

    constructor() {
        super();
    }

    addLanguage(vjs) {
        vjs.addLanguage('en', {
            "Subtitles": "Timed Text",
            "subtitles off": "Timed Text Off",
            "Captions": "Timed Text",
            "captions off": "Timed Text Off"
        });
        vjs.addLanguage('ru', {
            "Subtitles": "Субтитры",
            "subtitles off": "Отключить Субтитры",
            "Captions": "Субтитры",
            "captions off": "Отключить Субтитры"
        });
    }

}
