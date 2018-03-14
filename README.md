# eiffel-store (the readme file is not ready)

## NOTE: This repo. is different then original eiffel vici due to following reasons:

## Orginal Eiffel Vici: 
1. It imports bulk events from JSON file and generate visualization at once. You cannot add event during run-time to database to reflect your changes to users.
2. It is not connected to RabbitMQ

## eiffel-store: 
1. It is integrated with MongoDB. Everytime, new event is added into database, the visualization is updated. 
2. It is connected to RabbitMQ. Download the source code from https://github.com/azeem59/rabbitmq-eiffel-store.git and run the the program which connects current eiffel-store to RabbitMQ. Publish the event on Bus and this program will connect RabbitMQ to visualization. The queue name is vici. I will put a jar file shorlty. 

At this moment, you need to refresh the client side to get the changes. I will update this soon.

## Introduction
A web application that extracts data from Mongo DB and aggregates data from continous 
integration processes and visualizes this in interactive graphs.
The application uses the Eiffel framework which you can read
 more about at their GitHub[page](https://github.com/Ericsson/eiffel)
## Table of contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
  - [Install Meteor](#install-meteor)
  - [Install MongoDB](#install-mongodb)
- [How to use the app](#how-to-use-the-app)
  - [How to select a node](#how-to-select-a-node)
  - [How to select a time-interval](#how-to-select-a-time-interval)
  - [How to set the amount of events shown](#how-to-set-the-amount-of-events-shown)
  - [How to move between levels](#how-to-move-between-levels)
  - [How to find help](#how-to-find-help)
  - [How to read the graphs](#how-to-read-the-graphs)
- [How to develop](#how-to-develop)
- [API](#api)
  - [Events v2.0](#events-v20)
  - [EventSequences v2.0](#eventsequences-v20)
  - [Rows v2.0](#rows-v20)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation
 
### Install Meteor
The application uses Meteor v.1.4.3.2

https://www.meteor.com/install

https://guide.meteor.com/

### Install MongoDB
This is so you will be able to import the Eiffel data. If you encounter problems, make sure to use the same version of MongoDB specified in the version of Meteor that you are using.
https://docs.mongodb.com/manual/installation/

## Application overview

### Aggregation view
<img src="https://gitlab.ida.liu.se/tddd96/visualization-docs/raw/fd0f67e94039a6daca553bbaee87f00a7718f6f9/images/gui_aggregation.png" width="50%" height="50%"/>
### Details view
<img src="https://gitlab.ida.liu.se/tddd96/visualization-docs/raw/fd0f67e94039a6daca553bbaee87f00a7718f6f9/images/gui_details.png" width="50%" height="50%"/>
### Event chain view
<img src="https://gitlab.ida.liu.se/tddd96/visualization-docs/raw/fd0f67e94039a6daca553bbaee87f00a7718f6f9/images/gui_eventchain.png" width="50%" height="50%"/>

## How to use the app

### How to select a node
You select a node by simply klicking it, and when you do that a 
pop-up will appear. The pop-up will display more details about the node.

### How to select a time-interval
You select a time-interval by adjusting the start- and 
end-controls located below the graph in the level called 
"Aggregation". You can also select a specific date-interval
 in the **From**- and **To**-boxes.
 
### How to set the amount of events shown
I you are interested in adjusting the amount of events that are
 shown at any given time you can adjust the number in the box
  called **Soft limit**. This box is found below the graph in
  **Aggregation**.
  
  *Note*: The soft limit is usually never the exact amount of
  events that are shown. The box called **Sequences shown**
  shows the exact amount.

### How to move between levels
You can move between levels easily by using the navigation bar
 located at the top right side of the screen. Each button is named
 according to the level it will take you to once pressed.
 
### How to find help
If you need information about what different components in the
app mean or what they do, you can click the icon
![info_button_logo](https://gitlab.ida.liu.se/tddd96/visualization/raw/938b21d684f5356765fe7dab2516f544355e4fe8/public/examples/smaller_info_logo.PNG "info_logo")
This icon is found below the navigation bar that you 
use to navigate between the different parts of the application.

### How to read the graphs
The graphs contain nodes which represent events generated by
different parts of a CI-system. The events that are displayed
should be read from left to right with respect to time, meaning
that the node to the far right in the graph is the last 
event created chronologically in the selected time-interval.


## How to develop
The application was built following the Meteor standard 
which can be found on the Meteor [website](https://www.meteor.com/tutorials/blaze/creating-an-app).

This means for example that the creation and retrieval of graphs 
is done in **imports/api** and the frontend code is handled in 
**imports/ui**. So if you want to develop the application further,
simply follow the Meteor standard.

## Modules
<img src="https://gitlab.ida.liu.se/tddd96/visualization-docs/raw/1ccf520a9f90a92424c43510277e3baba4c0e1e4/images/modules.jpg" width="50%" height="50%"/>
### aggregation.js
Module containing function calls related to the aggregation view. It uses the external JavaScript library Vis.js for the timeline.
### details.js
Module containing function calls related to the detailed view. It also uses the Vis.js library for plotting event sequences.
### eventchain.js
Module containing function calls related to the detailed view. 
### graph.js
Renders graphs related to the aggregation view and event chain view. The module uses two external JavaScript libraries: Cytoscape.js for rendering graphs and Dagre.js for graph layout.
### detailed-graph.js
Module for the plotting the event sequences. It also uses the library Vis.js.
### eventSequences/methods.js
Module containing server side function calls for the aggregation view and event chain view.
### rows/methods.js
Module containing server side function calls for the detailed view.
## File Structure
The application follows the [file structure](https://guide.meteor.com/structure.html#javascript-structure) recommended by Meteor. Below is an overview of how the applications directory is structured.
```
imports/
    api/
        eiffelevents/
            eiffelevents.js
            eiffelevents.test.js
            eiffeleventTypes.js
            methods.js              # methods related to eiffelevents
        events/
            event-types.js
            events.js
            events.test.js
            methods.js              # methods related to events
        eventSequences/
            event-sequence.test.js
            event-sequences.js
            methods.js              # methods related to eventSequences
        initializer/
            methods.js              # methods related to initializer
        properties/
            methods.js
            properties.js
        rows/
            methods.js              # methods related to rows
            rows-table.js
            rows.js
    startup/
        client/
            index.js                # import client startup through a single index entry point
            routes.js               # set up all routes in the app
        server/
            api.js
            index.js                # import server startup through a single index entry point
    ui/
        components/                 # all reusable components in the application
            aggregation.js          # methods related to aggregation view
            detailed-plots.js       # methods related to detailed view
            details.js
            eventchain.js           # methods related to event chain view
            graph.js                # methods related to graph rendering
            graph.test.js           # tests for graph.js
            help.js                 # related html-code for the help button
        layout/                     # wrapper components for behaviour and visuals
            layout.js
            layout.test.js
        pages/                      # entry points for rendering used by the router
            home.js

```

## API
There is four major collection used by the application. The events are imported manually to the "eiffel-events" collections. At startup, if necessary, the application will take the eiffel-events from the collections and remake them into custom made events placed in the "events" collection. The events from the "events" collection will then be used to create custom event sequences, placed in the "eventsequences" collection. The event sequences are visualized in the aggregation and event chain graphs. The objects from the "eventsequences" is in turn used to generate rows, placed in the "tablerows" collection. The rows are used for the detailed view, table and plots.

The eiffel-events have been restructured to be able to combine for example TestCaseStarted with TestCaseFinished to one TestCase event, giving us access to start and end time immediately.

All functional and "reusable" code is found in the imports folder. Stylesheets are found in the client folder if no other placement was required.

Here comes information where the events, event sequences and rows are generated and examples on how they look.

### Events v2.0
Events object placed in the "events" collection. 
Events are generated in imports/api/events/methods.js by populateEventsCollection().
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
Event sequences placed in the "eventsequences" collection.
Event sequences are generated in imports/api/eventSequences/methods.js by populateEventSequences().

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
Rows placed in the "tablerows" collection.
Rows are generated in imports/api/rows/methods.js by populateRowsCollection().
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
