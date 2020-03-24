import {Share} from './shares'
import uuid from 'uuid'
import { JSONSchema8 as Schema, JSONSchema8ObjectSchema } from 'jsonschema8'

// Generates schema requiring all keys present in obj
type Obj = {
  [key: string]: Obj
}
// Generates schema requiring all keys present in obj
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

export function * shareToRules(sh: Share) {
  const share: Share = sh
  const i: string = uuid.v4();

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
    case 'ift':
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
      break
    case 'fl':
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
