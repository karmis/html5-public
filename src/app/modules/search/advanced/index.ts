/**
 * Created by Sergey Trizna on 04.03.2017.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SearchAdvancedComponent } from './search.advanced';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
// import {ModalModule as ng2Modal} from 'ngx-bootstrap';
import { AngularSplitModule } from 'angular-split';
// IMFX modules
import { IMFXControlsSelect2Module } from '../../controls/select2';
import { IMFXControlsMultiselectModule } from '../../controls/multiselect';
import { IMFXControlsDateTimePickerModule } from '../../controls/datetimepicker';
import { IMFXControlsTreeModule } from '../../controls/tree';
import { IMFXControlsNumberboxModule } from '../../controls/numberbox';
import { IMFXXMLTreeModule } from '../../controls/xml.tree';
import { IMFXAccessControlModule } from '../../access';
// import { ModalModule } from '../../modal';
// Advanced search
import { IMFXAdvancedCriteriaFieldBuilderComponent } from './comps/criteria/comps/field/field.builder.comp';
import { IMFXAdvancedCriteriaFieldExampleComponent } from './comps/criteria/comps/field/field.example.comp';
import { IMFXAdvancedCriteriaControlsComponent } from './comps/criteria/comps/controls/controls.component';
import { IMFXAdvancedCriteriaBuilderComponent } from './comps/criteria/criteria.builder';
import { IMFXAdvancedCriteriaExampleComponent } from './comps/criteria/criteria.example';
import { IMFXAdvancedGroupBuilderComponent } from './comps/group/group.builder';
import { IMFXAdvancedGroupExampleComponent } from './comps/group/group.example';
// Container
import { IMFXAdvancedCriteriaControlsContainerComponent } from './comps/criteria/comps/controls/comps/container/controls.container.component';
// Controls
import { IMFXAdvancedCriteriaControlCheckBoxComponent } from './comps/criteria/comps/controls/comps/container/comps/checkbox/checkbox.component';
import { IMFXAdvancedCriteriaControlNumberBoxComponent } from './comps/criteria/comps/controls/comps/container/comps/numberbox/numberbox.component';
import { IMFXAdvancedCriteriaControlDataSizeComponent } from './comps/criteria/comps/controls/comps/container/comps/datasize/datasize.component';
import { IMFXAdvancedCriteriaControlTextBoxComponent } from './comps/criteria/comps/controls/comps/container/comps/textbox/textbox.component';
import { IMFXAdvancedCriteriaControlComboMultiComponent } from './comps/criteria/comps/controls/comps/container/comps/combomulti/combomulti.component';
import { ComboSingleModule } from './comps/criteria/comps/controls/comps/container/comps/combosingle';
import { IMFXAdvancedCriteriaControlSignedDateTimeComponent } from './comps/criteria/comps/controls/comps/container/comps/signeddatetime/signeddatetime.component';
import { IMFXAdvancedCriteriaControlLookupSearchUsersComponent } from './comps/criteria/comps/controls/comps/container/comps/lookupsearch/users/lookup.usres.comp';
import { IMFXAdvancedCriteriaControlLookupSearchUsersModalComponent } from './comps/criteria/comps/controls/comps/container/comps/lookupsearch/users.modal/lookup.users.modal.comp';
import { IMFXAdvancedCriteriaControlHierarchicalLookupSearchLocationModalComponent } from './comps/criteria/comps/controls/comps/container/comps/hierarchical/location/location.modal.comp';
import { IMFXAdvancedCriteriaControlXMLComponent } from './comps/criteria/comps/controls/comps/container/comps/xml/xml.component';
import { XmlModule } from '../xml';
import { XMLComponent } from '../xml/xml';
import { UsersModule } from '../users';
import { UsersComponent } from '../users/users';
// import { LocationModule } from '../location';
// import { LocationComponent } from '../location/location';
// Pipes
import { KeysPipeModule } from '../../pipes/keysPipe';
import { OrderByModule } from '../../pipes/orderBy';
import { FilterPipeModule } from '../../pipes/filterPipe';
import { SearchSavedModule } from '../saved';
import { IMFXAdvancedCriteriaOperatorsComponent } from './comps/criteria/comps/operators/operators';
import { IMFXAdvancedCriteriaControlHierarchicalLookupSearchTaxonomyModalComponent } from './comps/criteria/comps/controls/comps/container/comps/lookupsearch/taxonomy/taxonomy.modal.comp';
import { TaxonomyModule } from '../taxonomy';
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { ComboSingleCustomStatusModule } from "./comps/criteria/comps/controls/comps/container/comps/customstatus";
import { IMFXAdvancedCriteriaControlComboSingleCustomStatusComponent } from "./comps/criteria/comps/controls/comps/container/comps/customstatus/custom.status.component";
import {IMFXAdvancedCriteriaControlTimeComponent} from "./comps/criteria/comps/controls/comps/container/comps/time/time.component";
import {IMFXAdvancedCriteriaControlDateTypedComponent} from "./comps/criteria/comps/controls/comps/container/comps/datetyped/datetyped.component";
import { IMFXAdvancedCriteriaControlComboMultiCustomStatusComponent } from './comps/criteria/comps/controls/comps/container/comps/customstatusmulti/custom.status..multicomponent';
import { ComboMultiCustomStatusModule } from './comps/criteria/comps/controls/comps/container/comps/customstatusmulti';
import {FormsModule} from "@angular/forms";
import {TimePickerModule} from "../../controls/timepicker";
import { IMFXAdvancedCriteriaControlLookupSearchProductionTemplatesModalComponent } from './comps/criteria/comps/controls/comps/container/comps/lookupsearch/prod.templates/prod.templates.modal.comp';


@NgModule({
    declarations: [
        SearchAdvancedComponent,
        // Adv
        IMFXAdvancedCriteriaFieldBuilderComponent,
        IMFXAdvancedCriteriaFieldExampleComponent,
        IMFXAdvancedCriteriaControlsComponent,
        IMFXAdvancedCriteriaOperatorsComponent,
        IMFXAdvancedGroupBuilderComponent,
        IMFXAdvancedGroupExampleComponent,
        IMFXAdvancedCriteriaBuilderComponent,
        IMFXAdvancedCriteriaExampleComponent,
        IMFXAdvancedCriteriaControlsContainerComponent,

        // Controls
        IMFXAdvancedCriteriaControlTimeComponent,
        IMFXAdvancedCriteriaControlCheckBoxComponent,
        IMFXAdvancedCriteriaControlTextBoxComponent,
        IMFXAdvancedCriteriaControlComboMultiComponent,
        IMFXAdvancedCriteriaControlNumberBoxComponent,
        IMFXAdvancedCriteriaControlDataSizeComponent,
        IMFXAdvancedCriteriaControlSignedDateTimeComponent,
        IMFXAdvancedCriteriaControlDateTypedComponent,
        IMFXAdvancedCriteriaControlLookupSearchUsersComponent,
        IMFXAdvancedCriteriaControlLookupSearchUsersModalComponent,
        IMFXAdvancedCriteriaControlHierarchicalLookupSearchLocationModalComponent,
        IMFXAdvancedCriteriaControlXMLComponent,
        IMFXAdvancedCriteriaControlHierarchicalLookupSearchTaxonomyModalComponent,
        IMFXAdvancedCriteriaControlLookupSearchProductionTemplatesModalComponent
        // IMFXAdvancedCriteriaControlComboSingleCustomStatusComponent

    ],
    imports: [
        TranslateModule,
        CommonModule,
        BsDropdownModule,
        // ModalModule,
        AngularSplitModule,

        // IMFX Modules
        IMFXControlsSelect2Module,
        IMFXControlsMultiselectModule,
        IMFXControlsDateTimePickerModule,
        IMFXControlsTreeModule,
        IMFXControlsNumberboxModule,
        IMFXXMLTreeModule,
        IMFXAccessControlModule,
        XmlModule,
        UsersModule,
        // LocationModule,
        ComboSingleModule,
        ComboSingleCustomStatusModule,
        ComboMultiCustomStatusModule,
        SearchSavedModule,
        TaxonomyModule,

        // Pipes
        KeysPipeModule,
        OrderByModule,
        FilterPipeModule,
        IMFXTextDirectionDirectiveModule,
        FormsModule,
        TimePickerModule
    ],
    exports: [
        SearchAdvancedComponent,
        // Adv
        IMFXAdvancedCriteriaFieldBuilderComponent,
        IMFXAdvancedCriteriaFieldExampleComponent,
        IMFXAdvancedCriteriaControlsComponent,
        IMFXAdvancedCriteriaOperatorsComponent,
        IMFXAdvancedGroupBuilderComponent,
        IMFXAdvancedGroupExampleComponent,
        IMFXAdvancedCriteriaBuilderComponent,
        IMFXAdvancedCriteriaExampleComponent,
        IMFXAdvancedCriteriaControlsContainerComponent,

        // Controls
        IMFXAdvancedCriteriaControlTimeComponent,
        IMFXAdvancedCriteriaControlCheckBoxComponent,
        IMFXAdvancedCriteriaControlTextBoxComponent,
        IMFXAdvancedCriteriaControlComboMultiComponent,
        IMFXAdvancedCriteriaControlNumberBoxComponent,
        IMFXAdvancedCriteriaControlDataSizeComponent,
        IMFXAdvancedCriteriaControlSignedDateTimeComponent,
        IMFXAdvancedCriteriaControlDateTypedComponent,
        IMFXAdvancedCriteriaControlLookupSearchUsersComponent,
        IMFXAdvancedCriteriaControlLookupSearchUsersModalComponent,
        IMFXAdvancedCriteriaControlHierarchicalLookupSearchLocationModalComponent,
        IMFXAdvancedCriteriaControlXMLComponent,
        IMFXAdvancedCriteriaControlHierarchicalLookupSearchTaxonomyModalComponent,
        IMFXAdvancedCriteriaControlLookupSearchProductionTemplatesModalComponent,
        IMFXAdvancedCriteriaControlComboSingleCustomStatusComponent,
        IMFXAdvancedCriteriaControlComboMultiCustomStatusComponent,
    ],
    entryComponents: [
        XMLComponent,
        IMFXAdvancedCriteriaControlXMLComponent,
        UsersComponent,
        IMFXAdvancedCriteriaControlLookupSearchUsersModalComponent,
        // LocationComponent,
        IMFXAdvancedCriteriaControlHierarchicalLookupSearchLocationModalComponent,
        IMFXAdvancedCriteriaControlHierarchicalLookupSearchTaxonomyModalComponent,
        IMFXAdvancedCriteriaControlLookupSearchProductionTemplatesModalComponent,
        IMFXAdvancedCriteriaControlComboSingleCustomStatusComponent,
        IMFXAdvancedCriteriaControlComboMultiCustomStatusComponent,
    ]
})
export class SearchAdvancedModule {
}
