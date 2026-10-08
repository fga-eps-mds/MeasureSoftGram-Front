export interface Organization {
  id: string;
  url: string;
  name: string;
  key: string;
  description: string;
  products: string[];
  github_org_name?: string;
  avatar_url?: string;
}
