module.exports = {
  "schema": {
    "type": "object",
    // It needs to be an audit as marked by target
    "properties": {
      "audits": {
        "type": "object",
        "patternProperties": {
          ".*": {
            "type": "object",
            "properties": {
              "signatures": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "minItems": 1
              }
            },
            "required": [
              "signatures"
            ]
          }
        },
        "minProperties": 1
      },
      "_meta": {
        "type": "object",
        "required": [
          "services"
        ],
        "properties": {
          "services": {
            "type": "object",
            "required": [
              "approval"
            ],
            "properties": {
              "approval": {
                "type": "object",
                "required": [
                  "tasks"
                ],
                "properties": {
                  "tasks": {
                    "type": "object",
                    "required": [
                      "2a38172b-9ca4-46f2-8317-9a4738bb2b9f"
                    ],
                    "properties": {
                      "2a38172b-9ca4-46f2-8317-9a4738bb2b9f": {
                        "type": "object",
                        "required": [
                          "status"
                        ],
                        "properties": {
                          "status": {
                            "const": "approved"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "required": [
      "audits",
      "_meta"
    ]
  },
  "meta": {
    "services": {
      "fl-pusher": {
        "tasks": {
          "e0032140-ba50-4e40-9b4a-f8c84d8e6e15": {
            "status": "pending",
            "type": "fl",
            "location": "Smithfield Packaged Meats Corp. - Arnold",
            "id": "10138",
            "with": "Tyson",
            "shares": {
              "5b2a416f6923920001acd471": {
                "communities": []
              }
            }
          }
        }
      }
    }
  },
  "destination": "/bookmarks/services/fl-pusher/jobs",
  "list": "/bookmarks/trellisfw/documents"
}
