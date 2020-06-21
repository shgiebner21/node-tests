import { acceptInvite } from './acceptInvite';
import { createUserFromInvite } from '../../helpers/user/createUserFromInvite';
import { badRequest, ok } from '../http';
import { database } from 'palmetto-core/dist/db/mongo';

jest.mock('../http');
jest.mock('palmetto-core/dist/db/mongo');
jest.mock('../../helpers/user/createUserFromInvite');

it('returns bad request with details when required params are not supplied', async () => {
  await acceptInvite({ body: {} });

  expect(badRequest.mock.calls[0][1]).toMatchInlineSnapshot(`
    Array [
      Object {
        "code": "required",
        "message": "invitationId is a required field",
        "value": "invitationId",
      },
      Object {
        "code": "required",
        "message": "auth0User is a required field",
        "value": "auth0User",
      },
    ]
  `);
});

it('returns badRequest if invitation cannot be found', async () => {
  await acceptInvite({ body: { invitationId: '5ea2295b0a71cf003b20710a', auth0User: {} } });

  expect(badRequest.mock.calls[0][1]).toMatchInlineSnapshot(`
    Array [
      Object {
        "code": "invite-not-found",
        "message": "invite for supplied inviteId could not be found",
      },
    ]
  `);
});

it('should badRequest when the invitation is missing information', async () => {
  database.invites.getById.mockResolvedValueOnce({ id: '5ea2295b0a71cf003b20710a' });
  await acceptInvite({ body: { invitationId: '5ea2295b0a71cf003b20710a', auth0User: {} } });

  expect(badRequest.mock.calls[0][1]).toMatchInlineSnapshot(`
    Array [
      Object {
        "code": "invite-without-contact",
        "message": "invite does not contain a contact id",
      },
    ]
  `);
});

it('creates a user for an unaccpeted invite', async () => {
  const req = {
    body: {
      invitationId: '5ea2295b0a71cf003b20710a',
      auth0User: { sub: 'auth0Id | 329048230948' },
    },
  };

  database.invites.getById.mockResolvedValueOnce({ id: 'some-id', contactId: 'some-contact-id' });

  await acceptInvite(req);

  expect(createUserFromInvite.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      Object {
        "contactId": "some-contact-id",
        "id": "some-id",
      },
      Object {
        "sub": "auth0Id | 329048230948",
      },
    ]
  `);
  expect(ok).toHaveBeenCalledTimes(1);
});

it('returns an existing user if invite is already accepted', async () => {
  const req = {
    body: {
      invitationId: '5ea2295b0a71cf003b20710a',
      auth0User: { sub: 'auth0Id | 329048230948' },
    },
  };

  database.invites.getById.mockResolvedValueOnce({ id: 'some-id', contactId: 'some-contact-id' });
  database.users.findOne.mockResolvedValueOnce({ id: 'some-id' });

  await acceptInvite(req);

  expect(createUserFromInvite).not.toHaveBeenCalled();
  expect(ok.mock.calls[0][1]).toMatchInlineSnapshot(`
    Object {
      "id": "some-id",
    }
  `);
});
