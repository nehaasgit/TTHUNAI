import { UserProfile } from '../../shared/types.js';

export const profileService = {
  /**
   * Fetch authenticated user profile
   */
  async getProfile(token: string): Promise<UserProfile | null> {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  /**
   * Create or update authenticated user profile
   */
  async saveProfile(token: string, profileData: Partial<UserProfile>): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to save profile' };
      }
      return { success: true, profile: data.profile };
    } catch (error) {
      console.error('Error saving profile:', error);
      return { success: false, error: 'Network error or connection lost' };
    }
  },

  /**
   * Update existing profile fields incrementally
   */
  async updateProfile(token: string, profileData: Partial<UserProfile>): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }
      return { success: true, profile: data.profile };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Network error or connection lost' };
    }
  }
};
