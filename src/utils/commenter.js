// The GraphQL `commenter` field is a double-encoded JSON string, or null when the
// commenter row is missing; callers may also pass an already parsed object.
export function parseCommenter(commenter) {
  let value = commenter;
  while (typeof value === 'string') value = JSON.parse(value);
  return value && typeof value === 'object' ? value : {};
}

export function formatCommenterName(commenterTypeName, commenter) {
  if (!commenterTypeName) return 'Anonymous User';

  if (commenterTypeName === 'individual') {
    const { firstName, lastName } = parseCommenter(commenter);
    const name = [firstName, lastName].filter(Boolean).join(' ');
    return name ? `Individual: ${name}` : 'Individual';
  }

  if (commenterTypeName === 'user') {
    const { username } = parseCommenter(commenter);
    return username ? `User: ${username}` : 'User';
  }

  return commenterTypeName;
}
