// /**
//  * Created by Pavel on 22.02.2017.
//  */

// import { TestBed, async, inject } from '@angular/core/testing';
// import { HttpModule } from '@angular/http';
// import { XMLService } from '../../../../../services/xml/xml.service';
// import { HttpService } from '../../../../../services/http/http.service';
// import { Router } from '@angular/router';
// import { IMFXXMLNode } from '../imfx.xml.node';
// import { IMFXXMLTree } from '../imfx.xml.tree';
// import { ErrorManager } from '../../../../error/error.manager';
// import { ArrayProvider } from '../../../../../providers/common/array.provider';
// import { DebounceProvider } from '../../../../../providers/common/debounce.provider';
// import { ModalProvider } from '../../../../modal/providers/modal.provider';
// import { StringProivder } from '../../../../../providers/common/string.provider';
// import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
// import { SecurityService } from '../../../../../services/security/security.service';
// import { ProfileService } from '../../../../../services/profile/profile.service';
// import { LoginService } from '../../../../../services/login/login.service';
// import { Renderer } from '@angular/core';
// import { OverrideTypes } from '../../overrides/override.types';
// import { TextOverride } from '../../overrides/text.override';
// import { EnumOverride } from '../../overrides/enum.override';
// import { NoeditOverride } from '../../overrides/noedit.override';
// import { DefaultOverride } from '../../overrides/default.override';
// import { ITreeNode } from 'angular-tree-component/dist/defs/api';
// import { TreeModel, TreeNode } from 'angular-tree-component';
// import { ErrorManagerProvider } from "../../../../error/providers/error.manager.provider";

// xdescribe('(unit) IMFX XML Node class', () => {

//   let xmlTree;
//   // let xmlNode;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpModule],
//       providers: [
//         // IMFXControlsDateTimePickerComponent,
//         ArrayProvider,
//         DebounceProvider,
//         ErrorManagerProvider,
//         ModalProvider,
//         StringProivder,
//         HttpService,
//         LocalStorageService,
//         LoginService,
//         ProfileService,
//         SecurityService,
//         SessionStorageService,
//         XMLService,
//         ErrorManager,
//         {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
//       ]
//     });
//     (<any>window).IMFX_API_URL = 'http://192.168.90.39';
//   });

//   describe('(unit) 1. Override', () => {
//     let resultTree;

//     it('(unit) Should get xml data', async(inject([XMLService], (xmlService) => {
//       xmlService.getXmlData(1340).subscribe((res: any) => {
//         resultTree = res;
//       });
//     })));

//     it('(unit) 1.2 Should get values in combobox are equal to values in the Override', async(() => {
//       let schemaModel = resultTree.SchemaModel;
//       let xmlModel = resultTree.XmlModel;

//       schemaModel.SchemaOverrides = schemaModel.SchemaOverrides || [];

//       let overrides = schemaModel.SchemaOverrides.map((currentOverride) => {
//         if (currentOverride.OverrideType === OverrideTypes.TEXT) {
//           return new TextOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.ENUM) {
//           return new EnumOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.NOEDIT) {
//           return new NoeditOverride(currentOverride);
//         } else {
//           return new DefaultOverride(currentOverride);
//         }
//       });

//       xmlTree = new IMFXXMLTree(resultTree.XmlModel, resultTree.SchemaModel);
//       expect(xmlTree.nodes[0].children[3].xml.Schema.SchemaItemType).toEqual('Enumeration');

//       xmlTree.nodes[0].children[3].xml.EnumItems = [];
//       expect(xmlTree.nodes[0].children[3].xml.EnumItems).toEqual([]);
//       xmlTree.nodes[0].children[3].xml.DisplayName = null;
//       expect(xmlTree.nodes[0].children[3].xml.DisplayName).toEqual(null);

//       xmlTree.nodes[0].children[3].xml.overrided = false;
//       xmlTree.nodes[0].children[3].xml.setOverrides(overrides);

//       let obj = overrides[4].externalOverride.EnumValues;
//       let arr = Object.keys(obj).map(function (key) {
//         let object = {
//           Id: key,
//           Value: obj[key]
//         };
//         return object;
//       });

//       expect(xmlTree.nodes[0].children[3].xml.EnumItems).toEqual(arr);
//       expect(xmlTree.nodes[0].children[3].xml.DisplayName).toEqual('Test List');
//     }));

//     it('(unit) 1.1 Should get Should get label that is equal to the text from override', async(() => {
//       let schemaModel = resultTree.SchemaModel;
//       let xmlModel = resultTree.XmlModel;

//       schemaModel.SchemaOverrides = schemaModel.SchemaOverrides || [];

//       let overrides = schemaModel.SchemaOverrides.map((currentOverride) => {
//         if (currentOverride.OverrideType === OverrideTypes.TEXT) {
//           return new TextOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.ENUM) {
//           return new EnumOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.NOEDIT) {
//           return new NoeditOverride(currentOverride);
//         } else {
//           return new DefaultOverride(currentOverride);
//         }
//       });

//       xmlTree = new IMFXXMLTree(resultTree.XmlModel, resultTree.SchemaModel);
//       expect(xmlTree.nodes[0].children[2].xml.Schema.SchemaItemType).toEqual('Boolean');

//       xmlTree.nodes[0].children[2].xml.DisplayName = null;
//       expect(xmlTree.nodes[0].children[2].xml.DisplayName).toEqual(null);

//       xmlTree.nodes[0].children[2].xml.overrided = false;
//       xmlTree.nodes[0].children[2].xml.setOverrides(overrides);
//       expect(xmlTree.nodes[0].children[2].xml.DisplayName).toEqual('Example of a Boolean setting');
//     }));

//     xit('(unit) 1.3 Should get test 3', async(() => {
//       let schemaModel = resultTree.SchemaModel;
//       let xmlModel = resultTree.XmlModel;

//       schemaModel.SchemaOverrides = schemaModel.SchemaOverrides || [];

//       let overrides = schemaModel.SchemaOverrides.map((currentOverride) => {
//         if (currentOverride.OverrideType === OverrideTypes.TEXT) {
//           return new TextOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.ENUM) {
//           return new EnumOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.NOEDIT) {
//           return new NoeditOverride(currentOverride);
//         } else {
//           return new DefaultOverride(currentOverride);
//         }
//       });

//       xmlTree = new IMFXXMLTree(resultTree.XmlModel, resultTree.SchemaModel);
//       expect(xmlTree.nodes[0].xml.Schema.SchemaItemType).toEqual('Sequence');

//       xmlTree.nodes[0].xml.DisplayName = null;
//       expect(xmlTree.nodes[0].xml.DisplayName).toEqual(null);

//       xmlTree.nodes[0].xml.overrided = false;
//       xmlTree.nodes[0].xml.setOverrides(overrides);
//       expect(xmlTree.nodes[0].xml.DisplayName).toEqual('ExampleFnetAdapterSettings');
//     }));

//     xit('(unit) 1.13 Should get test 13', async(() => {
//       /*debugger*/;
//       let schemaModel = resultTree.SchemaModel;
//       let xmlModel = resultTree.XmlModel;
//       // let xmlNode = new IMFXXMLNode;

//       schemaModel.SchemaOverrides = schemaModel.SchemaOverrides || [];

//       let overrides = schemaModel.SchemaOverrides.map((currentOverride) => {
//         if (currentOverride.OverrideType === OverrideTypes.TEXT) {
//           return new TextOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.ENUM) {
//           return new EnumOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.NOEDIT) {
//           return new NoeditOverride(currentOverride);
//         } else {
//           return new DefaultOverride(currentOverride);
//         }
//       });

//       xmlTree = new IMFXXMLTree(resultTree.XmlModel, resultTree.SchemaModel);
//       expect(xmlTree.nodes[0].children[7].children[0].xml.Schema.SchemaItemType).toEqual('Sequence');

//       xmlTree.nodes[0].children[7].children[0].xml.DisplayName = null;
//       expect(xmlTree.nodes[0].children[7].children[0].xml.DisplayName).toEqual(null);

//       xmlTree.nodes[0].children[7].children[0].xml.overrided = false;
//       xmlTree.nodes[0].children[7].children[0].xml.setOverrides(overrides);
//       expect(xmlTree.nodes[0].children[7].children[0].xml.DisplayName).toEqual('FlashNetActionSettings');
//     }));

//     xit('(unit) 1.14 Should get test 14', async(() => {
//       let schemaModel = resultTree.SchemaModel;
//       let xmlModel = resultTree.XmlModel;
//       // let xmlNode = new IMFXXMLNode;

//       schemaModel.SchemaOverrides = schemaModel.SchemaOverrides || [];

//       let overrides = schemaModel.SchemaOverrides.map((currentOverride) => {
//         if (currentOverride.OverrideType === OverrideTypes.TEXT) {
//           return new TextOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.ENUM) {
//           return new EnumOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.NOEDIT) {
//           return new NoeditOverride(currentOverride);
//         } else {
//           return new DefaultOverride(currentOverride);
//         }
//       });

//       xmlTree = new IMFXXMLTree(resultTree.XmlModel, resultTree.SchemaModel);
//       expect(xmlTree.nodes[0].children[7].xml.Schema.SchemaItemType).toEqual('Enumeration');

//       xmlTree.nodes[0].children[7].xml.EnumItems = [];
//       expect(xmlTree.nodes[0].children[7].xml.EnumItems).toEqual([]);
//       xmlTree.nodes[0].children[7].xml.DisplayName = null;
//       expect(xmlTree.nodes[0].children[7].xml.DisplayName).toEqual(null);

//       let override = [];
//       override[0] = overrides[7];
//       override[1] = overrides[4];

//       xmlTree.nodes[0].children[7].xml.overrided = false;
//       xmlTree.nodes[0].children[7].xml.setOverrides(override);

//       let obj = overrides[4].externalOverride.EnumValues;
//       let arr = Object.keys(obj).map(function (key) {
//         let object = {
//           Id: key,
//           Value: obj[key]
//         };
//         return object;
//       });

//       expect(xmlTree.nodes[0].children[7].xml.EnumItems).toEqual(arr);
//       expect(xmlTree.nodes[0].children[7].xml.DisplayName).toEqual('Test List');
//     }));

//     xit('(unit) 1.15 Should get test 15', async(() => {
//       /*debugger*/;

//       let schemaModel = resultTree.SchemaModel;
//       let xmlModel = resultTree.XmlModel;

//       schemaModel.SchemaOverrides = schemaModel.SchemaOverrides || [];

//       let overrides = schemaModel.SchemaOverrides.map((currentOverride) => {
//         if (currentOverride.OverrideType === OverrideTypes.TEXT) {
//           return new TextOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.ENUM) {
//           return new EnumOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.NOEDIT) {
//           return new NoeditOverride(currentOverride);
//         } else {
//           return new DefaultOverride(currentOverride);
//         }
//       });

//       xmlTree = new IMFXXMLTree(resultTree.XmlModel, resultTree.SchemaModel);
//       let xmlNode = new IMFXXMLNode(xmlTree.nodes[0].children[7].xml, overrides);

//       xmlNode.addChild(true);
// 	  //
//       // xmlTree.nodes[0].children[7].children = xmlNode.Children;

//       expect(xmlTree.nodes[0].children[7].xml.Schema.SchemaItemType).toEqual('Sequence');

//       xmlTree.nodes[0].children[7].xml.DisplayName = null;
//       expect(xmlTree.nodes[0].children[7].xml.DisplayName).toEqual(null);

//       xmlTree.nodes[0].children[7].xml.overrided = false;
//       xmlTree.nodes[0].children[7].xml.setOverrides(overrides);

//       expect(xmlTree.nodes[0].children[7].xml.DisplayName).toEqual('Action Settings');
//     }));
//   });

//   describe('(unit) 2. Serialization', () => {
//     let resultTree;

//     it('(unit) Should get xml data', async(inject([XMLService], (xmlService) => {
//       xmlService.getXmlData(1340).subscribe((res: any) => {
//         resultTree = res;
//       });
//     })));

//     it('(unit) 4.1 Should get a serialized object for type Boolean equal to false', async(() => {
//       xmlTree = new IMFXXMLTree(resultTree.XmlModel, resultTree.SchemaModel);

//       let seril1 = xmlTree.getSerializedTree();

//       expect(seril1).toBe('');

//       xmlTree.nodes[0].children[2].xml.Value = false;
//       let seril2 = '/ExampleFnetAdapterSettings/ExampleFnetAdapterSettingBoolean[1];false';

//       expect(xmlTree.getSerializedTree()).toBe(seril2);
//     }));

//     it('(unit) 4.2 Should get serialized object that return empty string', async(() => {
//       xmlTree = new IMFXXMLTree(resultTree.XmlModel, resultTree.SchemaModel);

//       let seril1 = xmlTree.getSerializedTree();

//       expect(seril1).toBe('');

//       xmlTree.nodes[0].children[0].xml.Value = '';
//       let seril2 = '';

//       expect(xmlTree.getSerializedTree()).toBe(seril2);
//     }));

//     it('(unit) 4.3 Should get a serialized object for type Number equal to 0', async(() => {
//       xmlTree = new IMFXXMLTree(resultTree.XmlModel, resultTree.SchemaModel);

//       let seril1 = xmlTree.getSerializedTree();

//       expect(seril1).toBe('');

//       xmlTree.nodes[0].children[7].children[0].children[1].xml.Value = 0;
//       let seril2 = '/ExampleFnetAdapterSettings/ActionSettings/FlashNetActionSettings/ActionNumber[1];0';

//       expect(xmlTree.getSerializedTree()).toBe(seril2);
//     }));

//     it('(unit) 4.4 Should get serialized object that return empty string', async(() => {
//       xmlTree = new IMFXXMLTree(resultTree.XmlModel, resultTree.SchemaModel);

//       let seril1 = xmlTree.getSerializedTree();

//       expect(seril1).toBe('');

//       xmlTree.nodes[0].children[2].xml.Value = undefined;
//       let seril2 = '';

//       expect(xmlTree.getSerializedTree()).toBe(seril2);
//     }));

//     it('(unit) 4.5 Should get serialized object where two identical objects', async(() => {
//       xmlTree = new IMFXXMLTree(resultTree.XmlModel, resultTree.SchemaModel);

//       let schemaModel = resultTree.SchemaModel;
//       let xmlModel = resultTree.XmlModel;

//       schemaModel.SchemaOverrides = schemaModel.SchemaOverrides || [];

//       let overrides = schemaModel.SchemaOverrides.map((currentOverride) => {
//         if (currentOverride.OverrideType === OverrideTypes.TEXT) {
//           return new TextOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.ENUM) {
//           return new EnumOverride(currentOverride);
//         } else if (currentOverride.OverrideType === OverrideTypes.NOEDIT) {
//           return new NoeditOverride(currentOverride);
//         } else {
//           return new DefaultOverride(currentOverride);
//         }
//       });

//       let xmlNode = new IMFXXMLNode(xmlTree.nodes[0].children[7].xml, overrides);

//       xmlNode.addChild(true);

//       let renderer: Renderer;
//       // let treeModel = new TreeModel(renderer);
//       let treeModel = new TreeModel(renderer);
//       let node = new TreeNode(xmlTree.nodes[0].children[7], null, treeModel, 1);

//       node.data = xmlTree.nodes[0].children[7];

//       let data = {
//         node,
//         xml: xmlNode
//       };

//       xmlTree.updateTree(data);

//       let seril1 = xmlTree.getSerializedTree();

//       expect(seril1).toBe('');

//       xmlTree.nodes[0].children[7].children[0].children[0].xml.Value = 'Hello';
//       xmlTree.nodes[0].children[7].children[1].children[0].xml.Value = 'Hello';
//       let seril2 = '/ExampleFnetAdapterSettings/ActionSettings/FlashNetActionSettings/ActionName[1];Hello;' +
//         '/ExampleFnetAdapterSettings/ActionSettings/FlashNetActionSettings/ActionName[2];Hello';

//       expect(xmlTree.getSerializedTree()).toBe(seril2);
//     }));
//   });

//   xdescribe('(unit) 3. Node', () => {
//     let resultTree;

//     it('(unit) Should get xml data', async(inject([XMLService], (xmlService) => {
//       xmlService.getXmlData(1340).subscribe((res: any) => {
//         resultTree = res;
//       });
//     })));
//   });

//   xdescribe('(unit) 4. Shema Item Types', () => {
//     let resultTree;

//     it('(unit) Should get xml data', async(inject([XMLService], (xmlService) => {
//       xmlService.getXmlData(1340).subscribe((res: any) => {
//         resultTree = res;
//       });
//     })));
//   });
// });
