const { onPreBootstrap } = require('../onPreBootstrap');

const reporter = {
  panic: jest.fn(),
}

beforeEach(() => {
  reporter.panic.mockClear();
});

describe('onPreBootstrap', () => {
  test('pass all', async () => {
    const pluginOptions = {
      mediaType: 'microcmsBlog', // string
      field: 'headImage', // string
      quality: 50 // int
    };
    await onPreBootstrap(
      {
        reporter,
      },
      pluginOptions
    );
    expect(reporter.panic.mock.calls.length).toBe(0);
  });

  test('pass mediaType, field', async () => {
    const pluginOptions = {
      mediaType: 'microcmsBlog', // string
      field: 'headImage', // string
    };
    await onPreBootstrap(
      {
        reporter,
      },
      pluginOptions
    );
    expect(reporter.panic.mock.calls.length).toBe(0);
  });

  test('pass null', async () => {
    const pluginOptions = null;
    await onPreBootstrap(
      {
        reporter,
      },
      pluginOptions
    );
    expect(reporter.panic.mock.calls.length).toBe(1);
  });

  test('pass undefined', async () => {
    const pluginOptions = undefined;
    await onPreBootstrap(
      {
        reporter,
      },
      pluginOptions
    );
    expect(reporter.panic.mock.calls.length).toBe(1);
  });

  test('pass field only', async () => {
    const pluginOptions = { field: 'a' };
    await onPreBootstrap(
      {
        reporter,
      },
      pluginOptions
    );
    expect(reporter.panic.mock.calls.length).toBe(1);
  });

  test('pass mediaType only', async () => {
    const pluginOptions = { mediaType: 'a' };
    await onPreBootstrap(
      {
        reporter,
      },
      pluginOptions
    );
    expect(reporter.panic.mock.calls.length).toBe(1);
  });
});
