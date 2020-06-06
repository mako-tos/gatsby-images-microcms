const { sourceNodes } = require('../sourceNodes');

jest.mock('node-fetch', () => {
  const dummyResponse = Promise.resolve({
    ok: true,
    status: 200,
    json: () => {
      return { 'Content-Type': 'image/png', PixelHeight: 10, PixelWidth: 20 };
    },
  });
  return jest.fn().mockReturnValue(dummyResponse);
});

const actions = {
  createNode: jest.fn(),
  createParentChildLink: jest.fn(),
};
const createNodeId = jest.fn().mockReturnValue('nodeId');
const createContentDigest = jest.fn().mockReturnValue('digest');
const getNode = jest.fn().mockReturnValue({});
const reporter = { warn: jest.fn() };

beforeEach(() => {
  actions.createNode.mockClear();
  actions.createParentChildLink.mockClear();
  createNodeId.mockClear();
  createContentDigest.mockClear();
  getNode.mockClear();
  reporter.warn.mockClear();
});

describe('sourceNodes', () => {
  test('target nodes missing', async () => {
    const getNodesByType = jest.fn().mockReturnValue([]);
    const pluginOptions = {
      type: 'blog', // string
      field: 'headImage', // string
    };

    await sourceNodes(
      {
        actions,
        createNodeId,
        createContentDigest,
        getNode,
        getNodesByType,
        reporter,
      },
      pluginOptions
    );
    expect(reporter.warn.mock.calls.length).toBe(1);
    expect(getNodesByType.mock.calls.length).toBe(1);
    expect(actions.createNode.mock.calls.length).toBe(0);
    expect(createNodeId.mock.calls.length).toBe(0);
    expect(createContentDigest.mock.calls.length).toBe(0);
    expect(getNode.mock.calls.length).toBe(0);
    expect(actions.createParentChildLink.mock.calls.length).toBe(0);
  });

  test('target nodes dont have url', async () => {
    const getNodesByType = jest.fn().mockReturnValue([{}]);
    const pluginOptions = {
      type: 'blog', // string
      field: 'headImage', // string
    };

    await sourceNodes(
      {
        actions,
        createNodeId,
        createContentDigest,
        getNode,
        getNodesByType,
        reporter,
      },
      pluginOptions
    );
    expect(reporter.warn.mock.calls.length).toBe(0);
    expect(getNodesByType.mock.calls.length).toBe(1);
    expect(actions.createNode.mock.calls.length).toBe(0);
    expect(createNodeId.mock.calls.length).toBe(0);
    expect(createContentDigest.mock.calls.length).toBe(0);
    expect(getNode.mock.calls.length).toBe(0);
    expect(actions.createParentChildLink.mock.calls.length).toBe(0);
  });

  test('1 target node have url', async () => {
    const getNodesByType = jest
      .fn()
      .mockReturnValue([{ headImage: { url: 'https://some-server.com/img' } }]);
    const pluginOptions = {
      mediaType: 'blog', // string
      field: 'headImage', // string
      quality: 10,
    };

    await sourceNodes(
      {
        actions,
        createNodeId,
        createContentDigest,
        getNode,
        getNodesByType,
        reporter,
      },
      pluginOptions
    );
    expect(reporter.warn.mock.calls.length).toBe(0);
    expect(getNodesByType.mock.calls.length).toBe(1);
    expect(actions.createNode.mock.calls.length).toBe(1);
    expect(createNodeId.mock.calls.length).toBe(1);
    expect(createContentDigest.mock.calls.length).toBe(1);
    expect(getNode.mock.calls.length).toBe(1);
    expect(actions.createParentChildLink.mock.calls.length).toBe(1);
  });

  test('2 target nodes have url', async () => {
    const getNodesByType = jest
      .fn()
      .mockReturnValue([
        { headImage: { url: 'https://some-server.com/some-img.png' } },
        { headImage: { url: 'https://other-server.com/other-img.jpg' } },
      ]);
    const pluginOptions = {
      mediaType: 'blog', // string
      field: 'headImage', // string
    };

    await sourceNodes(
      {
        actions,
        createNodeId,
        createContentDigest,
        getNode,
        getNodesByType,
        reporter,
      },
      pluginOptions
    );
    expect(reporter.warn.mock.calls.length).toBe(0);
    expect(getNodesByType.mock.calls.length).toBe(1);
    expect(actions.createNode.mock.calls.length).toBe(2);
    expect(createNodeId.mock.calls.length).toBe(2);
    expect(createContentDigest.mock.calls.length).toBe(2);
    expect(getNode.mock.calls.length).toBe(2);
    expect(actions.createParentChildLink.mock.calls.length).toBe(2);
  });

  test('1 of 2 target node have url', async () => {
    const getNodesByType = jest
      .fn()
      .mockReturnValue([
        {},
        { headImage: { url: 'https://some-server.com/img' } },
      ]);
    const pluginOptions = {
      mediaType: 'blog', // string
      field: 'headImage', // string
    };

    await sourceNodes(
      {
        actions,
        createNodeId,
        createContentDigest,
        getNode,
        getNodesByType,
        reporter,
      },
      pluginOptions
    );
    expect(reporter.warn.mock.calls.length).toBe(0);
    expect(getNodesByType.mock.calls.length).toBe(1);
    expect(actions.createNode.mock.calls.length).toBe(1);
    expect(createNodeId.mock.calls.length).toBe(1);
    expect(createContentDigest.mock.calls.length).toBe(1);
    expect(getNode.mock.calls.length).toBe(1);
    expect(actions.createParentChildLink.mock.calls.length).toBe(1);
  });
});
