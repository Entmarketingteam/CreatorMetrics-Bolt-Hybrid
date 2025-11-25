export interface User {
  id: string;
  email: string;
  name: string;
}

export async function getCurrentUser(): Promise<User | null> {
  return {
    id: 'user_demo',
    email: 'founder@example.com',
    name: 'CreatorMetrics Demo User',
  };
}
