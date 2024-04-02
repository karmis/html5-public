export class JobStatuses {
  static None = 0;

  static Unknown = -1;
  static MAT_OUT = 1;
  static INT_MVMT_RQD = 2;
  static INT_MVMT_RAISED = 3;
  static WT_OTHR_TSK = 4;
  static WT_UNAVAIL = 5;
  static WT_DMAGED = 6; //hold if DMGD src...   //OTH_PROC
  static ON_HOLD = 7;
  //----------------------------------------------------------------------------
  static READY = 8; // READY=8
  static CANC = 9; // !=16
  static INPROG = 10;
  static SCHED = 11;
  static QUEUED = 12;
  static PAUSED = 13;
  static ASSGNED = 14;
  static COMPLETED = 15;
  static STARTED = 16;
  static RESUME = 17;
  static COMPL_BY_OTHR = 18;
  static FAILED = 19;
  static SRC_NF = 20;
  static ABORT = 21;
  static PEND = 22;
  static MOVED_TO_BATCH = 23;
  static PEND_DECISION = 24;
  static PEND_SUBTASK = 25;
  static Deleted = -9999
}
