# Move Azure Workitem to Column Action

## Build

```
npm i
npm i -g @vercel/ncc
ncc build index.js
```

`dist/index.js` is regenerated.

## Testing

```
export INPUT_ORGANIZATION=
export INPUT_PROJECT=
export INPUT_PAT=
export INPUT_FIELD=
export INPUT_COLUMN=Doing
export GITHUB_REF=refs/heads/1234-this-is-a-branch

ncc build index.js && node dist/index.js
```

## Example GitHub Action

```yaml
name: Move Ticket

on:
  pull_request_review:
    types: [submitted]

jobs:
  move-ticket:
    if: github.event.review.state == 'approved'
    runs-on: ubuntu-18.04

    steps:
      - uses: MrDaar/move-azure-workitem-to-column-action@master
        with:
          organization: myorganization
          project: myproject
          pat: ${{ secrets.ADO_MOVE_TICKET_PAT }}
          field: WEF_12341234123412341234123412341234_Kanban.Column
          column: QA
```
