import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoanDetailResponse, LoanSettings } from "./types";
import { NotificationService } from "../../modules/notification/services/notification.service";
import { SlickGridRowData } from "../../modules/search/slick-grid/types";
import { LoanItems } from "../../views/loan/constants/constants";


@Injectable({providedIn: 'root'})
export class LoanService {
    itemsAdded = new Subject<ItemsAdded>();
    itemsDeleted = new Subject<ItemDeleted>();
    typeGrid: 'media' | 'versions' | 'carriers' | 'name';
    isEditMode: boolean = false;

    constructor(private httpService: HttpService,
                private notificationService: NotificationService) {
    }

    addItems(items: ItemsAdded) {
        this.itemsAdded.next(items);
    }

    deleteItems(deleteItem: ItemDeleted) {
        this.itemsDeleted.next(deleteItem);
    }

    getLoanDetails(id): Observable<LoanDetailResponse> {
        return this.httpService
            .get(
                '/api/v3/loan/' + id
            )
            .pipe(map((res:any) => {
                return res.body;
            }))
    }

    saveNotes(id, notes) {
        return this.httpService
            .put(
                `/api/v3/loan/${id}/notes`,
                JSON.stringify(notes)
            )
            .pipe(
                map(res => res.body),
                catchError(this.handlerError)
            );
    }

    createLoan(payload: NewLoanPayload) {
        let NaDeliverTo2 = null;
        if (payload.NaDeliverTo) {
            const {id, $id, ...NaDeliverToS} = payload.NaDeliverTo;
            NaDeliverTo2 = NaDeliverToS;
        }

        const MediaItems = payload.MediaItems.map(el => ({TYPE: LoanItems.MediaItems, ITEM_ID: el.ID}));
        const VersionItems = payload.VersionItems.map(el => ({TYPE: LoanItems.VersionItems, ITEM_ID: el.ID}));
        const TapeItems = payload.TapeItems.map(el => ({TYPE: LoanItems.TapeItems, ITEM_ID: el.ID}));

        let DetailItems = [
            ...MediaItems,
            ...VersionItems,
            ...TapeItems
        ];
        const BookingTypeID = payload.BookingType.ID;
        // user Loans
        const RequestedBy = payload.RequestedBy !== null ? payload.RequestedBy['UserId'] : null ;
        // **
        const DeliveryMethodID = Number(payload.DeliveryMethod.ID);
        const CreatedDate = payload.CreatedDate;
        const RequiredFromDate = payload.RequiredFromDate;
        const ReturnDate = payload.ReturnDate;
        const Notes = payload.Notes;

        const newLoan: LoanDetailResponse = {
            Id: 0,
            DetailItems,
            RequestedBy,
            CreatedBy: 'TMDDBA',
            BookingTypeID,
            DeliverTo: null,
            NaDeliverTo: NaDeliverTo2,
            DeliveryAddress: null,
            DeliveryMethodID,
            Reference: null,
            RequiredFromDate,
            ReturnDate,
            Notes,
            CreatedDate,
            PlacedBy: null
        };
        return this.httpService
            .post(
                `/api/v3/loan`,
                newLoan
            )
            .pipe(
                map(res => res.body),
                catchError(this.handlerError)
            );
    }

    searchName(query = '') {
        return this.httpService
            .get(
                '/api/lookup/na/search?search=' + query,
            )
            .pipe(
                map(res => res.body),
                catchError(this.handlerError)
            );
    }

    getSettingsLoan(): Observable<LoanSettings> {
        return new Observable((obs) => {
            this.httpService
                .get('/api/v3/loan/settings')
                .pipe(map((res: any) => {
                    return res.body;
                }))
                .subscribe(res => {
                        obs.next(res);
                        obs.complete();
                    },
                    error => obs.error(error)
                );
        })
    }

    private handlerError = (error) => {
        this.notificationService.notifyShow(2, "settings_group.error", true, 1200);
        return throwError(error);
    };
}

export interface ItemsAdded {
    type: 'media' | 'versions' | 'carriers' | 'name',
    items: SlickGridRowData[] | Array<{ Name: string, ID: number }>
}

export interface ItemDeleted {
    type: 'media' | 'versions' | 'carriers' | 'name',
    items: SlickGridRowData[]
}

export interface NewLoanPayload {
    "Id": null,
    "BookingType": {
        "ID": 5,
        "Name": "Contact - Internal",
        "SubType": 4
    },
    "RequestedBy": {
        $id: "7"
        NAME: "SYSTEMS MANAGER"
        IsAdmin: true
        IsLibraryAdmin: true
        IsAccountLocked: false
        IsResetPassword: false
        TwoFa: null
        ID: 1
        HR_ID: 0
        USR_TYPES: 7864339
        LAST_PT_ID: 0
        USER_ID: "TMDDBA"
        SITE_ID: 1
        AREA_ID: 4
        DEPT_ID: 51700
        HOME_SITE_ID: 0
        COMPANY_ID: 0
        CONTACT_ID: 0
        FORENAME: "SYSTEMS"
        MIDDL_NAMES: null
        SURNAME: "MANAGER"
        TTL: null
        EMPLYE_ID: 0
        EMPLYE_NUM: null
        PHONE: null
        PH_MOB: null
        PH_EXT: null
        PH_SPED: null
        ACC_REF: null
        ACC_GRP: null
        NI_NO: null
        STRT_DT: "2019-04-04T10:46:49"
        END_DT: "2019-04-04T10:46:49"
        USR_ACC_STAT: 0
        NOTES: null
        ACCESS_GRPS: "|1115|"
        PC_ID: "vm@tmd.tv"
        PC_WGRP: null
        PC_IP: null
        RETRIES: 0
        TMO_DT: "2019-04-04T10:46:49"
        VIEW_MI: 30
        VIEW_PI: 1160
        VIEW_CI: 8
        VIEW_BK: 252
        VIEW_TL_MI: 331
        VIEW_CNTNR: 18
        VIEW_TP: 232
        VW_MITP_SRCH: 0
        VW_TPMI_SRCH: 0
        VW_MITL_SRCH: 0
        VW_NWARRIV: 18
        VW_SCHED: 0
        VW_MSCHED: 0
        DBA_MODE: -1
        DEF_CHAN: null
        DEF_GRP_ID: 0
        POST_ACTIONS: 0
        MSG_LISTNR: 0
        MSG_SEND: 0
        FLGS: 0
        PROC_AREAS: "|1|3|453|1020|1329|1790|4|424|967|1187|1713|5|45|46|400|404|477|569|1087|1127|1489|1730|1750|1911|2|265|286|287|518|519|520|521|522|523|565|566|1670|592|667|668|1247|1310|1311|1312|1470|1471|1472|1610|1549|1550|1629|1630|1710|1650|"
        PROC_USRS: "|998|1218|1219|1221|1223|201|1064|369|370|202|203|204|206|262|162|895|1938|366|372|774|2019|368|1998|2058|1523|2078|813|1518|1538|1418|1438|472|1739|82|1878|1879|1880|1881|2039|2040|2020|2122|1358|1758|412|1239|894|184|185|85|45|1498|312|307|164|1778|181|2082|286|1818|1558|1798|1718|1799|1860|904|1918|905|1839|1861|1399|1519|2080|1520|1521|1800|103|1318|1858|1|84|2041|373|1699|367|1522|101|1801|1979|1278|1989|1280|1281|1282|43|63|1401|23|42|143|1478|1479|1480|1481|223|980|1482|1483|1484|1485|1491|1490|1486|1487|1492|919|920|921|918|1488|1489|775|1199|873|859|860|83|900|1400|371|1378|207|1458|1898|793|874|1738|346|315|316|1678|1984|1985|1988|1980|1238|1958|1981|1987|1740|836|1578|1619|1618|1259|1260|1638|1639|2142|105|1838|1598|1298|266|"
        MSG_AREAS: null
        MSG_USRS: null
        CREATED: "0001-01-01T00:00:00"
        CREATED_BY: "USER"
        MODIFIED: "2020-01-22T14:45:18"
        MODIFIED_BY: "ALEXEY"
        HOL_YEAR: null
        DAY_LEN: null
        ADMIN_SITES: null
        ADMIN_AREAS: null
        PROC_DEVS: null
        RC_FLGS: null
        RC_PT_ID: null
        RC_PT_DATE: null
        RC_PT_NUM: null
        VIEW_HR_JO: 732
        VIEW_HR_JA: 0
        LEAVE_ST: null
        DEFAULT_FILE_SERVER: 989
        PASSWORD_LAST_CHANGED_DT: "2019-06-07T11:54:31"
        PWD_HASH: null
        SETTINGS_GROUP_ID: 142
        OKTA_ID: "abc"
        PUBLIC_API_KEY: "A93reRTUJHsCuQSHR+L3GxqOJyDmQpCgps102ciuabc="
        ALT_USERNAME: "TMDDBA"
        TWO_FA: null
        TM_DEVICE_LST: null
        TM_DEVICE_LSTReference: { EntityKey: { $id: "8", EntitySetName: "TM_DEVICE_LST", EntityContainerName: "xMfxEntities" } }
        TM_50_USERROLEs: Array<any>,
        TM_101_USERROLEBYCHANNELs: Array<any>,
        EntityKey: { $id: "9", EntitySetName: "TM_USERS", EntityContainerName: "xMfxEntities" },
    },
    "RequiredFromDate"?: "2020-03-11T15:28:22",
    "ReturnDate"?: "2020-03-11T15:28:22",
    "NaDeliverTo": {
        "ID": 8001551,
        "AgencyID": 0,
        "Biography": null,
        "Provenance": "",
        "Type": "Agency",
        "Name": "TMD LTD",
        "RelatedAgency": null,
        "RelatedProvenance": null,
        "id": 0,
        "$id": 0
    },
    "DeliveryMethod": {
        "$id": "6",
        "ID": "6",
        "Name": "CITY AIR EXPRESS",
        "Selected": false
    },
    "CreatedDate": "2020-03-11T15:28:22",
    "Notes": "",
    "VersionItems"?: Array<any>,
    "TapeItems"?: Array<any>,
    "MediaItems"?: Array<any>
}

