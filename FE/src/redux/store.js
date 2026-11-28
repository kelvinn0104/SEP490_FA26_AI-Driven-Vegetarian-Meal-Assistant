/**
 * Synchronized Root State (legacy compatibility module).
 * Single source of truth for authentication & role state in Web Admin Portal is `src/context/AuthContext.jsx`.
 * Do NOT store default mock roles or hardcoded moderation counts here.
 */

export const initialRootState = {
  auth: {
    isAuthenticated: false,
    userRole: null, // 'SuperAdmin' | 'Mod' | null
    currentUser: null,
  },
  system: {
    pendingModerationCount: 0,
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
        system: { ...state.system, pendingModerationCount: Number(action.payload) || 0 },
      };
    case 'LOGOUT':
      return initialRootState;
    default:
      return state;
  }
}

export default rootReducer;
