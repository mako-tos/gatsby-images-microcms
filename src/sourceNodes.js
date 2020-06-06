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
  { actions, createNodeId, createContentDigest, getNode, getNodesByType },
  pluginOptions
) {
  const { createNode, createParentChildLink } = actions;

  const nodeList = getNodesByType(pluginOptions.mediaType);

  const quality = pluginOptions.quality || 80;
  const rates = [1 / 4, 1 / 2, 1, 2, 4];
  await Promise.all(
    nodeList.map(async node => {
      const { field } = pluginOptions;

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
            `${pluginOptions.mediaType}-${pluginOptions.field}-images-${node.id}`
          ),
          parent: node.id,
          children: [],
          internal: {
            type: camelCase(
              [pluginOptions.mediaType, pluginOptions.field, 'image'],
              { pascalCase: true }
            ),
            contentDigest: createContentDigest(newNode),
          },
        };
        await createNode(microcmsImageNode);
        const createdImageNode = getNode(microcmsImageNode.id);
        createParentChildLink({ parent: node, child: createdImageNode });
      }
    })
  );
}
module.exports = {
  sourceNodes,
};
