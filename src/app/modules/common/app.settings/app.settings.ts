/**
 * Created by Sergey Trizna on 08.03.2017.
 */
import {Injectable} from '@angular/core';
import {AppSettingsInterface} from './app.settings.interface';

/**
 * App constants
 */
@Injectable()
export class AppSettings implements AppSettingsInterface {
    // There may be other values
    subtypes = {
        0:0,                //default
        1:1,                //Physical item
        100:5,              //Media File
        101:6,              //Subtile
        110:7,              //Archive
        //  150:            //Audio
        200:9               //Image
    };
    mediaSubtypes = {
        'Default':0,        //default
        'PhysicalItem':1,   //Physical item
        'Media':100,        //Media File
        'Subtile':101,      //Subtile
        'Archive':110,      //Archive
        'Audio': 150,       //Audio
        'Image':200,        //Image
        'Doc':[210,230]     //Doc
    };
    mediaIcons = {
        1: 'paper.png',
        2: 'film.png',
        3: 'gear.png',
        4: 'HD720p.png',
        5: 'HD1080i.png',
        6: 'HD1080p.png',
        7: 'IPV.png',
        8: 'mxf.png',
        9: 'Omneon.png',
        10: 'print_preview.png',
        11: 'Quicktime.png',
        12: 'SD.png',
        13: 'tape_moving_image.png',
        14: 'wm.png',
        15: 'digital_archive.png',
        16: 'digital_audio.png',
        17: 'tape_audio.png',
        18: 'word.png',
        19: 'excel.png',
        20: 'media_basket_full.png',
        21: 'ICR.png',
        22: 'film_nitro.png',
        23: 'object.png',
        24: 'pdf.png',
        25: 'photograph.png',
        26: 'digital_archive_externalised.png',
        27: 'disc.png',
        28: 'digital_image.png',
        29: 'Media_Basket.png',
        30: 'mp4.png',
        31: 'mp3.png',
        32: 'jpg.png',
        33: 'smooth_streaming.png',
        34: 'tif.png',
        35: 'zip.png',
        36: 'XML.png',
        37: 'panel_view.png',
        38: 'list_view.png',
        39: 'details_list_view.png'
    };

    tabsType = {};

    contributorThumb = './assets/img/contributor.jpg';

    constructor(){
    }

    getSubtype(id): number {
        return this.subtypes[id];
    }
    getSubtypes(): any {
        return this.subtypes;
    }

    getTabName(id): any {
        return this.tabsType[id];
    }
    getMediaIcon(id): string|0 {
        if( !this.mediaIcons[id] ){
            return 0;
        }
        else {
            return "./assets/imfx-icons/" +this.mediaIcons[id];
        }
    }
    getContributorThumb(): string {
        return this.contributorThumb;
    }
    checkTabExist (id){
        for (var e in this.tabsType){
            if (this.tabsType[e]==id){
                return true;
            }
        }
        return false;
    };
    getTabs(): any{
        return this.tabsType;
    };
    getMediaSubtypes(): any {
        return this.mediaSubtypes;
    }
}
