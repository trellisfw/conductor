/* Copyright 2020 Qlever LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import uuid from 'uuid'

import { JSONSchema8 as Schema, JSONSchema8ObjectSchema } from 'jsonschema8'
import shares, { Share } from './shares'

import config from './config'

const FL_BUSINESS_ID = config.get('fl_business_id')

export default genRules()

// Generates schema requiring all keys present in obj
type Obj = {
  [key: string]: Obj
}
function obj2schema (obj: Obj): Schema {
  if (typeof obj === 'object') {
    const properties: { [key: string]: Schema } = {}
    for (const key in obj) {
      properties[key] = obj2schema(obj[key])
    }
    const required = Object.keys(obj)
    const type = 'object'

    return { type, properties, required }
  } else {
    return { const: obj }
  }
}

export interface Rule {
  list: string
  destination: string
  schema: Schema
  meta?: object
}
function * genRules (): Iterable<{ id: string; rule: Rule }> {
  // Rule to send all PDFs to Target for transcription
  yield {
    id: 'all-pdfs-to-target',
    rule: {
      list: '/bookmarks/trellisfw/documents',
      schema: {
        type: 'object',
        required: ['pdf']
      },
      destination: '/bookmarks/services/target/jobs',
      meta: {
        services: {
          target: {
            tasks: {
              [uuid.v4()]: {
                type: 'pdf',
                status: 'pending'
              }
            }
          }
        }
      }
    }
  }

  // Rule to send all ASNs to Target for conversion
  yield {
    id: 'all-asns-to-target',
    rule: {
      list: '/bookmarks/trellisfw/asns',
      schema: {}, // TODO: Better schema?
      destination: '/bookmarks/services/target/jobs',
      meta: {
        services: {
          target: {
            tasks: {
              [uuid.v4()]: {
                type: 'asn',
                status: 'pending'
              }
            }
          }
        }
      }
    }
  }

  // Rule to send all virtual documents to oada-ensure?
  yield {
    id: 'all-vdocs-to-ensure',
    rule: {
      list: '/bookmarks/trellisfw/documents',
      schema: {
        // Needs to have either audits or COIs
        anyOf: [
          {
            type: 'object',
            properties: {
              audits: {
                type: 'object',
                patternProperties: {
                  '.*': {
                    type: 'object'
                  }
                },
                minProperties: 1
              }
            },
            required: ['audits']
          },
          {
            type: 'object',
            properties: {
              cois: {
                type: 'object',
                patternProperties: {
                  '.*': {
                    type: 'object'
                  }
                },
                minProperties: 1
              }
            },
            required: ['cois']
          }
        ]
      },
      destination: '/bookmarks/services/oada-ensure/jobs'
    }
  }

  // Rule to send all transcriptions of audits/COIs to the signer
  yield {
    id: 'transcribed-audits-to-signer',
    rule: {
      list: '/bookmarks/trellisfw/documents',
      schema: {
        // Needs to have either audits or COIs
        anyOf: [
          {
            type: 'object',
            properties: {
              audits: {
                type: 'object',
                patternProperties: {
                  '.*': {
                    type: 'object'
                  }
                },
                minProperties: 1
              }
            },
            required: ['audits']
          },
          {
            type: 'object',
            properties: {
              cois: {
                type: 'object',
                patternProperties: {
                  '.*': {
                    type: 'object'
                  }
                },
                minProperties: 1
              }
            },
            required: ['cois']
          }
        ],
        // Don't match if there is an unmask key
        not: {
          type: 'object',
          properties: {
            unmask: {}
          }
        }
      },
      destination: '/bookmarks/services/trellis-signer/jobs',
      meta: {
        services: {
          'trellis-signer': {
            tasks: {
              [uuid.v4()]: {
                status: 'pending'
              }
            }
          }
        }
      }
    }
  }

  // Rule to send signed transcriptions for approval
  const approvalTaskId = uuid.v4()
  // The share for all Tyson COIs
  const share: Share = {
    type: 'fl',
    with: 'Tyson',
    shares: {
      [FL_BUSINESS_ID]: {
        communities: []
      }
    }
  }
  yield {
    id: 'signed-cois-to-approval',
    rule: {
      list: '/bookmarks/trellisfw/documents',
      schema: {
        type: 'object',
        properties: {
          // /resource/id/audits/uuid/signatures/[]
          cois: {
            type: 'object',
            patternProperties: {
              '.*': {
                type: 'object',
                properties: {
                  // Array of at least 1 signature
                  signatures: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 1
                  },
                  holder: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: {
                        type: 'string',
                        // Match string conatining "Tyson"
                        pattern: '(^|[^a-zA-Z])[Tt]yson([^a-zA-Z]|$)'
                      }
                    }
                  }
                },
                required: ['signatures', 'holder']
              }
            },
            minProperties: 1
          }
        },
        required: ['cois']
      },
      destination: '/bookmarks/services/approval/jobs',
      meta: {
        services: {
          approval: {
            tasks: {
              [approvalTaskId]: {
                status: 'approved',
                ...share
              }
            }
          }
        }
      }
    }
  }

  // Rule to send approved COIs to Foodlogic
  yield {
    id: 'approved-cois-to-fl',
    rule: {
      list: '/bookmarks/trellisfw/documents',
      schema: {
        type: 'object',
        properties: {
          // /resource/id/audits/uuid/signatures/[]
          cois: {
            type: 'object',
            patternProperties: {
              '.*': {
                type: 'object',
                properties: {
                  // Array of at least 1 signature
                  signatures: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 1
                  }
                },
                required: ['signatures']
              }
            },
            minProperties: 1
          },
          // Check for approval task
          _meta: {
            type: 'object',
            required: ['services'],
            properties: {
              services: {
                type: 'object',
                required: ['approval'],
                properties: {
                  approval: {
                    type: 'object',
                    required: ['tasks'],
                    properties: {
                      tasks: {
                        type: 'object',
                        required: [approvalTaskId],
                        properties: {
                          [approvalTaskId]: {
                            type: 'object',
                            required: ['status'],
                            properties: {
                              status: { const: 'approved' }
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
        required: ['cois', '_meta']
      },
      destination: '/bookmarks/services/fl-pusher/jobs',
      meta: {
        services: {
          'fl-pusher': {
            tasks: {
              [uuid.v4()]: {
                status: 'pending',
                ...share
              }
            }
          }
        }
      }
    }
  }

  const approvalTaskIdWf = uuid.v4()
  const shareWf: Share = {
    type: 'shareWf',
    with: 'Wakefern'
  }
  yield {
    id: 'signed-wf-cois-to-approval',
    rule: {
      list: '/bookmarks/trellisfw/documents',
      schema: {
        type: 'object',
        properties: {
          // /resource/id/audits/uuid/signatures/[]
          cois: {
            type: 'object',
            patternProperties: {
              '.*': {
                type: 'object',
                properties: {
                  // Array of at least 1 signature
                  signatures: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 1
                  },
                  holder: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: {
                        type: 'string',
                        // Match string conatining "Wakefern"
                        pattern: '(^|[^a-zA-Z])[Ww]akefern([^a-zA-Z]|$)'
                      }
                    }
                  }
                },
                required: ['signatures', 'holder']
              }
            },
            minProperties: 1
          }
        },
        required: ['cois']
      },
      destination: '/bookmarks/services/approval/jobs',
      meta: {
        services: {
          approval: {
            tasks: {
              [approvalTaskIdWf]: {
                status: 'approved',
                ...shareWf
              }
            }
          }
        }
      }
    }
  }

  // Rule to send approved COIs to Wakefern
  /*
  yield {
    id: 'approved-cois-to-wf',
    rule: {
      list: '/bookmarks/trellisfw/documents',
      schema: {
        type: 'object',
        properties: {
          // /resource/id/audits/uuid/signatures/[]
          cois: {
            type: 'object',
            patternProperties: {
              '.*': {
                type: 'object',
                properties: {
                  // Array of at least 1 signature
                  signatures: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 1
                  }
                },
                required: ['signatures']
              }
            },
            minProperties: 1
          },
          // Check for approval task
          _meta: {
            type: 'object',
            required: ['services'],
            properties: {
              services: {
                type: 'object',
                required: ['approval'],
                properties: {
                  approval: {
                    type: 'object',
                    required: ['tasks'],
                    properties: {
                      tasks: {
                        type: 'object',
                        required: [approvalTaskIdWf],
                        properties: {
                          [approvalTaskIdWf]: {
                            type: 'object',
                            required: ['status'],
                            properties: {
                              status: { const: 'approved' }
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
        required: ['cois', '_meta']
      },
      destination:
        '/resources/default:resources_bookmarks_999/trellisfw/documents',
      meta: {
        _permissions: {
          'users/default:users_audrey_999': {
            owner: false,
            read: true,
            write: true
          }
        }
      }
    }
  }
*/

  // Dynamically generate rules per share?
  for (const i in shares) {
    const share: Share = shares[i]

    let productsSchema: JSONSchema8ObjectSchema | null = null
    if (share.products) {
      productsSchema = {
        type: 'object',
        required: ['scope'],
        properties: {
          scope: {
            type: 'object',
            required: ['products_observed'],
            properties: {
              products_observed: {
                anyOf: share.products.map(product => ({
                  type: 'array',
                  contains: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: {
                        const: product
                      }
                    }
                  }
                }))
              }
            }
          }
        }
      }
    }

    let like = {}
    if (share.id) {
      like = {
        // Location audited?
        organization: {
          organizationid: {
            id: share.id
          }
        }
      }
    } else if (share.location) {
      like = {
        // Location audited?
        organization: {
          name: share.location
        }
      }
    }

    // Rule to send signed audits for approval
    const approvalTaskId = uuid.v4()
    const { required = [], properties = {} } = obj2schema(
      like
    ) as JSONSchema8ObjectSchema
    yield {
      id: `${i}-signed-audits-to-approval`,
      rule: {
        list: '/bookmarks/trellisfw/documents',
        schema: {
          type: 'object',
          properties: {
            // /resource/id/audits/uuid/signatures/[]
            audits: {
              type: 'object',
              patternProperties: {
                '.*': {
                  type: 'object',
                  properties: {
                    // Array of at least 1 signature
                    signatures: {
                      type: 'array',
                      items: { type: 'string' },
                      minItems: 1
                    },
                    ...(productsSchema?.properties || {}),
                    ...properties
                  },
                  required: [
                    'signatures',
                    ...(productsSchema?.required || []),
                    ...required
                  ]
                }
              },
              minProperties: 1
            }
          },
          required: ['audits']
        },
        destination: '/bookmarks/services/approval/jobs',
        meta: {
          services: {
            approval: {
              tasks: {
                [approvalTaskId]: {
                  status: share.auto !== false ? 'approved' : 'pending',
                  ...share
                }
              }
            }
          }
        }
      }
    }

    switch (share.type) {
      case 'email':
        // Rule to send approved audits to email
        yield {
          id: `${i}-approved-audits-to-email`,
          rule: {
            list: '/bookmarks/trellisfw/documents',
            schema: {
              type: 'object',
              properties: {
                // /resource/id/audits/uuid/signatures/[]
                audits: {
                  type: 'object',
                  patternProperties: {
                    '.*': {
                      type: 'object',
                      properties: {
                        // Array of at least 1 signature
                        signatures: {
                          type: 'array',
                          items: { type: 'string' },
                          minItems: 1
                        }
                      },
                      required: ['signatures']
                    }
                  },
                  minProperties: 1
                },
                // Check for approval task
                _meta: {
                  type: 'object',
                  required: ['services'],
                  properties: {
                    services: {
                      type: 'object',
                      required: ['approval'],
                      properties: {
                        approval: {
                          type: 'object',
                          required: ['tasks'],
                          properties: {
                            tasks: {
                              type: 'object',
                              required: [approvalTaskId],
                              properties: {
                                [approvalTaskId]: {
                                  type: 'object',
                                  required: ['status'],
                                  properties: {
                                    status: { const: 'approved' }
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
              required: ['audits', '_meta']
            },
            destination: '/bookmarks/services/abalonemail/jobs',
            meta: {
              services: {
                abalonemail: {
                  tasks: {
                    [uuid.v4()]: {
                      status: 'pending',
                      to: share.to,
                      subject: 'Shared Audit',
                      templatePath: '/audits',
                      text:
                        '{{#each this}}{{this.organization.name}}\n{{/each}}',
                      attachments: ['/pdf']
                    }
                  }
                }
              }
            }
          }
        }
        break
      case 'fl':
        // Rule to send approved audits to IFT (temporary?)
        yield {
          id: `${i}-approved-audits-to-ift`,
          rule: {
            list: '/bookmarks/trellisfw/documents',
            schema: {
              type: 'object',
              properties: {
                // /resource/id/audits/uuid/signatures/[]
                audits: {
                  type: 'object',
                  patternProperties: {
                    '.*': {
                      type: 'object',
                      properties: {
                        // Array of at least 1 signature
                        signatures: {
                          type: 'array',
                          items: { type: 'string' },
                          minItems: 1
                        }
                      },
                      required: ['signatures']
                    }
                  },
                  minProperties: 1
                },
                // Check for approval task
                _meta: {
                  type: 'object',
                  required: ['services'],
                  properties: {
                    services: {
                      type: 'object',
                      required: ['approval'],
                      properties: {
                        approval: {
                          type: 'object',
                          required: ['tasks'],
                          properties: {
                            tasks: {
                              type: 'object',
                              required: [approvalTaskId],
                              properties: {
                                [approvalTaskId]: {
                                  type: 'object',
                                  required: ['status'],
                                  properties: {
                                    status: { const: 'approved' }
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
              required: ['audits', '_meta']
            },
            destination: '/bookmarks/services/trellis-cb/jobs',
            meta: {
              services: {
                'trellis-cb': {
                  tasks: {
                    [uuid.v4()]: {
                      status: 'pending'
                    }
                  }
                }
              }
            }
          }
        }
        // Rule to send approved audits to Foodlogic
        yield {
          id: `${i}-approved-audits-to-fl`,
          rule: {
            list: '/bookmarks/trellisfw/documents',
            schema: {
              type: 'object',
              properties: {
                // /resource/id/audits/uuid/signatures/[]
                audits: {
                  type: 'object',
                  patternProperties: {
                    '.*': {
                      type: 'object',
                      properties: {
                        // Array of at least 1 signature
                        signatures: {
                          type: 'array',
                          items: { type: 'string' },
                          minItems: 1
                        }
                      },
                      required: ['signatures']
                    }
                  },
                  minProperties: 1
                },
                // Check for approval task
                _meta: {
                  type: 'object',
                  required: ['services'],
                  properties: {
                    services: {
                      type: 'object',
                      required: ['approval'],
                      properties: {
                        approval: {
                          type: 'object',
                          required: ['tasks'],
                          properties: {
                            tasks: {
                              type: 'object',
                              required: [approvalTaskId],
                              properties: {
                                [approvalTaskId]: {
                                  type: 'object',
                                  required: ['status'],
                                  properties: {
                                    status: { const: 'approved' }
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
              required: ['audits', '_meta']
            },
            destination: '/bookmarks/services/fl-pusher/jobs',
            meta: {
              services: {
                'fl-pusher': {
                  tasks: {
                    [uuid.v4()]: {
                      status: 'pending',
                      ...share
                    }
                  }
                }
              }
            }
          }
        }
        break

      case 'shareWf':
        /*
        yield {
          id: `${i}-approved-audits-through-trellis`,
          rule: {
            list: '/bookmarks/trellisfw/documents',
            schema: {
              type: 'object',
              properties: {
                // /resource/id/audits/uuid/signatures/[]
                audits: {
                  type: 'object',
                  patternProperties: {
                    '.*': {
                      type: 'object',
                      properties: {
                        // Array of at least 1 signature
                        signatures: {
                          type: 'array',
                          items: { type: 'string' },
                          minItems: 1
                        }
                      },
                      required: ['signatures']
                    }
                  },
                  minProperties: 1
                },
                // Check for approval task
                _meta: {
                  type: 'object',
                  required: ['services'],
                  properties: {
                    services: {
                      type: 'object',
                      required: ['approval'],
                      properties: {
                        approval: {
                          type: 'object',
                          required: ['tasks'],
                          properties: {
                            tasks: {
                              type: 'object',
                              required: [approvalTaskId],
                              properties: {
                                [approvalTaskId]: {
                                  type: 'object',
                                  required: ['status'],
                                  properties: {
                                    status: { const: 'approved' }
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
              required: ['audits', '_meta']
            },
            destination:
              '/resources/default:resources_bookmarks_999/trellisfw/documents',
            meta: {
              _permissions: {
                'users/default:users_audrey_999': {
                  owner: false,
                  read: true,
                  write: true
                }
              }
            }
          }
        }
      */
        break
    }
  }
}
