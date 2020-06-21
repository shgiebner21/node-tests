import * as yup from 'yup';
import { badRequest, ok } from '../http';
import formatSchemaValidation from '../../helpers/formatSchemaValidation';
import { database } from 'palmetto-core/dist/db/mongo';
import { createUserFromInvite } from '../../helpers/user/createUserFromInvite';

const acceptInviteRequest = yup.object().shape({
  invitationId: yup.string().required(),
  auth0User: yup.object().required(),
});

export const acceptInvite = async (req, res) => {
  const { invitationId, auth0User } = req.body;

  try {
    const validationErrors = await formatSchemaValidation(acceptInviteRequest, req.body);

    if (validationErrors && validationErrors.length > 0) {
      return badRequest(res, validationErrors);
    }

    const invite = await database.invites.getById(invitationId);

    if (!invite) {
      return badRequest(res, [
        { code: 'invite-not-found', message: 'invite for supplied inviteId could not be found' },
      ]);
    }
    if (!invite.contactId) {
      return badRequest(res, [{ code: 'invite-without-contact', message: 'invite does not contain a contact id' }]);
    }

    const existingUser = await database.users.findOne({ auth0UserId: auth0User.sub });
    if (existingUser) {
      return ok(res, existingUser);
    }

    await createUserFromInvite(invite, auth0User);
    ok(res);
  } catch (err) {
    badRequest(res, err);
  }
};
