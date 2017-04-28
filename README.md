#Header

##API

###Events v1.6
Events object example
```json
{
  "_id": "QnXeZ5pwqWy3MbDmh",
  "type": "TestCaseEvent",
  "version": "1.0.0",
  "name": "TC1",
  "id": "8565d6d0-29e2-4850-b3da-da2a6d99a877",
  "timeStart": 1483906947198,
  "timeFinish": 1483907000298,
  "links": [
    {
      "target": "f9ee8cf8-3f11-4360-803e-cf8920494718",
      "type": "CONTEXT"
    },
    {
      "target": "508f703d-148b-4bd1-92b8-36de209fa2b2",
      "type": "IUT"
    }
  ],
  "source": {
    "domainId": "example.domain"
  },
  "data": {
    "testCase": {
      "id": "TC1",
      "uri": "http://tm.company.com/browse/TC1",
      "tracker": "My First Test Management System"
    },
    "customData": [
      {
        "value": "TCF1",
        "key": "name"
      },
      {
        "value": 4644,
        "key": "iteration"
      }
    ],
    "outcome": {
      "verdict": "PASSED",
      "conclusion": "SUCCESSFUL"
    }
  },
  "dev": {
    "version": "1.6"
  },
  "startEvent": "1c6f63d5-1cf0-4aa7-951f-c7d63d0b0a75",
  "finishEvent": "8565d6d0-29e2-4850-b3da-da2a6d99a877"
}
```

###EventSequences v1.2
EventSequences object example

```json
{
  "_id": "Ywj7f6sTnhgCoaoAR",
  "id": 7977,
  "timeStart": 1482770357489,
  "timeFinish": 1482770357490,
  "size": 2,
  "dev": {
  },
  "events": [
    {
      "_id": "p9cMds9at9YpaNEq3",
      "type": "EiffelSourceChangeCreatedEvent",
      "version": "1.0.0",
      "name": "SCC1",
      "id": "0fe50e39-f074-4176-a85d-6b39af246118",
      "timeStart": 1482770357489,
      "timeFinish": 1482770357489,
      "links": [
        {
          "target": "1db302b4-ad5e-4b9f-a0bd-70050a991819",
          "type": "BASE"
        }
      ],
      "source": {
        "domainId": "example.domain"
      },
      "data": {
        "gitIdentifier": {
          "repoUri": "https://repo.com",
          "branch": "topic-branch-2041",
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
            "value": 2041,
            "key": "iteration"
          }
        ],
        "change": {
          "files": "https://filelist.com/2041",
          "insertions": 182,
          "deletions": 342
        }
      },
      "dev": {
        "checked": true
      },
      "targets": [],
      "dangerousTargets": [
        "1db302b4-ad5e-4b9f-a0bd-70050a991819"
      ],
      "targetedBy": [
        "65ede655-c9c8-472d-876d-00c07d8ef700"
      ],
      "dangerousTargetedBy": [],
      "sequenceId": 7977
    },
    {
      "_id": "8xiQEzy5RYm7QzLzP",
      "type": "EiffelSourceChangeSubmittedEvent",
      "version": "1.0.0",
      "name": "SCS1",
      "id": "65ede655-c9c8-472d-876d-00c07d8ef700",
      "timeStart": 1482770357490,
      "timeFinish": 1482770357490,
      "links": [
        {
          "target": "1db302b4-ad5e-4b9f-a0bd-70050a991819",
          "type": "PREVIOUS_VERSION"
        },
        {
          "target": "0fe50e39-f074-4176-a85d-6b39af246118",
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
            "value": 2041,
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
        "0fe50e39-f074-4176-a85d-6b39af246118"
      ],
      "dangerousTargets": [],
      "targetedBy": [],
      "dangerousTargetedBy": [
        "2d6da37c-f923-4115-a943-16be2e656653",
        "9f6bf06c-224f-4991-8430-0a1439c50155"
      ],
      "sequenceId": 7977
    }
  ],
  "connections": [
    7976,
    5040,
    7978
  ]
}
```