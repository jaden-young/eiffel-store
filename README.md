# ViCi

## Table of contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
  - [Install Meteor](#install-meteor)
  - [Install MongoDB](#install-mongodb)
  - [Import data to MongoDB](#import-data-to-mongodb)
- [How to use the app](#how-to-use-the-app)
  - [How to select a node](#how-to-select-a-node)
  - [How to select a time-interval](#how-to-select-a-time-interval)
  - [How to move between levels](#how-to-move-between-levels)
  - [How to find help](#how-to-find-help)
  - [How to read the graphs](#how-to-read-the-graphs)
- [How to develop](#how-to-develop)
- [API](#api)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation
 
### Install Meteor
https://www.meteor.com/install
https://guide.meteor.com/

### Install MongoDB
This is so you will be able to import the eiffel data.
https://docs.mongodb.com/manual/installation/

### Import data to MongoDB
If you have the data (named **events.json**) and the server is running, run the following command:

```
mongoimport --host localhost:3001 --jsonArray --drop --db meteor --collection eiffel-events --file "events.json"
```
If you want to download sample data, you can find it [here](https://gitlab.ida.liu.se/tddd96/visualization/blob/development/public/examples/eiffelevents.zip).



## How to use the app

### How to select a node
You select a node by simply klicking it, and when you do that a 
pop-up will appear. The pop-up will display more details about the node.

### How to select a time-interval
You select a time-interval by adjusting the start- and 
end-controls located below the graph in the level called 
"Aggregation".

### How to move between levels
You can move between levels easily by using the navigation bar
 located at the top right side of the screen. Each button is named
 according to the level it will take you to once pressed.
 
### How to find help
If you need information about what different components in the
app mean or what they do, you can click the icon 'i'.
This icon is found below the navigation bar that you 
use to navigate between the different parts of the application.

### How to read the graphs
The graphs contain nodes which represent events generated by
different parts of a CI-system. The events that are displayed
should be read from left to right with respect to time, meaning
that the node to the far right in the graph is the last 
event created chronologically in the selected time-interval.


## How to develop

## API

### Events v2.0
Events object example
```json
{
  "_id": "89Eh5RkmnmLKFQGew",
  "type": "TestCaseEvent",
  "name": "TC2",
  "id": "78a891f9-de5e-4329-8901-ef5cf1a3c45d",
  "links": [
    {
      "target": "a52186e6-f7da-4cdc-b814-3c313ce3f95b",
      "type": "CONTEXT"
    },
    {
      "target": "35003b9d-cdec-47d7-bb8c-102b6fe09f80",
      "type": "IUT"
    }
  ],
  "source": {
    "domainId": "example.domain"
  },
  "time": {
    "started": 1484006256072,
    "finished": 1484006306072
  },
  "data": {
    "testCase": {
      "id": "TC2",
      "uri": "http://tm.company.com/browse/TC2",
      "tracker": "My First Test Management System"
    },
    "customData": [
      {
        "value": "TCF2",
        "key": "name"
      },
      {
        "value": 4869,
        "key": "iteration"
      }
    ],
    "outcome": {
      "verdict": "PASSED",
      "conclusion": "SUCCESSFUL"
    }
  },
  "dev": {
  },
  "startEvent": "9b5b5acb-2858-4564-8711-968f3b14a9eb",
  "finishEvent": "78a891f9-de5e-4329-8901-ef5cf1a3c45d"
}
```

### EventSequences v2.0
EventSequences object example

```json
{
  "_id": "kjPcYgrSmjNzDPena",
  "id": 3,
  "time": {
    "started": 1484006941277,
    "finished": 1484006941278
  },
  "size": 2,
  "dev": {
  },
  "events": [
    {
      "_id": "7iYT53w7uYE7nf6CD",
      "type": "EiffelSourceChangeCreatedEvent",
      "name": "SCC1",
      "id": "b4f7774b-6d66-425a-8e12-d87eda06c939",
      "time": {
        "started": 1484006941277,
        "finished": 1484006941277
      },
      "links": [
        {
          "target": "6504e5d5-dbfe-403e-8e76-03244e9c24d6",
          "type": "BASE"
        }
      ],
      "source": {
        "domainId": "example.domain"
      },
      "data": {
        "gitIdentifier": {
          "repoUri": "https://repo.com",
          "branch": "topic-branch-4871",
          "repoName": "myRepo",
          "commitId": "fd090b60a4aedc5161da9c035a49b14a319829c5"
        },
        "author": {
          "id": "johnxxx",
          "group": "Team Gophers",
          "email": "john.doe@company.com",
          "name": "John Doe"
        },
        "customData": [
          {
            "value": "SCC1",
            "key": "name"
          },
          {
            "value": 4871,
            "key": "iteration"
          }
        ],
        "change": {
          "files": "https://filelist.com/4871",
          "insertions": 316,
          "deletions": 491
        }
      },
      "dev": {
        "checked": true
      },
      "targets": [],
      "dangerousTargets": [
        "6504e5d5-dbfe-403e-8e76-03244e9c24d6"
      ],
      "targetedBy": [
        "73baeb04-175a-43e0-aeac-68f3a888e1e3"
      ],
      "dangerousTargetedBy": [],
      "sequenceId": 3
    },
    {
      "_id": "3ygynmt6k63cxZNgi",
      "type": "EiffelSourceChangeSubmittedEvent",
      "name": "SCS1",
      "id": "73baeb04-175a-43e0-aeac-68f3a888e1e3",
      "time": {
        "started": 1484006941278,
        "finished": 1484006941278
      },
      "links": [
        {
          "target": "6504e5d5-dbfe-403e-8e76-03244e9c24d6",
          "type": "PREVIOUS_VERSION"
        },
        {
          "target": "b4f7774b-6d66-425a-8e12-d87eda06c939",
          "type": "CHANGE"
        }
      ],
      "source": {
        "domainId": "example.domain"
      },
      "data": {
        "gitIdentifier": {
          "repoUri": "https://repo.com",
          "branch": "master",
          "repoName": "myRepo",
          "commitId": "fd090b60a4aedc5161da9c035a49b14a319829b4"
        },
        "customData": [
          {
            "value": "SCS1",
            "key": "name"
          },
          {
            "value": 4871,
            "key": "iteration"
          }
        ],
        "submitter": {
          "id": "johnxxx",
          "group": "Team Gophers",
          "email": "john.doe@company.com",
          "name": "John Doe"
        }
      },
      "dev": {
        "checked": true
      },
      "targets": [
        "b4f7774b-6d66-425a-8e12-d87eda06c939"
      ],
      "dangerousTargets": [],
      "targetedBy": [],
      "dangerousTargetedBy": [
        "ab8bc045-1395-46c2-8d0e-dc8df7f12b37",
        "c293d64a-0c81-4acb-99b7-9626bb89947d"
      ],
      "sequenceId": 3
    }
  ],
  "connections": [
    1,
    4,
    5
  ]
}
```

### Rows v2.0
Rows object example
```json
{
  "_id": "h5bsLZR3jZu2GRX7G",
  "name": "Act2",
  "type": "ActivityEvent",
  "id": "75777798-797f-4d28-b0bb-bc999a6655e8",
  "sequenceId": 4497,
  "time": {
    "triggered": 1483374816797,
    "started": 1483374970997,
    "finished": 1483375101317
  },
  "timeExecution": 130320,
  "verdict": "-",
  "conclusion": "SUCCESSFUL",
  "dev": {
  }
}
```