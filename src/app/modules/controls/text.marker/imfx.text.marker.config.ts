
export class TextMarkerSettings {
  filterText?: string;
  selectedItem?: number;
  maxItems?: number;
  showResults?: boolean;
  arrOfResults?: any;
}

export class TextMarkerConfig {
  /**
   * Context of top component
   */
  public componentContext: any;

  public moduleContext?: any;
  /**
   * Model of settings
   * @type {{}}
   */
  public options: TextMarkerSettings = {
    selectedItem: -1
  };
}
