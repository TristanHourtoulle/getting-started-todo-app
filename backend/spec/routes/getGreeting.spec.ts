import { getGreeting } from '../../src/routes/getGreeting';

test('it returns the greeting correctly', async () => {
  const req = {};
  const res = { send: jest.fn() };

  await getGreeting(req as any, res as any);

  expect(res.send.mock.calls.length).toBe(1);
  expect(res.send.mock.calls[0]?.[0]).toEqual({ greeting: 'Hello world!' });
});
