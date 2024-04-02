/**
 * Created by Sergey Klimenko on 10.03.2017.
 */
import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {HttpService} from '../../../../services/http/http.service';
import {SessionStorageService} from "ngx-webstorage";
import {MediaDetailResponse} from '../../../../models/media/detail/media.detail.response';
import {MediaDetailDetailsViewResponse} from '../../../../models/media/detail/detailsview/media.detail.detailsview.response';
import {MediaDetailMediaVideoResponse} from '../../../../models/media/detail/mediavideo/media.detail.mediavideo.response';
import {MediaDetailMediaCaptionsResponse} from '../../../../models/media/detail/caption/media.detail.media.captions.response';
import {MediaDetailMediaTaggingResponse} from '../../../../models/media/detail/mediatagging/media.detail.media.tagging.response';
import {MediaDetailHistoryResponse} from '../../../../models/media/detail/history/media.detail.detail.history.response';
import {MediaDetailPacSubtitlesResponse} from '../../../../models/media/detail/pacsubtitles/media.detail.pac.subtitiles.response';
import {MediaDetailReportsResponse} from '../../../../models/media/detail/reports/media.detail.reports.response';
import {MediaDetailAttachmentsResponse} from "../../../../models/media/detail/attachments/media.detail.detail.attachments.response";
import {map, mergeMap} from 'rxjs/operators';
import {HttpResponse} from '@angular/common/http';
import {MediaVideoPipe} from "../../../../pipes/media.video.pipe/media.video.pipe";


const LoansDetails = {
    "Id": 204,
    "Type": "Search_Loans",
    "Subtype": "Search_Loans",
    "Groups": [
        {
            "Columns": [
                {
                    "Id": "ID",
                    "Title": "Booking #",
                    "IsBold": true,
                    "Foreground": "#b42525",
                    "Background": "#e2cdcd"
                },
                {
                    "Id": "LOAN_TYPE_text",
                    "Title": "Type",
                    "IsBold": false,
                    "Foreground": "",
                    "Background": "#2f5824"
                },
                {
                    "Id": "BOOKING_FOR_text",
                    "Title": "For",
                    "IsBold": false,
                    "Foreground": "",
                    "Background": ""
                },
                {
                    "Id": "RQD_DATE",
                    "Title": "Required Date",
                    "IsBold": false,
                    "Foreground": "",
                    "Background": ""
                },
                {
                    "Id": "LOAN_RTRN_DT",
                    "Title": "Return Date",
                    "IsBold": false,
                    "Foreground": "",
                    "Background": ""
                },
                // {
                //     "Id": "CREATED_BY",
                //     "Title": "Placed By",
                //     "IsBold": false,
                //     "Foreground": "",
                //     "Background": ""
                // }
            ],
            "GroupName": ""
        },
    ],
    "TabsData": [
        "mMetadata",
        "vMedia",
        "vSegmentsAudioTracks",
        "vNotes",
        "vAdditionalInfo",
        "vRights",
        "mAssocMedia",
        "vAudio",
        "vIMF"
    ]
}

/**
 * Detail service
 */
@Injectable()
export class DetailService {
    constructor(public httpService: HttpService,
                public sessionStorage: SessionStorageService, public mediaVideoPipe: MediaVideoPipe) {
    }

    /**
     * Get detail info by id
     * @param id
     * @param typeDetails
     */
    getDetail(id, typeDetails): Observable<HttpResponse<any>> {
        return this.httpService
            .get(
                '/api/v3/' + typeDetails + '/' + id
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    };


    getDetails(
        id,
        subtypes,
        typeDetails,
        detailsviewType
    ): Observable<(MediaDetailResponse | MediaDetailDetailsViewResponse)[]> {
        let lang = localStorage.getItem('tmd.base.settings.lang');
        if (lang) {
            lang = lang.replace(/"/g, '');
        }

        debugger
        if (typeDetails === 'version-details') {
            return this.getDetailsView(subtypes[0], detailsviewType)
                .pipe(map((res: any) => res))
                .pipe(mergeMap((resp) => {
                        // let subtype = subtypes[resp && resp.MEDIA_TYPE ? resp.MEDIA_TYPE : 0];
                        // let selector = `detailsview.${detailsviewType}_${lang}.${subtype}`;
                        // let data = this.sessionStorage.retrieve(selector);
                        // return [];
                        const extCols = resp.Groups[0].Columns.filter((col) => {
                            return col.Id.indexOf('Dynamic.') === 0
                        }).map((col) => {
                            return col.Id
                        });
                        return this.httpService.post('/api/v3/' + typeDetails + '/' + id, {
                            "ExtendedColumns": extCols
                        }).pipe(map((res: any) => res.body))
                    },
                    (res, res1) => {
                        this.checkFields(res1);
                        return [res1, res];
                    }
                ));
        } else if(typeDetails === 'segment-details') {
            return this.httpService.get('/api/v3/' + typeDetails + '/' + id)
                .pipe(map((res: any) => res.body))
                .pipe(mergeMap((resp) => {
                        let subtype = subtypes[resp && resp.MEDIA_TYPE ? resp.MEDIA_TYPE : 0];
                        // let selector = `detailsview.${detailsviewType}_${lang}.${subtype}`;
                        // let data = this.sessionStorage.retrieve(selector);
                        return this.getDetailsView(subtype, detailsviewType);
                    },
                    (res, res1) => {
                        this.checkFields(res);
                        return [res, res1];
                    }
                    )
                );
        } else  {
            return this.httpService.get('/api/v3/' + typeDetails + '/' + id)
                .pipe(map((res: any) => res.body))
                .pipe(mergeMap((resp) => {
                            let subtype = subtypes[resp && resp.MEDIA_TYPE ? resp.MEDIA_TYPE : 0];
                            // let selector = `detailsview.${detailsviewType}_${lang}.${subtype}`;
                            // let data = this.sessionStorage.retrieve(selector);
                            return this.getDetailsView(subtype, detailsviewType);
                        },
                        (res, res1) => {
                            this.checkFields(res);
                            return [res, res1];
                        }
                    )
                );
        }


    };

    getDetailsAssess(id, subtypes, typeDetails, detailsviewType) {
        let lang = localStorage.getItem('tmd.base.settings.lang');
        if (lang) {
            lang = lang.replace(/"/g, '');
        }
        return this.httpService.get('/api/v3/task/assess/' + id)
            .pipe(map(res => res.body))
            .pipe(mergeMap((resp: any) =>
                    this.httpService.get('/api/v3/detailsview/' + detailsviewType + '/0' + '?lang=' + lang)
                        .map(
                            res1 => res1.body
                        ),
                (res, res1) => {
                    this.checkFields(res);
                    return [res, res1];
                }
            ));
    }

    // getConsumerDetails(id): Observable<MediaDetailResponse> {
    //     return this.httpService.get('/api/v3/media-details/' + id)
    //     // return this.httpService.get('/api/file/' + id + '/media')
    //         .pipe(map(res => res.body));
    // }

    getDetailsView(subtype, detailsviewType): Observable<MediaDetailDetailsViewResponse> {
        let lang = localStorage.getItem('tmd.base.settings.lang');
        if (lang) {
            lang = lang.replace(/\"/g, '');
        }
        let selector = `detailsview.${detailsviewType}_${lang}.${subtype}`;
        let data = this.sessionStorage.retrieve(selector);

        if (detailsviewType === 'LoansDetails') {
            return new Observable(obs => {

                // @ts-ignore
                obs.next(LoansDetails)
            })
        }
        return new Observable((observer) => {
            if (!data) {

                this.httpService.get('/api/v3/detailsview/' + detailsviewType + '/' + subtype + '?lang=' + lang)
                    .pipe(map(res => res.body))
                    .subscribe(
                        (res) => {
                            this.sessionStorage.store(selector, res);
                            observer.next(res);
                        }, (err) => {
                            observer.error(err);
                        }, () => {
                            observer.complete();
                        });
            } else {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                observer.next(data);
                observer.complete();
                // });
            }
        });
    };

    checkFields(file) {
        if (file) {
            if (!file.TITLE && file.LI_TTL_text) {
                file.TITLE = file.LI_TTL_text;
            }
        }
    };

    getDetailHistory(type, id): Observable<Array<MediaDetailHistoryResponse>> {
        return this.httpService.get('/api/v3/history/' + type + '/' + id)
            .pipe(map((res: any) => {
                return res.body;
            }));
    };

    getDetailMediaTagging(guid): Observable<MediaDetailMediaTaggingResponse> {
        return this.httpService.get('/api/v3/media-tagging/' + guid)
            .pipe(map((res: any) => {
                return res.body;
            }));
    };

    /**
     * Get friendly names from storage (if not -> load&save)
     */
    getLookups(id: string): Observable<HttpResponse<any>> {
        let data = this.sessionStorage.retrieve(id);
        return new Observable((observer) => {
            if (!data) {
                let lookup = id.split('.')[0];
                this.httpService.get('/api/lookups/' + lookup)
                    .pipe(map(res => res.body))
                    .subscribe(
                        (res) => {
                            let path = id.split('.');
                            let d = res;
                            for (let i in path) {
                                d = d[path[i]];
                            }
                            this.sessionStorage.store(id, d);
                            observer.next(d);
                        }, (err) => {
                            observer.error(err);
                        }, () => {
                            observer.complete();
                        });
            } else {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                observer.next(data);
                observer.complete();
                // });
            }
        });
    };

    /**
     * Get video info
     */
    getVideoInfo(id: number, options?: {
        smudge: boolean,
        scene?: boolean,
        waveform?: boolean,
        audiovolume?: boolean
    }, type?: string): Observable<MediaDetailMediaVideoResponse> {
        let params = [];
        for (let i in options) {
            if (options[i]) {
                params.push(i);
            }
        }

        let paramsstr = params.join(',');
        if (!type) {
            type = 'media';
        }
        return this.httpService.get(
            '/api/v3/' + type + 'video/' + id + (paramsstr ? '?info=' + params.join(',') : ''))
            .pipe(map((res: any) => {
                return this.mediaVideoPipe.transform(res);
            }))
    }

    getWaveformsJson(url) {
        return this.httpService.get(url).pipe(map((res: any) => {
            return res.body;
        }));
    }

    /**
     * Get smduges
     */
    getMediaSmudges(ids: Array<number>) {
        return this.httpService.get('/api/v3/media-smudge/' + ids.join(',')).pipe(map((res: any) => {
            let response = res.body;
            for (let i in response) {
                response[i].Url = this.httpService.getBaseUrl() + response[i].Url;
            }
            let results = [];
            for (let id of ids) {
                if (response[id]) {
                    response[id].MediaId = id;
                    results.push(response[id]);
                }
            }
            return results;
        }));
    }

    getSubtitles(id: number): Observable<Array<MediaDetailMediaCaptionsResponse>> {
        return this.httpService.get('/api/v3/media-captions/' + id).pipe(map((res: any) => {
            return res.body;
        }))
    }

    getPacSubtitles(id: number, params: string = ''): Observable<Array<MediaDetailPacSubtitlesResponse>> {
        return this.httpService.get('/api/v3/subtitles/' + id + params).pipe(map((res: any) => {
            return res.body;
        }));
    };

    getDetailReport(id: number): Observable<Array<MediaDetailReportsResponse>> {
        return this.httpService.get('/api/v3/media-reports/' + id)
            //  return this.httpService.get('/getfile.aspx?id=3006017')
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getDetailAttachments(type, id): Observable<Array<MediaDetailAttachmentsResponse>> {
        return this.httpService.get('/api/v3/attachments/' + type + '/' + id)
            .pipe(map((res: any) => {
                return res.body;
            }));
    };

    getIMFPackage(id): Observable<any> {
        return this.httpService.get('/api/v3/imf/' + id)
            .pipe(map((res: any) => {
                return res.body;
            }));
    };

    getIMFCPL(id): Observable<any> {
        return this.httpService.get('/api/v3/imf/cpl/' + id)
            .pipe(map((res: any) => {
                return res.body;
            }));
    };

    save(id: number, options: any): Observable<HttpResponse<any>> {
        return;
    }

    getAVFaults(id): Observable<any> {
        return this.httpService.get('/api/v3/media/' + id + '/avfaults')
            .pipe(map((res: any) => {
                return res.body;
            }));
    };

    editSomEom(id: number, data): Observable<any> {
        return Observable.create((observer) => {

            this.httpService.put(
                '/api/v3/media/' + id + '/som-eom',
                JSON.stringify(data)
            ).pipe(map(response => (<HttpResponse<any>>response).body))
                .subscribe(
                    (resp) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    }
                );
        });
    }

    getDefaultMetadata(schemaId, ownerType, ownerId): Observable<any> {
        return this.httpService.get('/api/xmldocument?schemaId=' + schemaId + '&ownerType=' + ownerType + '&ownerId=' + ownerId)
            .pipe(map((res: any) => {
                return res.body;
            }));
    };

    getDetailTasks(id: number): Observable<any> {
        return this.httpService.get('/api/v3/tasks/media/' + id)
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getDetailsViewAndVideoInfo(subtype, detailsviewType, mediaId, options: {
        smudge: true,
        scene: true,
        waveform: false,
        audiovolume: true
    }): Observable<any> {
        let lang = localStorage.getItem('tmd.base.settings.lang');
        if (lang) {
            lang = lang.replace(/\"/g, '');
        }
        let params = [];
        for (var i in options) {
            if (options[i]) {
                params.push(i);
            }
        }
        return forkJoin([
            this.httpService
                .get('/api/v3/detailsview/' + detailsviewType + '/' + 5 + '?lang=' + lang)
                .pipe(map((res: any) => {
                    return res.body;
                })),
            this.httpService.get('/api/v3/mediavideo/' + mediaId + '?info=' + params.join(","))
                .pipe(map((res: any) => {
                    return this.mediaVideoPipe.transform(res);
                }))
        ]);
    };

    changeDateByModal(ids, date): Observable<HttpResponse<any>> {
        return new Observable((observer) => {
            this.httpService.post(
                '/api/v3/programmes/deadline',
                JSON.stringify({
                    Programmes: ids,
                    DeadlineDate: date
                }))
                .subscribe(
                    (resp) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    })
        });
    }

    getAssessDetailsAsync(id, subtype, typeDetails, detailsviewType) {
        let lang = localStorage.getItem("tmd.base.settings.lang");
        if (lang) {
            lang = lang.replace(/\"/g, "");
        }
        return forkJoin([
            this.httpService
                .get('/api/v3/task/assess/' + id)
                .pipe(map((res: any) => {
                    return res.body;
                })),
            this.httpService
                .get('/api/v3/detailsview/' + detailsviewType + '/0' + '?lang=' + lang)
                .pipe(map((detailsview) => {
                    return detailsview.body;
                }))
        ]);
    };

    getProductionDetails(id): Observable<HttpResponse<any>>  {
        let lang = localStorage.getItem("tmd.base.settings.lang");
        if (lang) {
            lang = lang.replace(/\"/g, "");
        }
        return this.httpService
            .get('/api/v3/production/productionitem/' + id + '/madechecks' + '?lang=' + lang)
            .pipe(map((detailsview) => {
                return detailsview.body;
            }))
    }
}
