import type { LifeData } from './types';

// Seed from full-life-control-seed-backup.json. Replace by importing your latest backup in More.
export const SEED = {
 "bills": [
  {
   "id": "rec_muiadwc1_vkvtn5",
   "title": "Cardiology Follow-up",
   "payee": "Riverside Medical Group",
   "originalBalance": 840,
   "remainingBalance": 840,
   "dueDate": "2026-09-22",
   "category": "Medical",
   "isRecurring": false,
   "createdAt": "2026-08-26T11:08:35.953Z",
   "updatedAt": "2026-08-26T11:08:35.953Z",
   "paymentHistory": []
  },
  {
   "id": "rec_muiadwc3_14t2zo",
   "title": "Homeowners Insurance",
   "payee": "Meridian Insurance Co.",
   "originalBalance": 1240,
   "remainingBalance": 0,
   "dueDate": "2026-09-06",
   "category": "Insurance",
   "isRecurring": true,
   "createdAt": "2026-04-26T11:08:35.953Z",
   "updatedAt": "2026-07-26T11:08:35.953Z",
   "paymentHistory": [
    {
     "amount": 1240,
     "date": "2026-07-26T11:08:35.953Z"
    }
   ]
  },
  {
   "id": "rec_muiadwc3_jfcc4g",
   "title": "Streaming Bundle",
   "payee": "StreamMax",
   "originalBalance": 24.99,
   "remainingBalance": 24.99,
   "dueDate": "2026-10-11",
   "category": "Subscriptions",
   "isRecurring": true,
   "createdAt": "2026-07-26T11:08:35.953Z",
   "updatedAt": "2026-07-26T11:08:35.953Z",
   "paymentHistory": []
  },
  {
   "id": "rec_muiadwc3_paueko",
   "title": "Auto Loan Payment",
   "payee": "Highland Credit Union",
   "originalBalance": 412.5,
   "remainingBalance": 412.5,
   "dueDate": "2026-09-17",
   "category": "Debt",
   "isRecurring": true,
   "createdAt": "2026-03-26T11:08:35.953Z",
   "updatedAt": "2026-06-26T11:08:35.953Z",
   "paymentHistory": [
    {
     "amount": 412.5,
     "date": "2026-06-26T11:08:35.953Z"
    }
   ]
  },
  {
   "id": "rec_muiadwc3_rtauiq",
   "title": "HVAC Repair",
   "payee": "Coastal Home Services",
   "originalBalance": 560,
   "remainingBalance": 280,
   "dueDate": "2026-10-02",
   "category": "Housing",
   "isRecurring": false,
   "createdAt": "2026-08-26T11:08:35.953Z",
   "updatedAt": "2026-09-26T11:08:35.953Z",
   "paymentHistory": [
    {
     "amount": 280,
     "date": "2026-09-26T11:08:35.953Z"
    }
   ]
  },
  {
   "id": "rec_muiadwc3_v6x9jl",
   "title": "Electric Service",
   "payee": "Pacific Power & Light",
   "originalBalance": 220,
   "remainingBalance": 150,
   "dueDate": "2026-09-28",
   "category": "Utilities",
   "isRecurring": true,
   "createdAt": "2026-05-26T11:08:35.953Z",
   "updatedAt": "2026-08-26T11:08:35.953Z",
   "paymentHistory": [
    {
     "amount": 70,
     "date": "2026-08-26T11:08:35.953Z"
    }
   ]
  }
 ],
 "decisions": [
  {
   "id": "d1",
   "title": "Simplify my weekly planning system",
   "context": "Too much administrative overhead.",
   "expectedOutcome": "More execution with less friction.",
   "confidence": 80,
   "risk": "Low",
   "reviewDate": "2026-09-17",
   "actualOutcome": "",
   "lessons": "",
   "createdAt": 1788457404135,
   "updatedAt": "2026-09-30T11:35:06.828Z"
  },
  {
   "id": "s00u9s2d",
   "title": "Switch to index fund allocation",
   "context": "Rebalanced brokerage away from single stocks.",
   "expectedOutcome": "Lower volatility, steady growth.",
   "confidence": 75,
   "risk": "Low",
   "reviewDate": "2026-10-26",
   "reviewed": false,
   "createdAt": "2026-09-30T11:35:06.828Z",
   "updatedAt": "2026-09-30T11:35:06.828Z"
  },
  {
   "id": "zz9cdrnm",
   "title": "Take on new client project",
   "context": "Accepted a 3-month contract alongside full-time work.",
   "expectedOutcome": "Extra income, tight schedule.",
   "confidence": 60,
   "risk": "Medium",
   "reviewDate": "2026-10-06",
   "reviewed": false,
   "createdAt": "2026-09-30T11:35:06.829Z",
   "updatedAt": "2026-09-30T11:35:06.829Z"
  }
 ],
 "loops": [
  {
   "id": "cm07me4r",
   "title": "Finish LifeOS dashboard widgets",
   "status": "active",
   "createdDate": "2026-09-22",
   "eventId": null,
   "createdAt": "2026-09-30T11:35:06.826Z",
   "updatedAt": "2026-09-30T11:35:06.826Z"
  },
  {
   "id": "fz6gnlzt",
   "title": "Follow up with Marcus re: intro",
   "status": "waiting",
   "createdDate": "2026-09-06",
   "eventId": null,
   "createdAt": "2026-09-30T11:35:06.826Z",
   "updatedAt": "2026-09-30T11:35:06.826Z"
  },
  {
   "id": "grvks72k",
   "title": "Send Q3 report to James",
   "status": "complete",
   "createdDate": "2026-09-01",
   "eventId": null,
   "createdAt": "2026-09-30T11:35:06.826Z",
   "updatedAt": "2026-09-30T11:35:06.826Z"
  },
  {
   "id": "h4lkxqu7",
   "title": "Next visit 11/11/26 in Lagrange",
   "status": "open",
   "createdDate": "2026-09-26",
   "eventId": "1amve5u5",
   "createdAt": "2026-09-30T11:35:06.827Z",
   "updatedAt": "2026-09-30T11:35:06.827Z"
  },
  {
   "id": "l1",
   "title": "Schedule annual maintenance",
   "status": "Open",
   "priority": "Medium",
   "dueDate": "2026-09-08",
   "notes": "",
   "eventIds": [
    "e2"
   ],
   "createdAt": 1788457404135,
   "updatedAt": "2026-09-30T11:35:06.827Z"
  },
  {
   "id": "l2",
   "title": "Review investment allocation",
   "status": "Active",
   "priority": "High",
   "dueDate": "2026-09-13",
   "notes": "",
   "eventIds": [],
   "createdAt": 1788457404135,
   "updatedAt": "2026-09-30T11:35:06.827Z"
  },
  {
   "id": "l3",
   "title": "Send follow-up",
   "status": "Waiting",
   "priority": "Low",
   "dueDate": "",
   "notes": "",
   "eventIds": [
    "e3"
   ],
   "createdAt": 1788457404135,
   "updatedAt": "2026-09-30T11:35:06.827Z"
  },
  {
   "id": "t5hg42lo",
   "title": "Book physical therapy eval",
   "status": "waiting",
   "createdDate": "2026-09-10",
   "eventId": null,
   "createdAt": "2026-09-30T11:35:06.827Z",
   "updatedAt": "2026-09-30T11:35:06.827Z"
  },
  {
   "id": "vpxbyf8s",
   "title": "Schedule dentist appointment",
   "status": "open",
   "createdDate": "2026-09-17",
   "eventId": null,
   "createdAt": "2026-09-30T11:35:06.828Z",
   "updatedAt": "2026-09-30T11:35:06.828Z"
  },
  {
   "id": "y25bkd14",
   "title": "Review client contract terms",
   "status": "blocked",
   "createdDate": "2026-09-08",
   "eventId": null,
   "createdAt": "2026-09-30T11:35:06.828Z",
   "updatedAt": "2026-09-30T11:35:06.828Z"
  },
  {
   "id": "yo7npyww",
   "title": "Renew car registration",
   "status": "open",
   "createdDate": "2026-09-24",
   "eventId": null,
   "createdAt": "2026-09-30T11:35:06.828Z",
   "updatedAt": "2026-09-30T11:35:06.828Z"
  }
 ],
 "people": [
  {
   "id": "ryz7tphx",
   "name": "Marcus Chen",
   "relationship": "Mentor",
   "lastContact": "2026-09-01",
   "frequencyDays": 14,
   "createdAt": "2026-09-30T11:35:06.790Z",
   "updatedAt": "2026-09-30T11:35:06.790Z"
  }
 ],
 "insights": [
  {
   "id": "b8z3p0gh",
   "text": "No contact with Marcus Chen for 25 days.",
   "tone": "warning",
   "createdAt": "2026-09-30T11:35:06.829Z",
   "updatedAt": "2026-09-30T11:35:06.829Z"
  },
  {
   "id": "i1",
   "title": "Relationship momentum",
   "body": "Recent relationship events are consistent with your relationship goals.",
   "kind": "Relationship",
   "createdAt": 1788457404135,
   "updatedAt": "2026-09-30T11:35:06.829Z"
  },
  {
   "id": "i2",
   "title": "Execution opportunity",
   "body": "Several active loops can be converted into scheduled events.",
   "kind": "Execution",
   "createdAt": 1788457404135,
   "updatedAt": "2026-09-30T11:35:06.830Z"
  },
  {
   "id": "obs2jj2d",
   "text": "3 open loop(s) have been open more than 14 days.",
   "tone": "warning",
   "createdAt": "2026-09-30T11:35:06.830Z",
   "updatedAt": "2026-09-30T11:35:06.830Z"
  }
 ],
 "projects": [
  {
   "id": 1,
   "vehicleId": "xB",
   "title": "Front Suspension Refresh",
   "category": "Suspension & Steering",
   "budget": 250,
   "actualCost": 165.5,
   "completion": 66,
   "tasks": [
    {
     "name": "Ball Joints Replaced",
     "done": true
    },
    {
     "name": "Outer Tie Rods Installed",
     "done": true
    },
    {
     "name": "Front Wheel Alignment",
     "done": false
    }
   ],
   "createdAt": "2026-09-30T11:35:06.821Z",
   "updatedAt": "2026-09-30T11:35:06.821Z"
  },
  {
   "id": 2,
   "vehicleId": "Crosstrek",
   "title": "Differential Fluid Gear Service",
   "category": "Fluid Service",
   "budget": 90,
   "actualCost": 72,
   "completion": 50,
   "tasks": [
    {
     "name": "Front Diff Fluid Drain & Fill",
     "done": true
    },
    {
     "name": "Rear Diff Fluid Drain & Fill",
     "done": false
    }
   ],
   "createdAt": "2026-09-30T11:35:06.822Z",
   "updatedAt": "2026-09-30T11:35:06.822Z"
  },
  {
   "id": 201,
   "vehicleId": "xB",
   "title": "Front Suspension Overhaul",
   "category": "Suspension",
   "budget": 350,
   "actualCost": 310,
   "status": "In Progress",
   "priority": "High",
   "dueDate": "2026-09-01",
   "completion": 60,
   "tasks": [
    {
     "name": "Replace Outer Tie Rods",
     "done": true
    },
    {
     "name": "Install Lower Control Arms",
     "done": false
    }
   ],
   "createdAt": "2026-09-30T11:35:06.822Z",
   "updatedAt": "2026-09-30T11:35:06.822Z"
  },
  {
   "id": 202,
   "vehicleId": "Crosstrek",
   "title": "Rear Differential Service",
   "category": "Fluid Service",
   "budget": 120,
   "actualCost": 85,
   "status": "Planned",
   "priority": "Medium",
   "dueDate": "2026-10-15",
   "completion": 0,
   "tasks": [],
   "createdAt": "2026-09-30T11:35:06.822Z",
   "updatedAt": "2026-09-30T11:35:06.822Z"
  }
 ],
 "goals": [
  {
   "id": "6h6hju88",
   "title": "Reach $150k net worth",
   "level": "annual",
   "progress": 62,
   "createdAt": "2026-09-30T11:35:06.823Z",
   "updatedAt": "2026-09-30T11:35:06.823Z"
  },
  {
   "id": "6r1psomj",
   "title": "Run a half marathon",
   "level": "annual",
   "progress": 40,
   "createdAt": "2026-09-30T11:35:06.824Z",
   "updatedAt": "2026-09-30T11:35:06.824Z"
  },
  {
   "id": "8uowevlo",
   "title": "Train 12 runs",
   "level": "monthly",
   "progress": 33,
   "createdAt": "2026-09-30T11:35:06.824Z",
   "updatedAt": "2026-09-30T11:35:06.824Z"
  },
  {
   "id": "f1fd12gw",
   "title": "Save $6,000",
   "level": "quarterly",
   "progress": 55,
   "createdAt": "2026-09-30T11:35:06.824Z",
   "updatedAt": "2026-09-30T11:35:06.824Z"
  },
  {
   "id": "g1",
   "name": "Annual: Build a balanced life",
   "level": "Annual",
   "parentId": null,
   "progress": 42,
   "createdAt": 1788457404135,
   "updatedAt": "2026-09-30T11:35:06.825Z"
  },
  {
   "id": "g2",
   "name": "Quarterly: Improve execution",
   "level": "Quarterly",
   "parentId": "g1",
   "progress": 61,
   "createdAt": 1788457404135,
   "updatedAt": "2026-09-30T11:35:06.825Z"
  },
  {
   "id": "g3",
   "name": "Monthly: Strengthen relationships",
   "level": "Monthly",
   "parentId": "g1",
   "progress": 74,
   "createdAt": 1788457404135,
   "updatedAt": "2026-09-30T11:35:06.825Z"
  },
  {
   "id": "ju0ytv7f",
   "title": "Ship LifeOS v1",
   "level": "quarterly",
   "progress": 70,
   "createdAt": "2026-09-30T11:35:06.825Z",
   "updatedAt": "2026-09-30T11:35:06.825Z"
  },
  {
   "id": "z8fysfj5",
   "title": "Weekly review 4x",
   "level": "weekly",
   "progress": 75,
   "createdAt": "2026-09-30T11:35:06.826Z",
   "updatedAt": "2026-09-30T11:35:06.826Z"
  }
 ]
} as unknown as LifeData;
