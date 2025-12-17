# App Troubleshooting Guide

## Current Issue: "Text strings must be rendered within a <Text> component" Error

This error keeps occurring even after multiple fixes. The issue is that somewhere in the React Native app, a string is being rendered directly without being wrapped in a `<Text>` component.

### What We've Fixed:
1. ✅ All `setUser()` calls wrapped in `requestAnimationFrame`
2. ✅ All `setLoading()` calls wrapped in `requestAnimationFrame`
3. ✅ Added null checks for `user.full_name` before rendering
4. ✅ Added loading state check

### Possible Remaining Issues:

1. **User Object Structure**: The user object might not have all required fields when it's first set
2. **Component Re-rendering**: Components might be trying to render user data before it's fully initialized
3. **Async State Updates**: State updates might be happening during render cycles

### To Debug Further:

1. Check React Native Dev Menu:
   - Shake device or press `Ctrl+M` on emulator
   - Enable "Show Inspector"
   - Check what's being rendered

2. Add console logs:
   ```javascript
   console.log('User object:', JSON.stringify(user, null, 2));
   ```

3. Check if user object is complete before rendering:
   - Ensure `user.full_name` exists
   - Ensure `user.email` exists
   - Ensure `user.user_type` exists

### Quick Fix to Try:

Add this validation function and use it everywhere:

```javascript
const isValidUser = (user: User | null): user is User => {
  return user !== null && 
         typeof user.full_name === 'string' && 
         user.full_name.length > 0 &&
         typeof user.email === 'string' &&
         typeof user.user_type === 'string';
};
```

Then only render when user is valid:
```javascript
{isValidUser(user) && (
  // render user content
)}
```

