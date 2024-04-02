/**
 * Created by Pavel on 24.01.2017.
 */
import {IMFXXMLNode} from "../model/imfx.xml.node";

export abstract class AbstractOverride {
  public XPath: string;
  constructor(protected externalOverride?: {
    XPath: string,
    Value: any,
    EnumValues? : any
  }) {
    if (this.externalOverride) {
      this.XPath = this.externalOverride.XPath;
    }
  }
  public abstract override (node: IMFXXMLNode);
}
