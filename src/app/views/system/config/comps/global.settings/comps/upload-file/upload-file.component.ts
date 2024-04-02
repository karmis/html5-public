import {
    Component, ComponentRef, ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';

@Component({
    selector: 'app-upload-file',
    templateUrl: './tpl/index.html',
    styleUrls: ['./styles/index.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class UploadFileComponent implements OnInit, OnChanges{
    @ViewChild('fileInput', {static: false}) fileInput;
    @ViewChild('previewImg', {static: false}) previewImg;
    @Output() onChange = new EventEmitter();
    @Input() typeImg: 'small'|'search'|'back';
    @Input() src: '';

    constructor(private ref: ElementRef) {
    }

    ngOnInit(): void {
        console.log(this.src);
    }
    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
    }

    uploadFile(e) {
        const self = this;
        const files = e.target.files;
        // for (let index = 0; index < files.length; index++) {
        //     const element = files[index];
        //     this.files.push(element);
        // }
        var reader = new FileReader();

        reader.onload = function (e: any) {
            const base = e.target.result.split('base64,')[1];
            self.onChange.emit(base);
            self.fileInput.nativeElement.value = '';
            self.src = base;
            // self.previewImg.nativeElement.src = e.target.result
            // $('#blah')
            //     .attr('src', )
            //     .width(150)
            //     .height(200);
        };

        reader.readAsDataURL(files[0]);

    }

    deleteAttachment() {
        this.src = '';
        this.onChange.emit(null);
        this.fileInput.nativeElement.value = '';
    }

    getClassImg() {
        let classes = ''
        if(this.typeImg === 'small') {
            classes =  'main-logo'
        }
        if(this.typeImg === 'search') {
            classes = 'search-form-logo'
        }
        if(this.typeImg === 'back') {
            classes = 'back';
            $(this.ref.nativeElement).find('#filedrop-for-aspera').css({'height': '100px'});
        }
        return classes
    }
}
