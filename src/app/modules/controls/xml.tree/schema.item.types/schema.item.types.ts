/**
 * Created by Pavel on 24.01.2017.
 */

export class SchemaItemTypes {
  constructor() {
    SchemaItemTypes._Boolean = "Boolean"; //0
    SchemaItemTypes._String = "String"; //1
    SchemaItemTypes._Number = "Number"; //2
    SchemaItemTypes._Date = "Date"; //3
    SchemaItemTypes._Time = "Time"; //4
    SchemaItemTypes._DateTime = "DateTime"; //5
    SchemaItemTypes._Enumeration = "Enumeration"; //6
    SchemaItemTypes._Sequence = "Sequence"; //7
    SchemaItemTypes._All = "All"; //8
    SchemaItemTypes._Choice = "Choice"; //9
  }
  private static _Boolean: string;
  private static _String: string;
  private static _Number: string;
  private static _Date: string;
  private static _Time: string;
  private static _DateTime: string;
  private static _Enumeration: string;
  private static _Sequence: string;
  private static _All: string;
  private static _Choice: string;

  get Choice(): string {
    return SchemaItemTypes._Choice;
  }
  get All(): string {
    return SchemaItemTypes._All;
  }
  get Sequence(): string {
    return SchemaItemTypes._Sequence;
  }
  get Enumeration(): string {
    return SchemaItemTypes._Enumeration;
  }
  get DateTime(): string {
    return SchemaItemTypes._DateTime;
  }
  get Time(): string {
    return SchemaItemTypes._Time;
  }
  get Date(): string {
    return SchemaItemTypes._Date;
  }
  get Number(): string {
    return SchemaItemTypes._Number;
  }
  get String(): string {
    return SchemaItemTypes._String;
  }
  get Boolean(): string {
    return SchemaItemTypes._Boolean;
  }

}
