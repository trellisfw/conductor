import _ from 'lodash'
import Fuse from 'fuse.js'
import moment from 'moment'

//let DOC_TYPES = ['cois', 'letters-of-guarantee', 'fsqa-audits', 'fsqa-certificates', 'documents'];

export default {
  Pages: {
    selectedPage: 'Data',
    Documents: {

    },
    Audits: {
      search: '',
      openFileBrowser: false,
      Table: ({search}, state) => {
        let unloadedDocs = [];
        const documents = _.get(state, `oada.data.fsqa-audits`);
        const docKeys = _.keys(documents).sort().reverse();
        let collection = _.map(docKeys,
          (documentKey) => {
            const document = documents[documentKey];
            if (!document) {
              unloadedDocs.push({documentKey})
              return {documentKey};
            }
            return {
              documentKey: documentKey,
              docType: 'fsqa-audits',
              filename: _.get(document, 'organization.name') || '',
              type: 'FSQA Audit',
              createdAt: moment
                .utc(_.get(document, '_meta.stats.created'), 'X')
                .local()
                .format('M/DD/YYYY h:mm a'),
              createdAtUnix: _.get(document, '_meta.stats.created')
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
        return collection;
      }
    },
    COIS: {
      search: '',
      openFileBrowser: false,
      Table: ({search}, state) => {
        let unloadedDocs = [];
        const documents = _.get(state, `oada.data.cois`);
        const docKeys = _.keys(documents).sort().reverse();
        let collection = _.map(docKeys,
          (documentKey) => {
            const document = documents[documentKey];
            if (!document) {
              unloadedDocs.push({documentKey})
              return {documentKey};
            }
            return {
              documentKey: documentKey,
              docType: 'cois',
              filename: _.get(document, 'producer.name') || '',
              type: 'COI',
              createdAt: moment
                .utc(_.get(document, '_meta.stats.created'), 'X')
                .local()
                .format('M/DD/YYYY h:mm a'),
              createdAtUnix: _.get(document, '_meta.stats.created')
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
        return collection;
      }
    },
    Data: {
      search: '',
      openFileBrowser: false,
      uploading: {},
      Table: ({search}, state) => {
        let unloadedDocs = [];
        const documents = _.get(state, `oada.data.documents`);
        const docKeys = _.keys(documents).sort().reverse();
        let collection = _.map(docKeys,
          (documentKey) => {
            const document = documents[documentKey];
            if (!document) {
              unloadedDocs.push({documentKey})
              return {documentKey};
            }
            //Filter out docs with vdoc in meta, don't show them
            if (_.get(document, '_meta.vdoc') != null) {
              return null;
            }
            //Pull out status from target
            const tasks = _.get(document, '_meta.services.target.jobs') || {}
            const fileDetails = {
              type: _.get(document, '_meta._type')
            }
            /*_.forEach(tasks, task => {
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
            })*/

            // Check if Target service exists and is handling this document:
            const processingService = _.keys(tasks).length > 0 ? 'target' : false

            return {
              documentKey: documentKey,
              docType: 'documents',
              filename: _.get(document, '_meta.filename') || '',
              type: fileDetails.type,
              createdAt: moment
                .utc(_.get(document, '_meta.stats.created'), 'X')
                .local()
                .format('M/DD/YYYY h:mm a'),
              createdAtUnix: _.get(document, '_meta.stats.created'),
              processingService
            }
          }
        )
        collection = _.compact(collection); // Remove null docs, ones that have a vdoc
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
        return collection;
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
      docType: null,
      showData: false,
      document: ({ documentKey, docType }, state) => {
        //Get the document
        return (
          _.chain(state)
            .get(`oada.data.${docType}.${documentKey}`)
            .value() || {}
        )
      },
      type: ({ document }, state) => {
        if (document._type == 'application/vnd.trellisfw.coi.accord+json') { //application/vnd.trellisfw.coi.1+json
          return 'coi'
        } else if (document._type == 'application/vnd.trellisfw.audit.sqfi.1+json') {
          return 'audit'
        } else {
          return null;
        }
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
