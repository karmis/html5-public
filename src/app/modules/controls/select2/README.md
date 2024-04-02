 Example
 ```ecmascript 6
     private tmpData = [
         {'text': 'label1', 'id': 'val1'},
         {'text': 'label4', 'id': 'val4'},
         {'text': 'label5', 'id': 'val5'},
         {'text': 'label6', 'id': 'val6'},
         {'text': 'label7', 'id': 'val7'},
         {'text': 'label8', 'id': 'val8'},
         {'text': 'label9', 'id': 'val9'},
         {'text': 'label10', 'id': 'val10'},
         {'text': 'label11', 'id': 'val11'},
     ];
 
     private selectedObjects = [
         {'text': 'label2', 'id': 'val2'},
         {'text': 'label3', 'id': 'val3'},
     ];
 
 
     private selectedIds = [
         'val8', 'val9'
     ]
 
     private selectedIds2 = [
         'val4', 'val5'
     ]
    @ViewChild('select2', {static: false}) select2: any; // element refernce 
    ngOnInit() {
        // Setup select2 example
        this.select2.setDefaultOptions({
            closeOnSelect: false,
            ajax: {
                url: "https://jsonplaceholder.typicode.com/posts",
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return {
                        q: params.term, // search term
                        page: params.page
                    };
                },
                processResults: function (data, params) {
                    return {
                        results: data
                    };
                },
            },
            escapeMarkup: this.escapeMarkup,
            templateSelection: this.templateSelection,
            templateResult: this.templateResult
        });
    }

    private escapeMarkup(markup) {
        return markup;
    }

    private templateResult(data) {
        return data.title;
    }

    private templateSelection(data) {
        if (data.loading) return data.text;

        var markup = "<div class='select2-result-repository clearfix'>" +
            "<div class='select2-result-repository__meta'>" +
            "<div class='select2-result-repository__title'>" + data.title + "</div>";

        if (data.description) {
            markup += "<div class='select2-result-repository__description'>" + data.body + "</div>";
        }

        markup += "<div class='select2-result-repository__statistics'>" +
            "<div class='select2-result-repository__forks'><i class='fa fa-flash'></i> " + data.userId + " </div>" +
            "</div>" +
            "</div></div>";

        return markup;
    }
    
    ngAfterViewInit() {
        this.select2.addSelectedObjects(this.selectedObjects);
        this.select2.addSelectedByIds(this.selectedIds);
        this.select2.clearSelected();
        this.select2.clearData();
        this.select2.addSelectedObjects(this.selectedObjects);
        this.select2.disable();
        this.select2.enable();
    }
```

```html
<imfx-controls-select2
        #select2
        [multiple]="true"
        [data]="tmpData"
></imfx-controls-select2>
```
