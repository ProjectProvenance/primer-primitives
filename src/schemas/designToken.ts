import {z} from 'zod'
import {tokenName} from './tokenName'
import {referenceToken} from './referenceToken'
import {stringToken} from './stringToken'
import {viewportRangeToken} from './viewportRangeToken'
import {numberToken} from './numberToken'
import {fontWeightToken} from './fontWeightToken'
import {typographyToken} from './typographyToken'
import {borderToken} from './borderToken'
import {dimensionToken} from './dimensionToken'
import {colorToken} from './colorToken'
import {fontFamilyToken} from './fontFamilyToken'
import {shadowToken} from './shadowToken'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: TODO: fix this
export const designToken = z.record(
  tokenName,
  z.lazy(() => {
    return z.union([
      z.discriminatedUnion('$type', [
        colorToken,
        dimensionToken,
        shadowToken,
        borderToken,
        fontFamilyToken,
        fontWeightToken,
        typographyToken,
        viewportRangeToken,
        numberToken,
        stringToken,
      ]),
      referenceToken,
      designToken,
    ])
  }),
)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: TODO: fix this
// export const addType = z.record(
//   tokenName,
//   z.lazy(() => {
//     return z.union([
//       z
//         .object({
//           $value: z.any(),
//           $type: z.string().default('reference'),
//         })
//         .required(),
//       addType,
//     ])
//   }),
// )
