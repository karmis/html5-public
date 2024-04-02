/**
 * Created by Sergey Trizna on 09.01.2016.
 */
import {Component, Injector, ViewChild, ViewEncapsulation} from '@angular/core';
import {ControlToAdvTransfer} from '../../../../../../../../../../../../services/viewsearch/controlToAdvTransfer.service';
import * as $ from 'jquery';
import { LookupSearchUsersService } from '../../../../../../../../../../../../services/lookupsearch/users.service';
@Component({
    selector: 'advanced-criteria-control-lookupsearch-users',
    templateUrl: "tpl/index.html",
    encapsulation: ViewEncapsulation.None
})
export class IMFXAdvancedCriteriaControlLookupSearchUsersComponent {
    public data: any;
    @ViewChild('control', {static: false}) private control: any;

    constructor(private injector: Injector,
                private lookupSearchUserService: LookupSearchUsersService,
                private transfer: ControlToAdvTransfer) {
        this.data = this.injector.get('data');
        this.data.users = [];
        this.data.paramsOfSearch = '';
    }

    // ngOnInit() {
    //     let self = this;
    //     this.control.setDefaultOptions({
    //         minimumInputLength: 1,
    //         ajax: {
    //             url: function () {
    //                 return self.lookupSearchUserService.getUrl()
    //             },
    //             dataType: 'json',
    //             delay: 250,
    //             data: function (params) {
    //                 return {
    //                     search: params.term
    //                 };
    //             },
    //             processResults: function (data, params) {
    //                 $.each(data, function (k) {
    //                     data[k].Forename += ' ' + data[k].Surname
    //                 });
    //
    //                 return {
    //                     results: self.control.turnArrayOfObjectToStandart(data, {
    //                         key: 'Id',
    //                         text: 'Forename'
    //                     }, {
    //                         selected: false,
    //                         disabled: false
    //                     }),
    //                 };
    //             },
    //             cache: true,
    //         },
    //         templateSelection: function (repo) {
    //             return repo.text;
    //         },
    //         templateResult: function (repo) {
    //             return repo.text;
    //         }
    //     });
    // }
    //
    // onSearch($event) {
    //     if ($event.target.value) {
    //         this.data.paramsOfSearch = $event.target.value;
    //     }
    // }

    ngAfterViewInit() {
        this.lookupSearchUserService.getUsers()
            .subscribe(
                (data: any) => {
                    $.each(data, function (k) {
                        data[k].Forename += ' ' + data[k].Surname
                    });
                    this.data.users = this.control.turnArrayOfObjectToStandart(data, {
                        key: 'Id',
                        text: 'Forename'
                    }, {
                        selected: false,
                        disabled: false
                    });

                    this.control.refreshData(this.data.users);
                    // this.control.setData(this.data.users, true);
                },
                (error: any) => {
                    console.error('Failed', error);
                }
            );
    }

    /**
     * Send data to parent comp
     */
    transferData() {
        // Send data to parent comps
        this.transfer.updated.emit(this.control.getSelected());
    }
}
