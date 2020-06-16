const fetch = require('node-fetch');

/**
 * imgタグ・sourceタグ用のsrcsetを作る
 * @param {string} urlBase
 * @param {number[]} widths
 * @param {number} quality
 * @param {boolean} isWebp
 * @param {number} fixedHeight
 */
const createSrcset = (urlBase, widths, quality, isWebp, fixedHeight) => {
  return widths
    .map(width => {
      const newUrl = new URL(urlBase);
      newUrl.searchParams.set('w', width);
      if (fixedHeight) {
        newUrl.searchParams.set('h', fixedHeight);
        newUrl.searchParams.set('fit', 'crop');
      }
      newUrl.searchParams.set('q', quality);
      if (isWebp) {
        newUrl.searchParams.set('fm', 'webp');
      }
      return `${newUrl.href} ${width}w`;
    })
    .join(', ');
};
exports.createSrcset = createSrcset;

/**
 * @param {object} source
 * @param {object} source.internal
 * @param {string} source.internal.type
 * @param {object} args
 * @param {number} args.quality
 * @param {number} args.fixedHeight
 * @param {object} pluginOptions
 * @param {string} pluginOptions.mediaType
 * @param {string} pluginOptions.field
 */
const resolver = async (source, args, pluginOptions, reporter) => {
  if (!source.internal || source.internal.type !== pluginOptions.mediaType) {
    return;
  }
  if (!source[pluginOptions.field] || !source[pluginOptions.field].url) {
    return;
  }

  const url = source[pluginOptions.field].url;
  let json;
  try {
    json = await fetch(url + '?fm=json').then(res => res.json());
  } catch (e) {
    reporter.warn(`fetch failed: ${url}`);
    return;
  }
  const rates = [1 / 4, 1 / 2, 3 / 4, 1, 2, 3];
  const widths = rates.map(rate => {
    return parseInt(json.PixelWidth * rate, 10);
  });

  return {
    aspectRatio: json.PixelWidth / json.PixelHeight,
    src: url,
    srcSet: createSrcset(url, widths, args.quality, false, args.fixedHeight),
    srcSetType: json['Content-Type'],
    srcWebp: `${url}?fm=webp`,
    srcSetWebp: createSrcset(url, widths, args.quality, true, args.fixedHeight),
    sizes: '(max-width: 800px) 100vw, 800px',
  };
};
exports.resolver = resolver;
exports.createSchemaCustomization = ({ actions, reporter }, pluginOptions) => {
  actions.createFieldExtension({
    name: 'fluid',
    args: {
      quality: {
        type: 'Int',
        defaultValue: 50,
      },
      fixedHeight: {
        type: 'Int',
      },
    },
    // The extension `args` (above) are passed to `extend` as
    // the first argument (`options` below)
    extend() {
      return {
        args: {
          quality: 'Int',
          fixedHeight: 'Int',
        },
        async resolve(source, args) {
          const result = await resolver(source, args, pluginOptions, reporter);
          return result;
        },
      };
    },
  });
  actions.createTypes(`
    type MicrocmsBlog implements Node {
      fluid: Fluid @fluid
    }
    type Fluid {
      aspectRatio: Float!
      src: String!
      srcSet: String!
      srcSetType: String!
      srcSetWebp: String!
      srcWebp: String!
      sizes: String!
    }
  `);
};
