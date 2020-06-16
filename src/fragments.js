const { graphql } = require('gatsby');

exports.FluidWithWebp = graphql`
fragment FluidWithWebp on Fluid {
    aspectRatio
    src
    srcSet
    srcSetType
    srcWebp
    srcSetWebp
    sizes
  }
`
