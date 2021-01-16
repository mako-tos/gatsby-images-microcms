const fetch = require('node-fetch');
const camelCase = require('camelcase');

/**
 * imgタグ・sourceタグ用のsrcsetを作る
 * @param {string} urlBase
 * @param {Array<object>} rectSet
 * @param {Number} quality
 * @param {boolean} isWebp
 */
const createSrcset = (urlBase, rectSet, quality, isWebp) => {
  return rectSet
    .map(rect => {
      const newUrl = new URL(urlBase);
      newUrl.searchParams.set('w', rect.w);
      newUrl.searchParams.set('h', rect.h);
      newUrl.searchParams.set('q', quality);
      if (isWebp) {
        newUrl.searchParams.set('fm', 'webp');
      }
      return `${newUrl.href} ${rect.w}w`;
    })
    .join(', ');
};
async function sourceNodes(
  {
    actions,
    createNodeId,
    createContentDigest,
    getNode,
    getNodesByType,
    reporter,
  },
  pluginOptions
) {
  const { createNode, createParentChildLink } = actions;
  const options = []
  for (const i in pluginOptions) {
    if (i !== 'plugins') {
      options.push(pluginOptions[i])
    }
  }

  const outerPromises = options.map(async option => {
    const nodeList = getNodesByType(option.mediaType);

    if (nodeList.length === 0) {
      reporter.warn(
        `mediaType(${option.mediaType}) is wrong or gatsby-source-microcms is under @mako-tos/gatsby-images-microcms check gatsby-config`
      );
    }
  
    const quality = option.quality || 80;
    const rates = [1 / 4, 1 / 2, 1, 2, 4];
  
    const promises = nodeList.map(async node => {
      const { field } = option;
  
      if (node[field] && node[field].url) {
        const url = node[field].url;
        const json = await fetch(url + '?fm=json').then(res => res.json());
        const rectSet = rates.map(rate => {
          return {
            h: parseInt(json.PixelHeight * rate, 10),
            w: parseInt(json.PixelWidth * rate, 10),
          };
        });
  
        const newNode = {
          type: json['Content-Type'],
          presentationHeight: json.PixelHeight,
          presentationWidth: json.PixelWidth,
          aspectRatio: json.PixelWidth / json.PixelHeight,
          srcWebp: `${url}?fm=webp`,
          src: url,
          srcSetWebp: createSrcset(url, rectSet, quality, true),
          srcSet: createSrcset(url, rectSet, quality, false),
          sizes: '(max-width: 800px) 100vm, 800px',
        };
  
        const microcmsImageNode = {
          ...newNode,
          id: createNodeId(
            `${option.mediaType}-${option.field}-${node.id}`
          ),
          parent: node.id,
          children: [],
          internal: {
            type: camelCase([option.mediaType, option.field], {
              pascalCase: true,
            }),
            contentDigest: createContentDigest(newNode),
          },
        };
        await createNode(microcmsImageNode);
        const createdImageNode = getNode(microcmsImageNode.id);
        createParentChildLink({ parent: node, child: createdImageNode });
      }
    })
    await Promise.all(promises);
  })
  await Promise.all(outerPromises);
}
module.exports = {
  sourceNodes,
};
