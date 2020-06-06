# gatsby-remark-images-microcms

images plugin for Gatsby from [microCMS](https://microcms.io/).

## Install

this program is under testing so dont do yarn add or npm install..

```sh
# with yarn
$ yarn add gatsby-images-microcms
```

```sh
# with npm
$ npm install gatsby-images-microcms
```

## How to use

### gatsby-config.js

#### This npm is installed with gatsby-source-microcms

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
      resolve: 'gatsby-images-microcms',
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

  const result = await graphql(
    `
      {
        allMicrocmsPost(sort: { fields: [createdAt], order: DESC }) {
          edges {
            node {
              id
              createdAt
              childMicrocmsBlogHero {
                aspectRatio
                presentationHeight
                presentationWidth
                sizes
                src
                srcSet
                srcSetWebp
                srcWebp
                type
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
        heroFluid: post.childMicrocmsBlogHero
      },
    });
  });
};
```
