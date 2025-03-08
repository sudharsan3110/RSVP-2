export const API_MESSAGES = {
  USER: {
    NOT_FOUND: 'User not found or does not exist',
    PROFILE_INCOMPLETE: 'User profile is incomplete',
  },
  COHOST: {
    ADD: {
      INSUFFICIENT_PERMS_MANAGER_OR_CREATOR_REQUIRED:
        'Insufficient permissions: You need to be a Creator or Manager to add hosts to an event',
    },
    REMOVE: {
      SUCCESS: 'Cohost removed successfully',
      INSUFFICIENT_PERMS_MANAGER_OR_CREATOR_REQUIRED:
        'Insufficient permissions: You need to be a "Creator" to remove other "Manager"s',
      INSUFFICIENT_PERMS_CREATOR_REQUIRED:
        'Insufficient permissions: You need to be a "Creator" or a "Manager" to remove hosts',
      FAILED: 'Something went wrong while deleting the cohost record',
      CANNOT_REMOVE_CREATOR: 'Cannot remove Creator from hosts',
      CANNOT_REMOVE_SELF: 'Cannot remove self from hosts',
    },
  },
  EVENT: {
    NOT_FOUND: `Event not found or doesn't exists`,
  },
  ALLOW_GUEST: {
    UNAUTHORIZED_ACCESS: 'Unauthorized access',
    EVENTID_REQUIRED: 'Event ID is required',
    ATTENDEE_NOT_FOUND: 'Attendee not found',
    INVALID_TOKEN: 'Invalid or expired token',
    SUCCESSFUL_ATTENDEE_UPDATE: 'Attendee allow status updated successfully',
    SUCCESS: 'Success',
  },
};
