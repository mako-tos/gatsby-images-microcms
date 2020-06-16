[![Coverage Status](https://coveralls.io/repos/github/mako-tos/gatsby-images-microcms/badge.svg?branch=master)](https://coveralls.io/github/mako-tos/gatsby-images-microcms?branch=master)
![NPM](https://img.shields.io/npm/l/@mako-tos/gatsby-images-microcms)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/mako-tos/gatsby-images-microcms)
![npm (scoped)](https://img.shields.io/npm/v/@mako-tos/gatsby-images-microcms)

# @mako-tos/gatsby-images-microcms

images plugin for Gatsby from [microCMS](https://microcms.io/).

## Install

```sh
# with yarn
$ yarn add @mako-tos/gatsby-images-microcms
```

```sh
# with npm
$ npm install @mako-tos/gatsby-images-microcms
```

## How to use

### gatsby-config.js

#### This npm module is installed with gatsby-source-microcms

You need setting options in `gatsby-config.js`.

```js
const path = require(`path`);

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-microcms',
      options: {
        apiKey: process.env.MICRO_CMS_API_KEY,
        serviceId: process.env.MICRO_CMS_SERVICE_ID,
        endpoint: 'blog',
      },
    },
    {
      resolve: '@mako-tos/gatsby-images-microcms',
      options: {
        mediaType: 'microcmsBlog', // string
        field: 'hero', // string
      },
    },
  ],
};
```

### gatsby-node.js

You can query like the following. Gatsby create Pages based on microCMS contents.

```js
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  /**
   * you can pass following parameters
   * fixedHeight: set if image height fix
   * quality: set image quality
   *          default value is 50
   */
  const result = await graphql(
    `
      {
        allMicrocmsPost(sort: { fields: [createdAt], order: DESC }) {
          edges {
            node {
              id
              createdAt
              hero {
                url
              }
              fluid(fixedHeight: 400, quality: 70) {
                aspectRatio
                src
                srcSet
                srcSetType
                srcWebp
                srcSetWebp
                sizes
              }
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    throw result.errors;
  }

  result.data.allMicrocmsPost.edges.forEach((edge, index) => {
    const post = edge.node
    createPage({
      path: post.id,
      component: path.resolve('./src/templates/blog-post.js'),
      context: {
        slug: post.id,
        heroFluid: post.fluid
      },
    });
  });
};
```

### Options

```js
module.exports = {
  plugins: [
    {
      resolve: '@mako-tos/gatsby-images-microcms',
      options: {
        /**
         * Target GraphQL Table Name (Required)
         *
         * Type: string.
         * default: undefined,
         **/
        mediaType: 'MicrocmsBlog',

        /**
         * Table's html field Name (Required)
         *
         * Type: string.
         * default: undefined,
         **/
        field: 'body',
      },
    },
  ],
};
```
