import {AbstractOverride} from "./abstract.override";
import {IMFXXMLNode} from "../model/imfx.xml.node";
import {OverrideTypes} from "./override.types";


export class LengthOverride extends AbstractOverride {
  public override (node: IMFXXMLNode) {
    // node.EnumItems = [];
    // node.IsOverridedNode = true;
    // for (var k in this.externalOverride.EnumValues) {
    //   node.EnumItems.push({
    //     Id: k,
    //     Value: this.externalOverride.EnumValues[k]
    //   })
    // }
      if((<any>this.externalOverride).OverrideType == OverrideTypes.MINLENGTH)
        node.MinLengthLimit = this.externalOverride.Value;
      if((<any>this.externalOverride).OverrideType == OverrideTypes.MAXLENGTH)
        node.MaxLengthLimit = this.externalOverride.Value;
  }
}
