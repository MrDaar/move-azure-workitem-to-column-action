const core = require('@actions/core')
const ado = require('azure-devops-node-api')

const getWorkitemId = (githubRef) => {
  if (!githubRef) {
    throw new Error(`missing githubRef: ${githubRef}`)
  }

  // refs/heads/1234-this-is-a-branch
  const parts = githubRef.split('-')
  if (!parts.length) {
    throw new Error(`invalid branch name: ${githubRef}`)
  }

  const numeric = parts[0].replace(/\D/g, '')
  if (!numeric.length) {
    throw new Error(`invalid workitem id: ${parts[0]}`)
  }

  return parseInt(numeric)
}

async function main() {
  const organization = core.getInput('organization', { required: true })
  const project = core.getInput('project', { required: true })
  const pat = core.getInput('pat', { required: true })
  const field = core.getInput('field', { required: true })
  const column = core.getInput('column', { required: true })

  const url = `https://dev.azure.com/${organization}`
  const workitemId = getWorkitemId(process.env.GITHUB_REF)

  const authHandler = ado.getPersonalAccessTokenHandler(pat);
  const connection = new ado.WebApi(url, authHandler);
  const workItemTrackingApi = await connection.getWorkItemTrackingApi();

  const workitem = await workItemTrackingApi.getWorkItem(workitemId);
  if (!workitem) {
    throw new Error(`workitem not found, id: ${workitemId}`)
  }
  // core.info(`workitem = ${JSON.stringify(workitem, null, 4)}`)

  const currentColumn = workitem.fields[field]
  if (!currentColumn) {
    throw new Error(`field does not exist: ${field}`)
  }
  if (currentColumn == 'New' || currentColumn == 'Done') {
    throw new Error(`skipping. workitem is ${currentColumn}`)
  }

  const customHeaders = {}
  const document = [{
    op: 'replace',
    path: `/fields/${field}`,
    value: column
  }]
  const updatedWorkitem = await workItemTrackingApi.updateWorkItem(
    customHeaders,
    document,
    workitemId,
    project
  )
  // core.info(`updatedWorkitem = ${JSON.stringify(updatedWorkitem, null, 4)}`)

  core.info(`workitem moved: ${currentColumn} => ${updatedWorkitem.fields[field]}`)
}

main().catch(e => core.setFailed(e.message))
