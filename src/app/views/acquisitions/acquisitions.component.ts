import {
    ChangeDetectorRef,
    Component, ElementRef, HostListener, Injector, ViewChild, ViewEncapsulation
} from '@angular/core';

import { Router } from '@angular/router';
import { ViewsProvider } from '../../modules/search/views/providers/views.provider';
import { AcquisitionService } from './services/acquisition.service';
import { appRouter } from '../../constants/appRouter';
import { OverlayComponent } from '../../modules/overlay/overlay';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'acquisitions',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
      AcquisitionService
    ]
})

export class AcquisitionsComponent {

    @ViewChild('tableHeader', {read: ElementRef, static: false }) tableHeader:ElementRef;
    @ViewChild('tableBody', {read: ElementRef, static: false }) tableBody:ElementRef;
    @ViewChild('overlayWrapper', {static: false}) overlayWrapper: any;
    @ViewChild('overlay', {static: false}) overlay: OverlayComponent;
    public datetimeFullFormatLocaldatePipe: string = 'DD/MM/YYYY HH:mm';
    private searchValue = '';
    private data = [];
    private noResults: boolean = false;

    constructor(protected viewsProvider: ViewsProvider,
                protected service: AcquisitionService,
                protected router: Router,
                protected cdr: ChangeDetectorRef,
                protected injector: Injector,
                private translate: TranslateService
    ) {
        this.translate.get('common.date_time_full_format_localdate_pipe').subscribe(
            (res: string) => {
                this.datetimeFullFormatLocaldatePipe = res;
            });
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
      setTimeout(()=>{
        this.resizeHandler();
      },0);
    }

    searchFakeData(e) {
      if(e && e.keyCode == 13 && this.searchValue.trim().length > 0) {
        this.doSearch();
      }
      else if(!e && this.searchValue.trim().length > 0) {
        this.doSearch();
      }
    }

    doSearch() {
      this.overlay.show(this.overlayWrapper.nativeElement);
      // $(this.overlayWrapper.nativeElement).show();
      const self = this;
      this.noResults = false;
      this.service.getData(this.searchValue.trim()).subscribe((data) => {
        if (data && data.Data && data.Data.length > 0) {
            self.data = data.Data;
        } else {
            self.data = [];
            this.noResults = true;
        }
        self.cdr.detectChanges();
        setTimeout(() => {
          self.resizeHandler();
          self.overlay.hide(self.overlayWrapper.nativeElement);
          // $(self.overlayWrapper.nativeElement).hide();
        }, 0);
      });
    }

    goToWorkspace(id) {
      this.router.navigate([
        appRouter.acquisitions.workspace.replace('/:id', ''),
        id
      ]);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.resizeHandler();
    }

    resizeHandler() {
      if(this.tableHeader != undefined && this.tableBody != undefined) {
        // setTimeout(()=>{
        const headers = $(this.tableHeader.nativeElement).find('th');
        const rows = $(this.tableBody.nativeElement).find('.fake-rows');
        for(let i = 0; i < rows.length; i++) {
          rows[i].style.width = this.tableHeader.nativeElement.offsetWidth + 'px';
          const columns = $(rows[i]).find('.fake-cell');
          for(let j = 0; j < headers.length; j++) {
            columns[j].style.width = headers[j].offsetWidth + 'px';
          }
        }
        // },0);
          this.cdr.detectChanges();
      }
    }
}
