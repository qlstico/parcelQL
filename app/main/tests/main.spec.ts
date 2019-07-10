import getApp from './getapp';

jest.setTimeout(60000);
let app;

afterEach(async () => {
  if (app && app.isRunning()) {
    return await app.stop();
  }
});
beforeEach(async () => {
  app = getApp();
  return await app.start();
});

test('application title', async () => {
  expect(await app.client.getTitle()).toBe('QLStico');
});
