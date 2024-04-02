
export abstract class MLComponent {
    public parametersObservable: any;
    public checkId: any;
    public isPopout: boolean = false;

    ngOnInit(self) {
        location.hash = decodeURIComponent(location.hash);
        let matches = location.hash.match(new RegExp( 'gl-window' + '=([^&]*)' ) );
        if (!matches) {
            if (this.parametersObservable != null) {
                this.parametersObservable.unsubscribe();
            }
            self.config.options.provider.config = self.config;
            if (this.parametersObservable == null) {
                this.parametersObservable = self.route.params.subscribe(params => {
                    let id = +params['id'];
                    // let isFirstInit = !this.checkId;
                    if (id && id != this.checkId) {
                        this.checkId = id;
                        self.commonDetailInit(null);
                    }
                });
            }
        } else {
            this.isPopout = true;
            self.cd.detectChanges();
        }
    };
}
