const { createSchemaCustomization, createSrcset, resolver } = require('../createSchemaCustomization');

const fetch = require("node-fetch");
jest.mock("node-fetch", () => jest.fn());

const actions = {
  createFieldExtension: jest.fn(),
  createTypes: jest.fn(),
};
const reporter = { warn: jest.fn() };

beforeEach(() => {
  actions.createFieldExtension.mockClear();
  actions.createTypes.mockClear();
  reporter.warn.mockClear();
});

describe('createSchemaCustomization', () => {
  test('success anyway', async () => {
    const pluginOptions = [{}];

    await createSchemaCustomization(
      {
        actions,
        reporter,
      },
      pluginOptions
    );
    expect(reporter.warn.mock.calls.length).toBe(0);
    expect(actions.createFieldExtension.mock.calls.length).toBe(1);
    expect(actions.createTypes.mock.calls.length).toBe(1);
  });
});

describe('createSrcset', () => {
  test('passed empty array then return empty string', async () => {
    const srcset = createSrcset(
      'https://some-server.com/some-image.jpg',
      [],
      90,
      false,
      undefined
    );
    expect(srcset).toBe('');
  });

  test('with number return url string', async () => {
    const srcset = createSrcset(
      'https://some-server.com/some-image.jpg',
      [10],
      90,
      false,
      undefined
    );
    expect(srcset).toMatch(/w=10/);
    expect(srcset).toMatch(/q=90/);
    expect(srcset).not.toMatch(/fm=/);
    expect(srcset).not.toMatch(/h=/);
    expect(srcset).not.toMatch(/fit=/);
  });

  test('with numbers return url string', async () => {
    const srcset = createSrcset(
      'https://some-server.com/some-image.jpg',
      [10, 20],
      90,
      false,
      undefined
    );
    expect(srcset).toMatch(/w=10/);
    expect(srcset).toMatch(/w=20/);
    expect(srcset).toMatch(/q=90/);
    expect(srcset).not.toMatch(/fm=/);
    expect(srcset).not.toMatch(/h=/);
    expect(srcset).not.toMatch(/fit=/);
  });

  test('with numbers and isWebp = true then return url string', async () => {
    const srcset = createSrcset(
      'https://some-server.com/some-image.jpg',
      [10, 20],
      90,
      true,
      undefined
    );
    expect(srcset).toMatch(/w=10/);
    expect(srcset).toMatch(/w=20/);
    expect(srcset).toMatch(/q=90/);
    expect(srcset).toMatch(/fm=webp/);
    expect(srcset).not.toMatch(/h=/);
    expect(srcset).not.toMatch(/fit=/);
  });

  test('with numbers return url string', async () => {
    const srcset = createSrcset(
      'https://some-server.com/some-image.jpg',
      [10, 20],
      90,
      false,
      30
    );
    expect(srcset).toMatch(/w=10/);
    expect(srcset).toMatch(/w=20/);
    expect(srcset).toMatch(/q=90/);
    expect(srcset).not.toMatch(/fm=/);
    expect(srcset).toMatch(/h=30/);
    expect(srcset).toMatch(/fit=crop/);
  });
});

describe('resolver', () => {
  test('exit if source.internal is falsy', async () => {
    await resolver(
      {},
    );
    expect(reporter.warn.mock.calls.length).toBe(0);
  });

  test('exit if source.internal.type and pluginOptions.mediaType is miss match', async () => {
    const source = {
      internal: {
        type: 'a'
      }
    }
    const pluginOptions = [{
      mediaType: 'b'
    }]
    await resolver(
      source,
      {},
      pluginOptions,
      reporter
    );
    expect(reporter.warn.mock.calls.length).toBe(0);
  });

  test('exit if source[pluginOptions.field] is falsy', async () => {
    const source = {
      internal: {
        type: 'a'
      },
      b: false
    }
    const pluginOptions = [{
      mediaType: 'a',
      field: 'b'
    }]
    await resolver(
      source,
      {},
      pluginOptions,
      reporter
    );
    expect(reporter.warn.mock.calls.length).toBe(0);
  });

  test('exit if source[pluginOptions.field] do not have url', async () => {
    const source = {
      internal: {
        type: 'a'
      },
      b: {}
    }
    const pluginOptions = [{
      mediaType: 'a',
      field: 'b'
    }]
    await resolver(
      source,
      {},
      pluginOptions,
      reporter
    );
    expect(reporter.warn.mock.calls.length).toBe(0);
  });

  test('panic will called if fetch failed', async () => {
    const dummyResponse = Promise.resolve({
      ok: false,
      status: 400,
      json: () => {
        throw new Error("Failed");
      },
    });
    fetch.mockImplementation(() => dummyResponse);

    const source = {
      internal: {
        type: 'a'
      },
      b: {
        url: 'http://some-server.com/some-image.png'
      }
    }
    const pluginOptions = [{
      mediaType: 'a',
      field: 'b'
    }]
    await resolver(
      source,
      {},
      pluginOptions,
      reporter
    );
    expect(reporter.warn.mock.calls.length).toBe(1);
  });

  test('return object if fetch successed', async () => {
    const dummyResponse = Promise.resolve({
      ok: false,
      status: 200,
      json: () => {
        return { 'Content-Type': 'image/png', PixelWidth: 10, PixelHeight: 20 }
      },
    });
    fetch.mockImplementation(() => dummyResponse);

    const url = 'http://some-server.com/some-image.png'
    const source = {
      internal: {
        type: 'a'
      },
      b: {
        url, 
      }
    }
    const args = { quality: 70, fixedHeight: 10 }
    const pluginOptions = [{
      mediaType: 'a',
      field: 'b'
    }]
    const result = await resolver(
      source,
      args,
      pluginOptions,
      reporter
    );
    expect(reporter.warn.mock.calls.length).toBe(0);
    expect(result.src).toBe(url);
  });
});
