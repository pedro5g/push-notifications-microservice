export function getAvailablePermissions(): Record<string, string[]> {
  return {
    notifications: ['send', 'read', 'cancel', 'schedule', 'template', 'admin'],
    webhooks: ['create', 'read', 'update', 'delete', 'manage', 'logs'],
    subscribers: ['read', 'create', 'update', 'delete', 'segment', 'export'],
    analytics: ['read', 'export', 'advanced'],
    project: ['read', 'update', 'delete', 'admin'],
    special: ['*'],
  };
}

export function validatePermissions(permissions: string[]): {
  valid: boolean;
  invalid: string[];
  suggestions: string[];
} {
  const available = getAvailablePermissions();
  const allValid = Object.entries(available).flatMap(([resource, actions]) => {
    return actions.map((action) => `${resource}:${action}`);
  });

  const invalid = permissions.filter((perm) => !allValid.includes(perm));
  const suggestions = invalid.map((perm) => {
    const [resource] = perm.split(':');
    return available[resource as keyof typeof available]
      ? `Did you mean: ${(available[resource as keyof typeof available] || []).map((a) => `${resource}:${a}`).join(', ')}?`
      : `Unknown resource: ${resource}`;
  });

  return {
    valid: invalid.length === 0,
    invalid,
    suggestions,
  };
}

export function checkPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  if (userPermissions.includes('*')) {
    return true;
  }

  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  const [resource, action] = requiredPermission.split(':');
  if (userPermissions.includes(`${resource}:*`)) {
    return true;
  }

  if (userPermissions.includes('project:admin')) {
    return true;
  }

  if (
    requiredPermission.startsWith('webhooks:') &&
    ['create', 'read', 'update', 'delete'].includes(action as string) &&
    userPermissions.includes('webhooks:manage')
  ) {
    return true;
  }

  if (
    requiredPermission.startsWith('notifications:') &&
    userPermissions.includes('notifications:admin')
  ) {
    return true;
  }

  return false;
}
