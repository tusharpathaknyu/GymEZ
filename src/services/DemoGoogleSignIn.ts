// Development Google Sign-In Demo Service
import { Alert } from 'react-native';

export class DemoGoogleSignIn {
  static configure(config: any) {
    console.log('Demo Google Sign-In configured with:', config.webClientId);
  }

  static async hasPlayServices() {
    console.log('Demo: Play Services check - OK');
    return true;
  }

  static async signIn() {
    return new Promise((resolve, reject) => {
      Alert.alert(
        'Demo Google Sign-In',
        'This is a demo. Would you like to simulate a successful Google sign-in?',
        [
          {
            text: 'Cancel',
            onPress: () =>
              reject({
                code: 'SIGN_IN_CANCELLED',
                message: 'User cancelled sign-in',
              }),
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: () =>
              resolve({
                type: 'success',
                data: {
                  user: {
                    id: 'demo_user_123',
                    name: 'Demo User',
                    email: 'demo@gymez.app',
                    photo: null,
                    familyName: 'User',
                    givenName: 'Demo',
                  },
                  idToken: 'demo_id_token_12345',
                  serverAuthCode: null,
                },
              }),
          },
        ],
      );
    });
  }

  static async signOut() {
    console.log('Demo: User signed out');
    return true;
  }
}

export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

export function isErrorWithCode(error: any) {
  return error && error.code;
}
