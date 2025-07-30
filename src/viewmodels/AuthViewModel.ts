import { useState, useEffect } from 'react';
import { AuthService } from '../services/AuthService';
import { User } from '../models/User';

export class AuthViewModel {
  private authService = new AuthService();
  
  constructor(
    private setUser: (user: User | null) => void,
    private setLoading: (loading: boolean) => void
  ) {
    this.initialize();
  }

  private async initialize() {
    this.setLoading(true);
    
    try {
      const user = await this.authService.getCurrentUser();
      this.setUser(user);
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      this.setLoading(false);
    }

    // Listen for auth changes
    this.authService.onAuthStateChange((user) => {
      this.setUser(user);
    });
  }

  async signUp(email: string, password: string, name: string): Promise<User> {
    return this.authService.signUp(email, password, name);
  }

  async signIn(email: string, password: string): Promise<User> {
    return this.authService.signIn(email, password);
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
    this.setUser(null);
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const user = await this.authService.updateProfile(updates);
    this.setUser(user);
    return user;
  }

  async resetPassword(email: string): Promise<void> {
    return this.authService.resetPassword(email);
  }
}

export const useAuthViewModel = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authViewModel] = useState(() => new AuthViewModel(setUser, setLoading));

  return {
    user,
    loading,
    signUp: authViewModel.signUp.bind(authViewModel),
    signIn: authViewModel.signIn.bind(authViewModel),
    signOut: authViewModel.signOut.bind(authViewModel),
    updateProfile: authViewModel.updateProfile.bind(authViewModel),
    resetPassword: authViewModel.resetPassword.bind(authViewModel)
  };
};