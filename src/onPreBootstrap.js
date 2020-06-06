const validateOptions = ({ reporter }, options) => {
  if (!options) {
    reporter.panic('need options');
    return;
  }

  if (!options.mediaType || typeof options.mediaType !== 'string') {
    reporter.panic('need mediaType and must be string');
    return;
  }

  if (!options.field || typeof options.field !== 'string') {
    reporter.panic('need field and must be string');
    return;
  }

  if (options.quality && typeof options.quality !== 'number') {
    reporter.panic('quality must be number');
    return;
  }
};
module.exports = {
  onPreBootstrap: validateOptions
};
