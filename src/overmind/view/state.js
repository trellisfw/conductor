import _ from 'lodash'
import Fuse from 'fuse.js'
import moment from 'moment'

//let DOC_TYPES = ['cois', 'letters-of-guarantee', 'fsqa-audits', 'fsqa-certificates', 'documents'];

export default {
  Pages: {
    selectedPage: 'Data',
    Data: {
      search: '',
      openFileBrowser: false,
      uploading: {},
      Table: ({search}, state) => {
        let tab = {};
        Object.keys(state.oada.data).forEach(docType => {
          let unloadedDocs = [];
          const documents = _.get(state, `oada.data.${docType}`);
          const docKeys = _.keys(documents).sort().reverse();
          let collection = _.map(docKeys,
            (documentKey) => {
              const document = documents[documentKey];
              if (!document) {
                unloadedDocs.push({documentKey})
                return {documentKey};
              }
              //Pull out status from services
              //TODO: fix this here. I just tried switching it from meta.services.target.tasks to jobs
              const tasks = _.get(document, '_meta.services.target.jobs') || {}
              const fileDetails = {}
              _.forEach(tasks, task => {
                const statuses = _.get(task, 'status') || {}
                const identify = _.find(statuses, { status: 'identified' })
                if (identify != null) {
                  fileDetails.type = _.get(identify, 'type')
                  fileDetails.format = _.get(identify, 'format')
                  return false
                } else {
                  const failed = _.find(statuses, { status: 'error' })
                  if (failed != null) {
                    fileDetails.format = 'Unknown'
                    return false
                  }
                }
              })
              if (fileDetails.type == null) {
                if (_.get(document, 'audits') != null) {
                  fileDetails.type = 'Audit'
                } else if (_.get(document, 'cois') != null) {
                  fileDetails.type = 'COI'
                } else {
                  fileDetails.type = 'Unknown'
                }
              }
              // Check if Target service exists and is handling this document:
              const processingService = _.keys(tasks).length > 0 ? 'target' : false

              //Pull out share status
              // Aaron changed this to stay bold unless ALL share tasks are approved.
              // TODO: Aaron said this should remain bold but may not if this path isn't present
              const shared = _.chain(document)
                .get('_meta.services.approval.tasks')
                .every(t => t.status === 'approved')
                .value()

              //Pull out signature from audit
              var signatures =
                _.chain(document)
                  .get('audits')
                  .values()
                  .get(0)
                  .get('signatures')
                  .value() || []
              if (signatures.length == 0)
                signatures =
                  _.chain(document)
                    .get('cois')
                    .values()
                    .get(0)
                    .get('signatures')
                    .value() || []

              // Get masked location
              var masked = false;
              if (_.get(document, 'unmask') != null) masked = true;

              return {
                documentKey: documentKey,
                docType,
                filename: _.get(document, 'pdf._meta.filename') || '',
                type: fileDetails.type,
                status: fileDetails.type == null ? 'processing' : null,
                format: fileDetails.format,
                createdAt: moment
                  .utc(_.get(document, '_meta.stats.created'), 'X')
                  .local()
                  .format('M/DD/YYYY h:mm a'),
                createdAtUnix: _.get(document, '_meta.stats.created'),
                signed: signatures.length > 0 ? true : false,
                masked: masked,
                shared: shared,
                processingService
              }
            }
          )
          //Filter collection by filename
          const fuseOptions = {keys: [{name: 'filename', weight: 0.3}], shouldSort: false};
          var fuse = new Fuse(collection, fuseOptions);
          if (search && search.length > 0) {
            collection = _.map(fuse.search(search.substr(0, 32)), 'item');
            //Add back in unloaded docs at the end
            collection = _.concat(collection, unloadedDocs);
          }
          _.forEach(_.get(state, 'view.Pages.Data.uploading'), file => {
            collection.unshift({
              filename: file.filename,
              status: 'uploading'
            })
          })
          tab[docType] = collection;
          return collection;
        })
        return tab;
      }
    },
    Rules: {
    }
  },
  Modals: {
    EditRuleModal: {
      open: false,
    },
    NewRuleModal: {
      open: false,
      page: 'List',
      List: {
        category: 'FSQA',
        categories: ['FSQA','PII','Claims','Sustainability','Supply Chain'],
      },
      Edit: {
        template: {},
        rule: {},
      },
    },
    FileDetailsModal: {
      open: false,
      documentKey: null,
      showData: false,
      document: ({ documentKey }, state) => {
        //Get the document
        return (
          _.chain(state)
            .get(`oada.data.documents.${documentKey}`)
            .value() || {}
        )
      },
      audit: ({ document }, state) => {
        //Get the audit from the doc
        return (
          _.chain(document)
            .get(`audits`)
            .values()
            .get(0)
            .value() || {}
        )
      },
      coi: ({ document }, state) => {
        //Get the cois from the doc
        return (
          _.chain(document)
            .get(`cois`)
            .values()
            .get(0)
            .value() || {}
        )
      },
      share: ({ document }, state) => {
        return (
          _.chain(document)
            .get(`_meta.services.approval.tasks`)
            .value() || {}
        )
      }
    },
    PDFViewerModal: {
      open: false
    }
  }
}
