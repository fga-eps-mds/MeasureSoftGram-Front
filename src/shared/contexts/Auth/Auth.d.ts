type authContextType = {
  session: User | null;
  loading: 'loading' | string;
  signInWithGithub: (code: string) => Promise<Result<User>>;
  signInWithCredentials: (data: LoginFormData) => Promise<Result<User>>;
  logout: () => Promise<void>;
  provider: Providers;
  setProvider: React.Dispatch<SetStateAction<Providers>>;
};

interface User {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  repos_url: string;
  organizations_url: string;
}

interface Session {
  user: User;
  token: string;
}
type Providers = 'github' | 'credentials' | 'gitlab';
