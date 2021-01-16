const validateOptions = ({ reporter }, options) => {
  if (!options) {
    reporter.panic('need options');
    return;
  }

  for (const i in options) {
    if (i === 'plugins') {
      continue;
    }
    const option = options[i]
    if (!option.mediaType || typeof option.mediaType !== 'string') {
      reporter.panic('need mediaType and must be string');
      return;
    }
  
    if (!option.field || typeof option.field !== 'string') {
      reporter.panic('need field and must be string');
      return;
    }
  
    if (option.quality && typeof option.quality !== 'number') {
      reporter.panic('quality must be number');
      return;
    }
  }
};
module.exports = {
  onPreBootstrap: validateOptions
};
