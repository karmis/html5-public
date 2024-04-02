
export class ProductionStatuses {
    static NONE = 0;
    static WISH = 1;
    static AWAITING_APPROVAL = 2;
    static NOT_STARTED = 3;
    static STARTED = 4;
    static RESTARTED = 5;
    static PUBLISHING_EDL = 6;
    static IN_PRODUCTION = 7;
    static REJECTED = 8;
    static COMPLETED = 9;
    static FAILED = 10;
    static ABORTED = 11;
}

// for production page
export const productionStatuses = [
    {
        "status": 0,
        "value": "None"
    },
    {
        "status": 1,
        "value": "Wish"
    },
    {
        "status": 2,
        "value": "Awaiting Approval"
    },
    {
        "status": 3,
        "value": "Not Started"
    },
    {
        "status": 4,
        "value": "Started"
    },
    {
        "status": 5,
        "value": "Restarted"
    },
    {
        "status": 6,
        "value": "Publishing EDL"
    },
    {
        "status": 7,
        "value": "In Production"
    },
    {
        "status": 8,
        "value": "Rejected"
    },
    {
        "status": 9,
        "value": "Completed"
    },
    {
        "status": 10,
        "value": "Failed"
    }
]