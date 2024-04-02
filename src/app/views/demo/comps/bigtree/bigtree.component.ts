import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { IMFXControlsTreeComponent } from '../../../../modules/controls/tree/imfx.tree';
import { HttpService } from '../../../../services/http/http.service';

@Component({
    selector: 'demo-date-formats',
    templateUrl: './tpl/index.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class BigtreeComponent {
    public componentContext: any = this;
    @ViewChild('tree', {static: true}) public tree: IMFXControlsTreeComponent;
    // private currentDate = new Date();
    // @ViewChild('controlaSasasdasd', {static: false}) private control: any;
    public text: string = '';

    constructor(private httpService: HttpService, private cdr: ChangeDetectorRef) {
    }


    beforeExpand($event) {
        // if($event.data.node.expanded){
        //     return;
        // }
        // let id = $event.data.node.data.dirtyObj.Id;
        // this.httpService.get('/api/v3/group/' + id + '/children').subscribe((res: any) => {
        //     debugger
        //     const data = this.tree.turnArrayOfObjectToStandart(res.body, {
        //         key: 'Id',
        //         title: 'Name',
        //         children: 'Children'
        //     });
        //     debugger
        //     this.tree.setSource(data);
        // });
    }

    ngAfterViewInit() {
        // this.tree.getTree().setExpanded(true)
        // debugger

    }

}
