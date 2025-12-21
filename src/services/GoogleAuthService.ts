import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

class GoogleAuthService {
  private static instance: GoogleAuthService;
  private isConfigured = false;

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  async configure(): Promise<void> {
    if (this.isConfigured) {
      return;
    }

    try {
      GoogleSignin.configure({
        // Using the web client ID from google-services.json
        webClientId:
          '895230403778-7a4klalvtmjr7iokdqrj17e7pdirli5p.apps.googleusercontent.com',
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });

      this.isConfigured = true;
      console.log('Google Sign-In configured successfully');
    } catch (error) {
      console.error('Google Sign-In configuration error:', error);
      // Fall back to mock mode for demo
      this.isConfigured = false;
    }
  }

  async signIn(): Promise<{ user?: GoogleUser; error?: string }> {
    try {
      // Try to configure first
      await this.configure();

      if (!this.isConfigured) {
        // Use mock authentication for demo
        return this.mockSignIn();
      }

      // Check if device has Google Play Services
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Perform sign-in
      const result = await GoogleSignin.signIn();

      if (result.data) {
        const googleUser: GoogleUser = {
          id: result.data.user.id,
          name: result.data.user.name || result.data.user.givenName || '',
          email: result.data.user.email,
          photo: result.data.user.photo || undefined,
        };

        return { user: googleUser };
      }

      return { error: 'Failed to get user information' };
    } catch (error: any) {
      console.error('Google Sign-In error:', error);

      // Handle specific error codes
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { error: 'Sign-in was cancelled by user' };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return { error: 'Sign-in is already in progress' };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Fall back to mock for development
        console.log('Play Services not available, using mock authentication');
        return this.mockSignIn();
      } else if (error.message?.includes('DEVELOPER_ERROR')) {
        // OAuth configuration error - provide helpful message
        return {
          error:
            'Google Sign-In not configured. Please use email/password to sign in, or set up Google Cloud OAuth credentials.',
        };
      } else {
        // For any other error, provide a clear message
        return {
          error: `Sign-in failed: ${error.message || 'Unknown error'}. Please try email/password login.`,
        };
      }
    }
  }

  private async mockSignIn(): Promise<{ user?: GoogleUser; error?: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockGoogleUser: GoogleUser = {
      id: `google_mock_${Date.now()}`,
      name: 'Demo Google User',
      email: 'demo.user@gmail.com',
      photo: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    };

    return { user: mockGoogleUser };
  }

  async signOut(): Promise<void> {
    try {
      if (this.isConfigured) {
        await GoogleSignin.signOut();
      }
      console.log('Google Sign-Out successful');
    } catch (error) {
      console.error('Google Sign-Out error:', error);
    }
  }

  async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      if (!this.isConfigured) {
        return null;
      }

      const userInfo = await GoogleSignin.signInSilently();

      if (userInfo.data) {
        return {
          id: userInfo.data.user.id,
          name: userInfo.data.user.name || userInfo.data.user.givenName || '',
          email: userInfo.data.user.email,
          photo: userInfo.data.user.photo || undefined,
        };
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async isSignedIn(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }
      // Check if user is signed in by trying to get current user
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      console.error('Check sign-in status error:', error);
      return false;
    }
  }

  // Get the GoogleSigninButton component for UI
  static getSignInButton() {
    return GoogleSigninButton;
  }
}

export default GoogleAuthService;
