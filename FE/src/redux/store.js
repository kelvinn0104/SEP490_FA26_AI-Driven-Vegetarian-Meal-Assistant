/**
 * Redux Store Configuration placeholder / setup
 */

export const initialRootState = {
  auth: {
    isAuthenticated: false,
    userRole: 'admin',
    currentUser: null,
  },
  system: {
    pendingModerationCount: 14,
    theme: 'light',
  },
};

export function rootReducer(state = initialRootState, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return {
        ...state,
        auth: { ...state.auth, userRole: action.payload },
      };
    case 'SET_PENDING_COUNT':
      return {
        ...state,
        system: { ...state.system, pendingModerationCount: action.payload },
      };
    default:
      return state;
  }
}

export default rootReducer;
