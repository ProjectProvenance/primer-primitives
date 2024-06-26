import {javascriptEsm} from './javascriptEsm'
import {getMockFormatterArguments} from '../test-utilities'
import {format} from 'prettier'

describe('Format: ESM', () => {
  it('Formats tokens adding prefix', () => {
    const input = getMockFormatterArguments({
      platform: {
        prefix: 'test',
      },
    })
    const expectedOutput = format(
      `export default {
      test: {
        tokens: {
          subgroup: {
            red: "transformedValue",
          },
        },
      },
    };`,
      {parser: 'typescript', printWidth: 500},
    )
    expect(javascriptEsm(input)).toStrictEqual(expectedOutput)
  })

  it('Formats tokens without prefix', () => {
    const input = getMockFormatterArguments()
    const expectedOutput = format(
      `export default {
      tokens: {
        subgroup: {
          red: "transformedValue",
        },
      },
    };`,
      {parser: 'typescript', printWidth: 500},
    )
    expect(javascriptEsm(input)).toStrictEqual(expectedOutput)
  })
})
