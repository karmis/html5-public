import {AbstractOverride} from "./abstract.override";
import {IMFXXMLNode} from "../model/imfx.xml.node";


export class PatternOverride extends AbstractOverride {
  public override (node: IMFXXMLNode) {
      // node.EnumItems = [];
      // node.IsOverridedNode = true;
      // for (var k in this.externalOverride.EnumValues) {
      //   node.EnumItems.push({
      //     Id: k,
      //     Value: this.externalOverride.EnumValues[k]
      //   })
      // }
      node.PatternLimit = this.externalOverride.Value;
  }
}
