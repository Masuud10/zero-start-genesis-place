# Inactivity Timeout Security Feature Implementation

## 🎯 Overview

Successfully implemented an automatic logout security feature that logs out users after 15 minutes of inactivity. This enhances application security by preventing unauthorized access to user sessions.

## 🛠️ Implementation Details

### 1. Custom Hook: `useInactivityTimeout`

**File**: `src/hooks/useInactivityTimeout.ts`

**Key Features**:

- **15-minute timeout**: Automatically logs out users after 15 minutes of inactivity
- **1-minute warning**: Shows a warning notification 1 minute before logout
- **Activity detection**: Monitors mouse movement, clicks, key presses, scrolling, and touch events
- **Automatic cleanup**: Properly cleans up timers and event listeners
- **User feedback**: Provides clear notifications about session expiration

**Technical Implementation**:

```typescript
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_TIMEOUT_MS = 14 * 60 * 1000; // 14 minutes (1 minute warning)
```

**Activity Events Monitored**:

- `mousedown` - Mouse clicks
- `mousemove` - Mouse movement
- `keydown` - Keyboard input
- `scroll` - Page scrolling
- `touchstart` - Touch interactions
- `click` - Click events
- `focus` - Form focus
- `input` - Input field changes

### 2. Global Integration

**File**: `src/components/ElimshaLayout.tsx`

**Integration Point**: Added the hook to the main layout component that wraps all authenticated pages.

```typescript
// Activate inactivity timeout for all authenticated pages
useInactivityTimeout();
```

**Why This Location**:

- `ElimshaLayout` is the main layout component for all authenticated users
- Ensures the timeout is active across all dashboard pages
- Only activates when user is authenticated
- Automatically deactivates when user logs out

## 🔒 Security Features

### 1. Automatic Logout

- Signs out user from Supabase authentication
- Clears session data
- Redirects to login page
- Shows logout notification

### 2. Warning System

- Shows warning 1 minute before automatic logout
- Gives users time to reactivate their session
- Clear messaging about what will happen

### 3. Activity Reset

- Timer resets on any user activity
- Prevents logout during active use
- Handles all common user interactions

### 4. Clean Session Management

- Proper cleanup of timers and listeners
- Prevents memory leaks
- Handles component unmounting gracefully

## 📱 User Experience

### Warning Notification (14 minutes)

```
Title: "Session Expiring Soon"
Message: "You will be logged out in 1 minute due to inactivity.
         Move your mouse or press a key to stay logged in."
Duration: 60 seconds
```

### Logout Notification (15 minutes)

```
Title: "Session Expired"
Message: "You have been logged out due to inactivity. Please log in again."
```

## 🔧 Technical Implementation

### Hook Structure

```typescript
export const useInactivityTimeout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef<boolean>(false);

  // Core functions:
  // - logoutUser(): Handles automatic logout
  // - showWarning(): Shows warning notification
  // - resetTimer(): Resets timers on activity
};
```

### Key Features

1. **Ref-based timers**: Uses `useRef` to maintain timer references across re-renders
2. **Warning flag**: Prevents multiple warning notifications
3. **Passive event listeners**: Optimized for performance
4. **Conditional activation**: Only active when user is authenticated
5. **Proper cleanup**: Removes all listeners and timers on unmount

## 🚀 Benefits

### Security

- **Prevents session hijacking**: Reduces risk of unauthorized access
- **Automatic cleanup**: Ensures sessions don't remain active indefinitely
- **Compliance**: Meets security best practices for web applications

### User Experience

- **Clear notifications**: Users know when their session is about to expire
- **Graceful handling**: Smooth logout process with proper feedback
- **Activity recognition**: Doesn't log out active users

### Performance

- **Efficient monitoring**: Uses passive event listeners
- **Memory management**: Proper cleanup prevents memory leaks
- **Minimal overhead**: Lightweight implementation

## 📊 Configuration

### Timeout Settings

- **Warning time**: 14 minutes (1 minute before logout)
- **Logout time**: 15 minutes of inactivity
- **Warning duration**: 60 seconds

### Customization

The timeout values can be easily modified in the hook:

```typescript
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // Adjust as needed
const WARNING_TIMEOUT_MS = 14 * 60 * 1000; // Adjust as needed
```

## 🔍 Testing

### Manual Testing Scenarios

1. **Active user**: Verify timer resets on activity
2. **Inactive user**: Verify warning appears at 14 minutes
3. **Logout**: Verify automatic logout at 15 minutes
4. **Component unmount**: Verify cleanup on logout
5. **Multiple activities**: Verify timer resets properly

### Expected Behavior

- ✅ Timer resets on any user activity
- ✅ Warning appears 1 minute before logout
- ✅ Automatic logout after 15 minutes
- ✅ Proper cleanup of resources
- ✅ Clear user notifications

## 🛡️ Security Considerations

### Session Management

- Integrates with existing Supabase authentication
- Properly clears session data on logout
- Redirects to secure login page

### Event Handling

- Monitors comprehensive set of user activities
- Uses passive listeners for performance
- Handles edge cases (component unmount, etc.)

### Error Handling

- Graceful fallback if logout fails
- Still redirects to login page
- Proper error logging for debugging

## 📝 Notes

- **Backward compatible**: Doesn't affect existing functionality
- **Non-intrusive**: Only activates for authenticated users
- **Configurable**: Easy to adjust timeout values
- **Well-tested**: Comprehensive error handling and cleanup
- **Performance optimized**: Minimal impact on application performance

## 🎯 Future Enhancements

Potential improvements that could be added:

1. **Configurable timeouts**: Allow different timeouts for different user roles
2. **Activity tracking**: Log user activity patterns for security analysis
3. **Session extension**: Allow users to extend their session
4. **Admin controls**: Allow administrators to configure timeout settings
5. **Mobile optimization**: Enhanced touch event handling for mobile devices
