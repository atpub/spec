import fs from 'fs/promises'
import path from 'path'

import * as yaml from 'js-yaml'

const SRC_DIR = './src'
const OUT_DIR = './dist'

async function loadDir (dirName = 'schema') {
    const output = {}
    const dir = path.join(SRC_DIR, dirName)
    for (const fn of await fs.readdir(dir)) {
        const ffn = path.join(dir, fn)
        const name = fn.split('.')[0]
        output[name] = yaml.load(await fs.readFile(ffn))
    }
    return output
}

async function build () {

    const bundle = {
        schema: await loadDir('schema'),
        example: await loadDir('example'),
        time: (new Date).toISOString()
    }

    try {
        await fs.rm(OUT_DIR, { recursive: true })
    } catch {}

    await fs.mkdir(OUT_DIR)

    // create separated schema files
    await fs.mkdir(path.join(OUT_DIR, 'schema'))
    for (const [schemaName, schema] of Object.entries(bundle.schema)) {
        const schemaFn = path.join(OUT_DIR, 'schema', `${schemaName}.json`)
        await fs.writeFile(schemaFn, JSON.stringify(schema, null, 2))
        console.log(`Writed: ${schemaFn}`)
    }

    const indexFn = path.join(OUT_DIR, 'index.json')
    await fs.writeFile(indexFn, JSON.stringify(bundle, null, 2))
    console.log(`Writed: ${indexFn}`)
}

build()