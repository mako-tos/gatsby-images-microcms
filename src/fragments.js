import { graphql } from 'gatsby';

export const FluidWithWebp = graphql`
  fragment FluidWithWebp on Fluid {
    aspectRatio
    src
    srcSet
    srcSetType
    srcWebp
    srcSetWebp
    sizes
  }
`;
