Token: def
https://smithfield.trellis.one/bookmarks/trellisfw/documents/e6db1c90-9c83-4219-8a2c-a1c19885d8ee/



To upload a file:
  - Create a new PDF by posting it to:
    - https://smithfield.trellis.one/resources
  - Maybe add filename to it's meta
  - Create a new job for that PDF by POSTing to:
    - https://smithfield.trellis.one/resources
    - with link to pdf
  - Link the new job resource to the target service
    - https://smithfield.trellis.one/bookmarks/services/target/jobs/73f38b61-c948-4fea-a3e2-e281b3e84f22

To get list of files:
  - Get list of documents from (just ids):
    - https://smithfield.trellis.one/bookmarks/trellisfw/documents
  - For each document id, GET it's meta
    - https://smithfield.trellis.one/bookmarks/trellisfw/documents/e6db1c90-9c83-4219-8a2c-a1c19885d8ee/_meta/services/target
  - Maybe get it's pdf meta:
    - https://smithfield.trellis.one/bookmarks/trellisfw/documents/e6db1c90-9c83-4219-8a2c-a1c19885d8ee/pdf/_meta

Register for watch on document list:
