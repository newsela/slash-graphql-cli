import {Command, flags} from '@oclif/command'
import {endpointAuth} from '../lib'
import * as fs from 'fs'

const {writeFile} = fs.promises

const QUERY = `{
  getGQLSchema {
    schema
  }
}`

export default class GetSchema extends Command {
  static description = 'Fetch the schema from your backend'

  static examples = [
    '$ slash-graphql get-schema -e https://frozen-mango.cloud.dgraph.io/graphql -t secretToken=',
  ]

  static flags = {
    endpoint: flags.string({char: 'e', description: 'Slash GraphQL Endpoint'}),
    token: flags.string({char: 't', description: 'Slash GraphQL Backend API Tokens'}),
  }

  static args = [{name: 'file', description: 'Output File', default: '/dev/stdout'}]

  async run() {
    const opts = this.parse(GetSchema)
    const backend = await endpointAuth(opts)
    const {errors, data} = await backend.adminQuery<{getGQLSchema: {schema: string}}>(QUERY)
    if (errors) {
      for (const {message} of errors) {
        this.error(message)
      }
      throw new Error('Could not fetch schema')
    }
    await writeFile(opts.args.file, data.getGQLSchema.schema)
  }
}
