import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {
    MadeItemsData,
    MakeListData,
    ProductionSubtitles,
    ResponseProductionDetail,
    Segments,
    TemplateConfig,
    TemplateFields,
    TemplateFields_DEFAULT_VERSIONS,
} from '../../../../services/production/production.types';
import {ProductionService} from "../../../../services/production/production.service";
import {MAKE_ITEM, PROD_SOURCE_OWNER_TYPE} from "../constants";
import {appRouter} from "../../../../constants/appRouter";
import {Router} from "@angular/router";
import {ProductionTypeDetail} from "../../../production/constants/production.types";
import {TimeCodeFormat, TMDTimecode} from '../../../../utils/tmd.timecode';
import {NotificationService} from '../../../../modules/notification/services/notification.service';
import {SlickGridRowData} from '../../../../modules/search/slick-grid/types';

@Injectable({
    providedIn: 'root'
})
export class ProductionDetailProvider {
    typePage: ProductionTypeDetail = null;
    makeItemSelected = new BehaviorSubject<MakeListData>(null);
    makeItemBeforeSelected = new BehaviorSubject<SlickGridRowData>(null);
    makeItemOnGridMouseUp = new Subject<any>();
    makeMultiSelected = new BehaviorSubject<any[]>(null);
    madeItemSelected = new BehaviorSubject<MadeItemsData>(null);
    onSubmitRemake = new Subject<any>();
    onAfterSave = new Subject<any>();
    updateSubsRowMakeItemsGrid = new Subject<any>();
    payload: ResponseProductionDetail = <ResponseProductionDetail>{
        "Items": [],
        "Sources": [],
        "SourceMedias": [],
        "SourceProgs": []
    };
    productionLoadedSub: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    payloadChangedSub: Subject<any> = new Subject;
    isChange = false;
    isCheckOnNull = false;
    templateConfig: TemplateConfig = null;
    templateFields: TemplateFields = null;
    templateDefaultDataItem = {
        Segments: [],
        AudioTracks: [],
        Subtitles: []
    }

    constructor(private productionService: ProductionService,
                private notificationService: NotificationService,
                private router: Router) {
    }

    resetState() {
        this.payload = <ResponseProductionDetail>{
            "Items": [],
            "Sources": [],
            "SourceMedias": [],
            "SourceProgs": []
        };
        this.templateDefaultDataItem = {
            Segments: [],
            AudioTracks: [],
            Subtitles: []
        };
        this.isChange = false;
        this.isCheckOnNull = false;
        this.makeItemSelected = new BehaviorSubject<MakeListData>(null);
        this.makeItemBeforeSelected = new BehaviorSubject<SlickGridRowData>(null);
        this.makeItemOnGridMouseUp = new Subject<any>();
        this.madeItemSelected = new BehaviorSubject<MadeItemsData>(null);
        this.productionLoadedSub = new BehaviorSubject<any>(null);
    }

    getItemById(id, type: 'ID' | '__ID' = 'ID'): MakeListData {
        let item = null;
        this.payload.Items.find(el => {
            if (el[type] === id) {
                item = el;
            }
            if (el.Children) {
                const found = el.Children.find(chEl => chEl[type] === id);
                if (found) {
                    item = found;
                }
            }
            if (item) {
                return true
            }
        });
        return item;
    }

    selectMakeItem(col: any) {
        let item: MakeListData = null;

        if (col.ITEM.__ISNEW) {
            item = this.getItemById(col.ITEM.__ID, '__ID');
        } else {
            item = this.getItemById(col.ITEM.ID, 'ID');
        }

        if (item && item.Subtitles && item.Subtitles.length && item.Subtitles[0].SEQUENCE === -1) {
            item.Subtitles = item.Subtitles.map((el, i) => {
                el.SEQUENCE = i + 1;
                return el;
            })
        }

        // if (item.MadeItems.length) {
        //     item.MadeItems.forEach(madeItem => {
        //         if(madeItem.AudioTracks && madeItem.AudioTracks.length) {
        //             madeItem.AudioTracks = madeItem.AudioTracks.map((el, i) => {
        //                 el.SEQUENCE = i + 1;
        //                 return el;
        //             })
        //         }
        //     })
        // }

        this.makeItemSelected.next(item);
    }

    getItem() {
        return this.makeItemSelected.value;
    }

    getMadeItem(ID = this.madeItemSelected.value.ID): MadeItemsData {
        let madeItem = null;
        this.makeItemSelected.value.MadeItems.forEach((el) => {
            if (el.ID === ID) madeItem = el;
        });
        return madeItem
    }

    // NOT TREE
    addVersionMakeItems(rows) {

        rows = this.checkDuplicateVersions(rows);
        if (rows.lenght === 0) {
            return
        }
        rows = rows.map(el => {
            const newItem: MakeListData = JSON.parse(JSON.stringify(MAKE_ITEM));
            newItem.__ISNEW = true;
            newItem.__ID = Math.random();
            newItem.Duration_text = el.DURATION_text;
            newItem.DURATION = this.stringToSec(el.DURATION_text);
            newItem.HOUSE_NUMBER = el.VERSIONID1;
            newItem.TITLE = el.TITLE;
            newItem.TITLE_MEDIA_ID = el.ID;
            newItem.Programm = {
                TITLE: el.TITLE,
                VERSION: el.VERSION,
                VERSIONID1: el.VERSIONID1,
                PGM_STATUS_TEXT: el.PGM_STATUS_TEXT,
                N_TX_DT: el.N_TX_DT,
            }

            this.setDefaultDataInItem(newItem);
            return newItem
        })
        this.payload.Items.push(...rows);
        this.payloadChangedSub.next();
        this.isChange = true;
    }

    /*
     Doesn't work with tree
     */
    changeVersionMakeItems(rows) {
        console.log('changeVersionMakeItems');

        rows = this.checkDuplicateVersions(rows);
        if (rows.lenght === 0) {
            return
        }

        const newData = {
            Duration_text: rows[0].DURATION_text,
            DURATION: this.stringToSec(rows[0].DURATION_text),
            HOUSE_NUMBER: rows[0].VERSIONID1,
            TITLE: rows[0].TITLE,
            TITLE_MEDIA_ID: rows[0].ID,
            Programm: {
                TITLE: rows[0].TITLE,
                VERSION: rows[0].VERSION,
                VERSIONID1: rows[0].VERSIONID1,
                PGM_STATUS_TEXT: rows[0].PGM_STATUS_TEXT,
                N_TX_DT: rows[0].N_TX_DT,
            }
        }
        const item = this.getItem();

        item.Duration_text = newData.Duration_text;
        item.DURATION = newData.DURATION;
        item.HOUSE_NUMBER = newData.HOUSE_NUMBER;
        item.TITLE = newData.TITLE;
        item.TITLE_MEDIA_ID = newData.TITLE_MEDIA_ID;
        item.Programm = newData.Programm;

        this.payloadChangedSub.next();

    }

    deleteVersionMakeItems() {
        this.makeMultiSelected.value.forEach(makeItem => {
            const idDeleted = makeItem.ITEM.ID;
            const idDeletedForNew = makeItem.ITEM.__ID;
            if (this.typePage === 'create' || idDeleted === 0) {
                this.payload.Items = this.payload.Items.filter(el => { // delete from master
                    if (el.Children) {
                        el.Children = el.Children.filter(chEl => chEl.__ID !== idDeletedForNew) // delete from version
                    }
                    return el.__ID !== idDeletedForNew
                });
            } else {
                this.payload.Items = this.payload.Items.map(item => {
                    if (item.ID === idDeleted) {
                        item.ID = item.ID * -1;
                    }
                    if (item.Children) {
                        item.Children.map(chEl => {
                            if (chEl.ID === idDeleted) {
                                chEl.ID = chEl.ID * -1;
                            }
                        })
                    }
                    return item
                });
            }
        })

        this.makeItemSelected.next(null);
        this.makeMultiSelected.next([]);
        this.payloadChangedSub.next();

    }

    setDefaultDataForMasterAndVersion(template) {
        this.templateDefaultDataItem = {
            Segments: [],
            AudioTracks: [],
            Subtitles: []
        };
        template.forEach(el => {
            this.templateDefaultDataItem.Segments.push(...this.deleteDirty(el.Segments));
            this.templateDefaultDataItem.AudioTracks.push(...this.deleteDirty(el.AudioTracks));
            this.templateDefaultDataItem.Subtitles.push(...this.deleteDirty(el.Subtitles));
        });
    }

    setDefaultVersions(data) {

        const cleansAndVersions: TemplateFields_DEFAULT_VERSIONS = []
        data.forEach(el => {
            cleansAndVersions.push(...el.DEFAULT_VERSIONS)
            this.templateDefaultDataItem.Segments.push(...this.deleteDirty(el.Segments));
            this.templateDefaultDataItem.AudioTracks.push(...this.deleteDirty(el.AudioTracks));
            this.templateDefaultDataItem.Subtitles.push(...this.deleteDirty(el.Subtitles));
        })

        if (cleansAndVersions.length === 0) { // || this.templateConfig.ConfigTypeText.toLocaleLowerCase() !== PRODUCTION_TEMPLATE_CONFIG.CLEAN_MASTERS
            return
        }
        cleansAndVersions.forEach(el => {
            const newItemMaster: MakeListData = JSON.parse(JSON.stringify(MAKE_ITEM));
            newItemMaster.__ID = Math.random();
            newItemMaster.__ISNEW = true;
            newItemMaster.Duration_text = this.secToString(el.DURATION);
            newItemMaster.DURATION = el.DURATION
            newItemMaster.TITLE = el.NAME;
            newItemMaster.PARENT_ID = null;
            this.setDefaultDataInItem(newItemMaster);

            el.Children.forEach(version => {
                const newItemVersion: MakeListData = JSON.parse(JSON.stringify(MAKE_ITEM));
                newItemVersion.__ID = Math.random();
                newItemVersion.__ISNEW = true;
                newItemVersion.Duration_text = this.secToString(version.DURATION);
                newItemVersion.DURATION = version.DURATION;
                newItemVersion.TITLE = version.NAME;
                newItemVersion.PARENT_ID = 0;
                this.setDefaultDataInItem(newItemVersion);

                newItemMaster.Children.push(newItemVersion)
            })

            this.payload.Items.push(newItemMaster)
        })

        this.payloadChangedSub.next();
    }

    addMakeItem(type: "version" | "master", form: any, col) {
        console.log('addMakeItem');
        this.isChange = true;
        const newItem: MakeListData = JSON.parse(JSON.stringify(MAKE_ITEM));
        newItem.__ID = Math.random();
        newItem.Duration_text = form.duration;
        newItem.DURATION = this.stringToSec(form.duration);
        newItem.TITLE = form.title;
        newItem.MEDIA_FILE_TYPE = form.mediaTypeId;
        newItem.NOTES = form.notes;
        newItem.PARENT_ID = type === "master" ? null : col.ITEM.ID;

        this.setDefaultDataInItem(newItem);

        if (type === "master") {
            this.payload.Items.push(newItem)
        } else {
            let found = null;
            if (col.ITEM.__ISNEW) {
                found = this.getItemById(col.ITEM.__ID, '__ID');
            } else {
                found = this.payload.Items.find(makeList => makeList.ID === col.ID);
            }
            found.Children.push(newItem);
        }
        this.payloadChangedSub.next();
    }

    changeMakeItem(form) {
        let found = null;
        if (this.getItem().__ISNEW) {
            found = this.getItemById(this.getItem().__ID, '__ID');
        } else {
            found = this.getItemById(this.getItem().ID, 'ID');
        }
        found.Duration_text = form.duration;
        found.DURATION = this.stringToSec(form.duration);
        found.TITLE = form.title;
        found.MEDIA_FILE_TYPE = form.mediaTypeId;
        found.NOTES = form.notes;

        this.payloadChangedSub.next();
        // console.log(form, found);
    }

    addAudioSubs(item: ProductionSubtitles, type: 'AudioTracks' | 'Subtitles') {
        this.isChange = true;

        this.getItem()[type].push(item);
    }

    removeAudioSubs(sequence, type: 'AudioTracks' | 'Subtitles') {
        this.isChange = true;

        this.getItem()[type] = this.getItem()[type].filter(el => el.SEQUENCE !== sequence)
    }

    addAudioSubsInMadeItem(item: ProductionSubtitles, type: 'AudioTracks' | 'Subtitles') {
        this.isChange = true;

        let items = this.getMadeItem()[type];
        if (Array.isArray(items)) {
            items.push(item)
        } else {
            items = [item]
        }
    }

    removeAudioSubsInMadeItem(sequence, type: 'AudioTracks' | 'Subtitles') {
        this.isChange = true;

        let items = this.getMadeItem()[type];
        if (Array.isArray(items)) {
            this.getMadeItem()[type] = items.filter(el => el.SEQUENCE !== sequence)
        }
    }

    changeAudioSubsSelect({data, value}) {
        this.isChange = true;
        let item = this.getItem();
        const valueId = value.id;

        switch (data.columnDef.selectName) {
            case 'AUDIO_CONTENT_TYPE_ID':
                item.AudioTracks = item.AudioTracks.map(el => {
                    if (el.SEQUENCE === data.data.SEQUENCE) {
                        el.AUDIO_CONTENT_TYPE_ID = valueId;
                    }
                    return el
                })
                break;
            case 'LANGUAGE_AUDIO':
                item.AudioTracks = item.AudioTracks.map(el => {
                    if (el.SEQUENCE === data.data.SEQUENCE) {
                        el.LANGUAGE_ID = valueId;
                    }
                    return el
                })
                break;
            case 'LANGUAGE_SUBS':
                item.Subtitles = item.Subtitles.map(el => {
                    if (el.SEQUENCE === data.data.SEQUENCE) {
                        el.LANGUAGE_ID = valueId;
                    }
                    return el
                })
                break;
            case 'AGE_CERTIFICATION':
                this.getMadeItem(data.data.ID).CERTIFICATION = valueId
                break;

            case 'MADE_ITEMS_AUDIO_CONTENT_TYPE_ID':
                this.getMadeItem().AudioTracks = this.getMadeItem().AudioTracks.map(el => {
                    if (el.SEQUENCE === data.data.SEQUENCE) {
                        el.AUDIO_CONTENT_TYPE_ID = valueId;
                    }
                    return el
                })
                break;
            case 'MADE_ITEMS_LANGUAGE_AUDIO':
                this.getMadeItem().AudioTracks = this.getMadeItem().AudioTracks.map(el => {
                    if (el.SEQUENCE === data.data.SEQUENCE) {
                        el.LANGUAGE_ID = valueId;
                    }
                    return el
                })
                break;
            case 'MADE_ITEM_TAB_SUBTITLES_LANGUAGE':
                this.getMadeItem().Subtitles = this.getMadeItem().Subtitles.map(el => {
                    if (el.SEQUENCE === data.data.SEQUENCE) {
                        el.LANGUAGE_ID = valueId;
                    }
                    return el
                })
                break;
            default:
                break

        }
    }

    addSegments(item: Segments) {
        this.isChange = true;
        item.PROD_ITEM_ID = this.getItem().ID;
        this.getItem()['Segments'].push(item);
    }

    removeSegments(SQ_NUM) {
        this.isChange = true;
        this.getItem()['Segments'] = this.getItem()['Segments'].filter(el => el.SQ_NUM !== SQ_NUM);
    }

    changeSegmentsSelect(data, item) {
        this.isChange = true;
        let value = null;
        const segment = this.getItem().Segments.find(el => el.SQ_NUM === item.SQ_NUM);

        // TODO:ROMAN field for in out
        if (data.type && data.type === 'In') {
            segment.SOMS = data.timecode;
            segment.SOM = data.frame;
            if (typeof segment.EOM === 'number' && typeof segment.SOM === 'number' && segment.SOM <= segment.EOM) {
                const tc = TMDTimecode.fromFrames(segment.EOM - segment.SOM, segment.TCF).toString();
                segment.Duration_text = tc;
            } else {
                segment.Duration_text = '';
            }
        } else if (data.type && data.type === 'Out') {
            segment.EOMS = data.timecode;
            segment.EOM = data.frame;
            if (typeof segment.EOM === 'number' && typeof segment.SOM === 'number' && segment.SOM <= segment.EOM) {
                const tc = TMDTimecode.fromFrames(segment.EOM - segment.SOM, segment.TCF).toString();
                segment.Duration_text = tc;
            } else {
                segment.Duration_text = '';
            }
        } else if (data.data.columnDef.field === 'SEG_TYPE') {
            value = Number(data.value.id);
            segment.SEG_TYPE = value;
            segment.TxPart = data.data.data.TxPart;
            segment.PRT_NUM = data.data.data.PRT_NUM;

        } else if (data.data.columnDef.field === 'PRT_TTL') {
            value = data.value;
            segment.PRT_TTL = value;
        }
        // value = moment(value,'hh:mm:ss:ms').milliseconds
    }

    refreshSegments({TimecodeFormat, TCF}) {
        const func = (segment) => {
            segment['SOM'] = null;
            segment['EOM'] = null;
            segment['SOMS'] = '';
            segment['EOMS'] = '';
            segment['Duration_text'] = '';
            segment['TimecodeFormat'] = TimecodeFormat;//string
            segment['TCF'] = TCF;
            return segment
        };

        this.payload.Items.forEach(makeItem => {
            makeItem.Segments = makeItem.Segments.map(func);

            if (makeItem.Children && makeItem.Children.length) {
                makeItem.Children.forEach(_makeItem => {
                    _makeItem.Segments = _makeItem.Segments.map(func);
                });
            }
        });
        this.payloadChangedSub.next();
    }

    getValidatePayloadDataMakeItems() {
        const func = (item) => {
            //validate all requirement fields

            //validate segments
            let _func = (row) => {
                const tcIn = row.SOM;
                const tcOut = row.EOM;

                if (tcIn > tcOut || tcIn === null || tcOut === null) {
                    return false;
                } else {
                    return true;
                }
            };

            for (const _item of item.Segments) {
                // isValid = isValid && _func(_item);
                if (!_func(_item)) {
                    return false;
                }
            }

            return true;
        };

        const makeItems = this.payload.Items.filter(el => el.ID >= 0); // exclude deleted items
        for (const makeItem of makeItems) {
            if (!func(makeItem)) {
                return false;
            }

            if (makeItem.Children && makeItem.Children.length) {
                makeItem.Children.forEach(_makeItem => {
                    if (!func(makeItem)) {
                        return false;
                    }
                });
            }
        }

        return true;
    }

    addMediaTitleItems(typeGrid: 'media' | 'versions', typeItem: 'production' | 'item', rows) {
        console.log('addMediaTitleItems');
        this.isChange = true;

        rows.map(el => {
            el.__ISNEW = true;
        });

        if (this.isCheckOnNull === false) {
            this.isCheckOnNull = true;
            this.checkArray(this.payload.Sources);
            this.checkArray(this.payload.SourceMedias);
            this.checkArray(this.payload.SourceProgs);
        }

        if (this.getItem()) {
            this.checkArray(this.getItem().Sources);
            this.checkArray(this.getItem().SourceProgs);
            this.checkArray(this.getItem().SourceMedias);
        }


        switch (typeGrid) {
            case 'media':
                if (typeItem === 'production') {
                    const mediaItemsSources = rows.map(row => {
                        return {
                            ID: 0,
                            JOB_ID: null,
                            OWNER_ID: row.ID,
                            OWNER_TYPE: PROD_SOURCE_OWNER_TYPE.MEDIA,
                            PROD_ID: this.payload.ID,
                            PROD_ITEM_ID: 0,
                            STATUS: row.STATUS,
                        }
                    });
                    this.payload.Sources = this.payload.Sources.concat(mediaItemsSources);
                    this.payload.SourceMedias = this.payload.SourceMedias.concat(rows);
                } else if (typeItem === 'item') {

                    const mediaItemsSources = rows.map(row => {
                        return {
                            ID: 0,
                            JOB_ID: null,
                            OWNER_ID: row.ID,
                            OWNER_TYPE: PROD_SOURCE_OWNER_TYPE.MEDIA,
                            PROD_ID: this.payload.ID,
                            PROD_ITEM_ID: this.getItem().ID,
                            STATUS: row.STATUS,
                        }
                    });
                    this.getItem().Sources = this.getItem().Sources.concat(mediaItemsSources);
                    this.getItem().SourceMedias = this.getItem().SourceMedias.concat(rows);
                }
                break;


            case 'versions':

                if (typeItem === 'production') {

                    const titlesItemsSources = rows.map(row => {
                        return {
                            ID: 0,
                            JOB_ID: null,
                            OWNER_ID: row.ID,
                            OWNER_TYPE: PROD_SOURCE_OWNER_TYPE.TITLE,
                            PROD_ID: this.payload.ID,
                            PROD_ITEM_ID: 0,
                            STATUS: row.ITEM_STATUS_ID,
                        }
                    });
                    this.payload.Sources = this.payload.Sources.concat(titlesItemsSources);
                    this.payload.SourceProgs = this.payload.SourceProgs.concat(rows);
                } else if (typeItem === 'item') {

                    const titlesItemsSources = rows.map(row => {
                        return {
                            ID: 0,
                            JOB_ID: null,
                            OWNER_ID: row.ID,
                            OWNER_TYPE: PROD_SOURCE_OWNER_TYPE.TITLE,
                            PROD_ID: this.payload.ID,
                            PROD_ITEM_ID: this.getItem().ID,
                            STATUS: row.ITEM_STATUS_ID,
                        }
                    });
                    this.getItem().Sources = this.getItem().Sources.concat(titlesItemsSources);
                    this.getItem().SourceProgs = this.getItem().SourceProgs.concat(rows);
                }
                break;
        }
    }

    removeMediaTitleItems(typeGrid: 'media' | 'versions', typeItem: 'production' | 'item', row) {
        this.isChange = true;
        switch (typeGrid) {
            case 'media':
                if (typeItem === 'production') {
                    this.payload.Sources = this.payload.Sources.filter(item => this.setItemOnRemove(item, row));
                    this.payload.SourceMedias = this.payload.SourceMedias.filter(item => item.ID !== row.ID);
                } else if (typeItem === 'item') {
                    this.getItem().Sources = this.getItem().Sources.filter(item => this.setItemOnRemove(item, row));
                    this.getItem().SourceMedias = this.getItem().SourceMedias.filter(item => item.ID !== row.ID);
                }
                break;
            case 'versions':
                if (typeItem === 'production') {
                    this.payload.Sources = this.payload.Sources.filter(item => this.setItemOnRemove(item, row));
                    this.payload.SourceProgs = this.payload.SourceProgs.filter(item => item.ID !== row.ID);
                } else if (typeItem === 'item') {
                    this.getItem().Sources = this.getItem().Sources.filter(item => this.setItemOnRemove(item, row));
                    this.getItem().SourceProgs = this.getItem().SourceProgs.filter(item => item.ID !== row.ID);
                }
                break;
        }
    }

    changeDynamicFields(data) {
        var result = Object.assign({}, data);
        Object.keys(result).forEach(k => {
            if (k == "OWNERS") {
                result[k] = result[k] ? result[k].map((k) => {
                    return k.Id
                }).join(";") : "";
            }
            this.payload[k] = result[k];
        });
    }

    submitEdit() {
        this.productionService.saveProductionDetail(this.payload).subscribe(res => {
            this.isChange = false;
            const productionTypeDetail: ProductionTypeDetail = 'production-search';

            if (this.typePage === 'production-search') {
                this.onAfterSave.next(res)
            } else {
                this.router.navigate([
                    appRouter.production.prod_detail.split('/')[0],
                    productionTypeDetail,
                    res.ID
                ])
            }
        })
    }

    calcTotalDuration(segments, format) {
        let summ = 0;
        let timecodeFormat = TimeCodeFormat[format];
        // let faults = this.config.file['Segments'];
        segments.forEach(el => {
            summ += TMDTimecode.fromString(el.DURATION_text, timecodeFormat).toFrames();
        });
        return TMDTimecode.fromFrames(summ, timecodeFormat).toString();
    }

    calcDurationTimecode(soms, eoms, timeCodeFormat) {
        return {
            timecode: TMDTimecode.fromString(eoms, timeCodeFormat).substract(TMDTimecode.fromString(soms, timeCodeFormat)).toString(),
            type: 'Duration',
            field: 'DURATION_text'
        };
    }

    private checkArray(val) {
        if (!Array.isArray(val)) {
            val = []
        }
    }

    private setItemOnRemove(item, row) {
        if (item.OWNER_ID === row.ID) {
            if (item.ID === 0) {
                return false
            }
            item.ID = item.ID * -1;
        }
        return true
    }

    private secToString(sec) {
        const sec_num = parseInt(sec, 10); // don't forget the second param
        let hours = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        const seconds = sec_num - (hours * 3600) - (minutes * 60);
        if (minutes < 10) {
            // @ts-ignore
            minutes = "0" + minutes;
        }
        return minutes + ':' + seconds;
    }

    private stringToSec(string) {
        if (string === null || string === undefined || string.length < 5) {
            return 0
        }
        const a = string.split(':');
        return (+a[0] * 60) + (+a[1]);
    }

    private setDefaultDataInItem(cleansOrVersions) {
        cleansOrVersions.AudioTracks = [...this.templateDefaultDataItem.AudioTracks.map(el => {
            return {
                "PROD_ITEM_ID": el.ID,
                "TEMPLATE_ID": el.TEMPLATE_ID,
                SEQUENCE: el.SEQUENCE,
                "AUDIO_CONTENT_TYPE_ID": el.AUDIO_CONTENT_TYPE_ID,
                "LANGUAGE_ID": el.LANGUAGE_ID,
            }
        })];
        cleansOrVersions.Segments = [...this.templateDefaultDataItem.Segments.map(el => {

            const SQ_NUM = el.SQ_NUM;
            const PRT_NUM = SQ_NUM - 1;
            const TEMPLATE_ID = 0;
            const PROD_ITEM_ID = el.ID;

            let newItem: Segments = {
                ID: 0,
                PROD_ITEM_ID,
                TEMPLATE_ID,
                PRT_NUM,
                SQ_NUM,
                SEG_TYPE: el.SEG_TYPE,
                PRT_TTL: el.PRT_TTL,
                TCF: 1,
                SOM: el.SOM,
                EOM: el.EOM,
                EOMS: el.EOMS,
                SOMS: el.SOMS,
                TimecodeFormat: el.TimecodeFormat,
                TYPE_text: null,
                Duration_text: el.Duration_text,
                TxPart: el.TxPart
            };


            return newItem
        })];
        cleansOrVersions.Subtitles = [...this.templateDefaultDataItem.Subtitles.map(el => {
            return {
                "PROD_ITEM_ID": cleansOrVersions.ID,
                "TEMPLATE_ID": null,
                SEQUENCE: el.SEQUENCE,
                "AUDIO_CONTENT_TYPE_ID": null,
                "LANGUAGE_ID": el.LANGUAGE_ID,
            }
        })];
    }

    private checkDuplicateVersions(rows) {
        const ids = rows.map(el => el.ID);
        const duplicateIds = [];
        const uniqItems = [];
        this.payload.Items.forEach(item => {
            if (ids.find(el => el === item.TITLE_MEDIA_ID)) {
                duplicateIds.push(item.TITLE_MEDIA_ID);
            } else {
                uniqItems.push(item);
            }
        })
        if (duplicateIds.length > 0) {
            const duplIds = duplicateIds.join(', ')
            this.notificationService.notifyShow(2, "You cannot select this item. It has been used already. Ids: " + duplIds, true, 5000);
            rows = rows.filter(row => {
                const found = duplicateIds.find(el => el === row.ID)
                if (found) {
                    return false
                } else {
                    return true
                }
            })
        }

        return rows
    }

    private deleteDirty = (arr) => {
        return arr.map(el => {
            delete el['$id'];
            delete el['id'];
            delete el['EntityKey'];
            delete el['__contexts'];
            return el;
        })
    }
}
