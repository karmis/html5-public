/**
 * Created by Pavel on 28.01.2017.
 */

export class IMFXXMLSchema {
  constructor() {
  }

  // TODO: make private and add getters and setters
  public Id: string;
  public Name: string;
  public SchemaItemType: string; // TODO: use enum?
  public XPath: string;
  public Optional: boolean;
  public MinOccurs: number;
  public MaxOccurs: number;
  public InsertIndex?: number;
  public ItemsLeft?: number; // TODO: incapsulate this logic. shows how many times left for this item to be used in a tree
  public Children: IMFXXMLSchema[];
  public EnumItems?: any[];
  public Value?: any;


}
