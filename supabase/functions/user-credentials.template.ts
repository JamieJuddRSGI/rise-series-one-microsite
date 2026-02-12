/**
 * User Credentials Configuration
 * 
 * Edit this file to add, remove, or modify user credentials.
 * Each entry should have a unique email and a secure password.
 * 
 * Passwords will be automatically hashed when loaded.
 * 
 * To add a user: Add a new object to the array below
 * To remove a user: Delete the object from the array
 * To change a password: Update the password string
 */

export interface UserCredential {
    email: string;
    password: string;
  }
  
  /**
   * Production user credentials
   * 
   * These are used as a fallback if USER_CREDENTIALS environment variable is not set.
   * Environment variable takes precedence if it exists.
   */
  export const userCredentials: UserCredential[] = [
    { email: 'user1@company.com', password: 'Secure,Pass1!:' },
    { email: 'user2@company.com', password: 'Secure,Pass2!:' },
    { email: 'user3@company.com', password: 'Secure,Pass3:!' },
    { email: 'user4@company.com', password: 'Secure,Pass4:!' },
    { email: 'user5@company.com', password: 'Secure,Pass5:!' },
    // Add more users here as needed
  ];