import type StyleDictionary from 'style-dictionary'
import {PrimerStyleDictionary} from '~/src/PrimerStyleDictionary'
import {copyFromDir} from '~/src/utilities'
import {
  // typeDefinitions,
  deprecatedJson,
  css,
  docJson,
  scss,
  // javascript,
  // typescript,
  // json,
  fallbacks,
} from '~/src/platforms'
import type {ConfigGeneratorOptions, StyleDictionaryConfigGenerator} from '~/src/types/StyleDictionaryConfigGenerator'
import type {TokenBuildInput} from '~/src/types/TokenBuildInput'
import glob from 'fast-glob'
import {themes} from './themes.config'
import {buildFigma} from './buildPlatforms/buildFigma'
/**
 * getStyleDictionaryConfig
 * @param filename output file name without extension
 * @param source array of source token json files
 * @param include array of included token json files (will not be present in output btu values are used when referenced)
 * @param options options object
 * @returns style dictionary config object
 */
const getStyleDictionaryConfig: StyleDictionaryConfigGenerator = (
  filename,
  source,
  include,
  options,
  platforms = {},
): StyleDictionary.Config => ({
  source, // build the special formats
  include,
  platforms: {
    css: css(`css/${filename}.css`, options.prefix, options.buildPath, {themed: options.themed}),
    scss: scss(`scss/${filename}.scss`, options.prefix, options.buildPath),
    // js: javascript(`js/${filename}.js`, options.prefix, options.buildPath),
    // ts: typescript(`ts/${filename}.ts`, options.prefix, options.buildPath),
    // json: json(`json/${filename}.json`, options.prefix, options.buildPath),
    docJson: docJson(`docs/${filename}.json`, options.prefix, options.buildPath),
    fallbacks: fallbacks(`fallbacks/${filename}.json`, options.prefix, options.buildPath),
    ...platforms,
  },
})

export const buildDesignTokens = (buildOptions: ConfigGeneratorOptions): void => {
  buildFigma(buildOptions)
  /** -----------------------------------
   * Colors, shadows & borders
   * ----------------------------------- */
  try {
    for (const {filename, source, include} of themes) {
      // build functional scales
      PrimerStyleDictionary.extend({
        source: [...source, ...include], // build the special formats
        include,
        platforms: {
          css: css(`internalCss/${filename}.css`, buildOptions.prefix, buildOptions.buildPath, {themed: true}),
        },
      }).buildAllPlatforms()
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('🛑 Error trying to build internal css colors for code output:', e)
  }

  /** -----------------------------------
   * Internal Colors
   * ----------------------------------- */
  try {
    for (const {filename, source, include} of themes) {
      // build functional scales
      PrimerStyleDictionary.extend(
        getStyleDictionaryConfig(
          `functional/themes/${filename}`,
          source,
          include,
          {...buildOptions, themed: true},
          // disable fallbacks for themes
          {fallbacks: undefined},
        ),
      ).buildAllPlatforms()
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('🛑 Error trying to build Colors, shadows & borders for code output:', e)
  }

  /** -----------------------------------
   * Size tokens
   * ----------------------------------- */
  try {
    const sizeFiles = glob.sync('src/tokens/functional/size/*')
    //
    for (const file of sizeFiles) {
      PrimerStyleDictionary.extend(
        getStyleDictionaryConfig(
          `functional/size/${file.replace('src/tokens/functional/size/', '').replace('.json', '')}`,
          [file],
          ['src/tokens/base/size/size.json', ...sizeFiles],
          buildOptions,
        ),
      ).buildAllPlatforms()
    }
    // build base scales
    PrimerStyleDictionary.extend(
      // using includes as source
      getStyleDictionaryConfig(`base/size/size`, ['src/tokens/base/size/size.json'], [], {
        buildPath: buildOptions.buildPath,
        prefix: undefined,
      }),
    ).buildAllPlatforms()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('🛑 Error trying to build size tokens for code output:', e)
  }
  /** -----------------------------------
   * Typography tokens
   * ----------------------------------- */
  try {
    PrimerStyleDictionary.extend(
      getStyleDictionaryConfig(
        `functional/typography/typography`,
        [`src/tokens/functional/typography/*.json`],
        [`src/tokens/base/typography/*.json`],
        buildOptions,
        {
          css: css(`css/functional/typography/typography.css`, buildOptions.prefix, buildOptions.buildPath, {
            options: {
              outputReferences: true,
            },
          }),
        },
      ),
    ).buildAllPlatforms()

    PrimerStyleDictionary.extend(
      getStyleDictionaryConfig(`base/typography/typography`, [`src/tokens/base/typography/*.json`], [], buildOptions),
    ).buildAllPlatforms()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('🛑 Error trying to build typography tokens for code output:', e)
  }

  /** -----------------------------------
   * Motion tokens
   * ----------------------------------- */
  try {
    PrimerStyleDictionary.extend(
      getStyleDictionaryConfig(
        `functional/motion/motion`,
        [`src/tokens/functional/motion/*.json5`],
        [`src/tokens/base/motion/*.json5`],
        buildOptions,
        {
          css: css(`css/functional/motion/motion.css`, buildOptions.prefix, buildOptions.buildPath, {
            options: {
              outputReferences: true,
            },
          }),
        },
      ),
    ).buildAllPlatforms()

    PrimerStyleDictionary.extend(
      getStyleDictionaryConfig(`base/motion/motion`, [`src/tokens/base/motion/*.json5`], [], buildOptions),
    ).buildAllPlatforms()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('🛑 Error trying to build motion tokens for code output:', e)
  }
  /** -----------------------------------
   * deprecated tokens
   * ----------------------------------- */
  const deprecatedBuilds: TokenBuildInput[] = [
    // color, shadow & borders
    {
      filename: 'theme',
      source: [
        `src/tokens/base/color/light/light.json5`,
        `src/tokens/base/color/light/display-light.json5`,
        `src/tokens/functional/color/light/*.json5`,
        `src/tokens/functional/shadow/light.json5`,
        `src/tokens/functional/border/light.json5`,
      ],
      include: [`src/tokens/base/color/light/light.json5`],
    },
    // typography
    {
      filename: 'typography',
      source: [`src/tokens/base/typography/*.json`, `src/tokens/functional/typography/*.json`],
      include: [`src/tokens/base/typography/*.json`],
    },
    // size
    {
      filename: 'size',
      source: [`src/tokens/base/size/*.json`, `src/tokens/functional/size/*.json`],
      include: [`src/tokens/base/size/*.json`],
    },
    // motion
    {
      filename: 'motion',
      source: [`src/tokens/base/motion/*.json5`, `src/tokens/functional/motion/*.json5`],
      include: [`src/tokens/base/motion/*.json5`],
    },
  ]
  //
  try {
    for (const {filename, source, include} of deprecatedBuilds) {
      PrimerStyleDictionary.extend({
        source,
        include,
        platforms: {
          deprecated: deprecatedJson(`deprecated/${filename}.json`, buildOptions.prefix, buildOptions.buildPath),
        },
      }).buildAllPlatforms()
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('🛑 Error trying to build deprecated tokens output:', e)
  }
  /** -----------------------------------
   * Copy `removed` files
   * ----------------------------------- */
  copyFromDir(`src/tokens/removed`, `${buildOptions.buildPath}removed`)

  /** -----------------------------------
   * Type definitions
   * ----------------------------------- */
  // const typeBuilds: TokenBuildInput[] = [
  //   // color, shadow & border
  //   {
  //     filename: 'theme',
  //     source: [
  //       `src/tokens/functional/color/light/*.json5`,
  //       `src/tokens/functional/shadow/light.json5`,
  //       `src/tokens/functional/border/light.json5`,
  //     ],
  //     include: [`src/tokens/base/color/light/light.json5`],
  //   },
  //   // typography
  //   {
  //     filename: 'typography',
  //     source: [`src/tokens/functional/typography/*.json`],
  //     include: [`src/tokens/base/typography/*.json`],
  //   },
  //   // size
  //   {
  //     filename: 'size',
  //     source: [`src/tokens/functional/size/*.json`],
  //     include: [`src/tokens/base/size/*.json`],
  //   },
  // ]
  // //
  // for (const {filename, source, include} of typeBuilds) {
  //   PrimerStyleDictionary.extend({
  //     source,
  //     include,
  //     platforms: {
  //       types: typeDefinitions(filename, buildOptions.prefix, `${buildOptions.buildPath}ts/types/`),
  //     },
  //   }).buildAllPlatforms()
  // }

  // // build types for base scale
  // PrimerStyleDictionary.extend({
  //   source: [`src/tokens/functional/color/scales.json5`],
  //   include: [`src/tokens/base/color/light/light.json5`],
  //   platforms: {
  //     types: typeDefinitions(`baseColor`, undefined, `${buildOptions.buildPath}ts/types/`),
  //   },
  // }).buildAllPlatforms()
}

/** -----------------------------------
 * Run build script
 * ----------------------------------- */
// build to private directory for backwards compatibility
buildDesignTokens({
  buildPath: 'tokens-next-private/',
})

// build to dist
buildDesignTokens({
  buildPath: 'dist/',
})
