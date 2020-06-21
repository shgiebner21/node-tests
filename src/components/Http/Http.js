export const accepted = (res, message) => {
  res.status(202).json({ message });
};

export const badRequest = (res, errors) => {
  res.status(400).json({
    name: 'BadRequest',
    errors,
  });
};

export const created = (res, entity) => {
  res.status(201).json(entity);
};

export const noContent = res => {
  res.status(204).end();
};

export const notFound = (res, message = 'Resource not found') => {
  res.status(404).json({
    message,
    name: 'NotFound',
  });
};

export const serverError = res => {
  res.status(500).json({
    message: 'The server encountered an error processing the request',
    name: 'InternalServerError',
  });
};

export const ok = (res, body) => {
  res.status(200).json(body);
};

export const unauthorized = res => {
  res.status(401).json({
    message: 'The user is not authorized',
    name: 'Unauthorized',
  });
};

export const forbidden = res => {
  res.status(403).json({
    message: 'The user is not allowed',
    name: 'Forbidden',
  });
};
