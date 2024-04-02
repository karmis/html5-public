import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";

class ElementScroll {
  el: HTMLElement;
  scroll: number;
}

class ScrollStoreConfig {
  componentContext: any;
  router: Router;
  route: ActivatedRoute;
  storage: {
    [key: string]: ElementScroll
  };
}

export class ScrollStoreProvider {
  public config: ScrollStoreConfig = <ScrollStoreConfig>{};

  constructor(o: {
    compContext: any,
    router: Router,
    route: ActivatedRoute
  }) {
    this.config.componentContext = o.compContext;
    this.config.router = o.router;
    this.config.route = o.route;
    this.clearStorage();

    this.config.router.events.subscribe((event: NavigationEnd) => {
      if (event instanceof NavigationEnd && this.config.componentContext instanceof (this.config.route.component as Function)) {
        setTimeout(()=>{
          this.restoreAll();
        })
      }
    }, error => console.error(error));

    if (this.config.componentContext.resultsReady) {
      let subscription = this.config.componentContext.resultsReady.subscribe(()=>{
        setTimeout(()=>{
          this.restoreAll();
        })
        subscription.unsubscribe();
      })
    }
  }

  private restoreAll() {
    for (let key in this.config.storage) {
      let storageElement = this.config.storage[key];
      $(storageElement.el).scrollTop(storageElement.scroll);
    }
  }

  public clearStorage() {
    this.config.storage = {};
  }

  public storeScroll(key: string, el: HTMLElement) {
    this.config.storage[key] = <ElementScroll>{
      el: el,
      scroll: $(el).scrollTop()
    };
  }

  public handleScroll(key: string, el: HTMLElement) {
    let providerRef = this;
    $(el).scroll(()=>{
      providerRef.storeScroll(key, el);
    })
  }

}
