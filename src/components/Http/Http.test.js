const http = require('./http');

describe('http', () => {
  let res;
  const json = jest.fn();
  const end = jest.fn();

  beforeEach(() => {
    res = {
      status: jest.fn(),
    };
    res.status.mockReturnValue({ end, json });
  });

  test('badRequest returns 400 with error', () => {
    http.badRequest(res, ['error']);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(json.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "errors": Array [
            "error",
          ],
          "name": "BadRequest",
        },
      ]
    `);
  });

  test('created returns 201', () => {
    const body = {};
    http.created(res, body);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(json.mock.calls[0][0]).toBe(body);
  });

  test('accepted returns 202', () => {
    http.accepted(res, 'some message');

    expect(res.status).toHaveBeenCalledWith(202);
    expect(json.mock.calls[0][0].message).toBe('some message');
  });

  test('noContent returns 204', () => {
    http.noContent(res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(end).toHaveBeenCalled();
  });

  test('notFound returns 404', () => {
    http.notFound(res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(json.mock.calls[0][0].name).toEqual('NotFound');
  });

  test('notFound adds custom message', () => {
    http.notFound(res, 'custom message');

    expect(res.status).toHaveBeenCalledWith(404);
    expect(json.mock.calls[0][0].message).toEqual('custom message');
  });

  test('ok return body as json', () => {
    const body = {};

    http.ok(res, body);

    expect(json.mock.calls[0][0]).toBe(body);
  });

  test('unauthorized returns 401', () => {
    http.unauthorized(res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(json.mock.calls[0][0].name).toEqual('Unauthorized');
  });
});
