export class WorkOrdersStatuses {

  static Unknown = 0;
  static NO_MEDIA = 1;          //No Media
  static MEDIA_WRONG_LOC = 2;   //Has Media - Wrong Location
  static MEDIA_CORR_LOC = 3;    //Has Media - Correct Location
  static IN_PROG = 4;           //In Progress
  static COMPLETE = 5;          //Complete
  static PROBLEM = 6;           //Problem
}
export class WorkOrdersTextStatuses {
    static Unknown = 'Unknown';
    static NO_MEDIA = 'No Media';
    static MEDIA_WRONG_LOC = 'Has Media - Wrong Location';
    static MEDIA_CORR_LOC = 'Has Media - Correct Location';
    static IN_PROG = 'In Progress';
    static COMPLETE = 'Complete';
    static PROBLEM = 'Problem';
}
