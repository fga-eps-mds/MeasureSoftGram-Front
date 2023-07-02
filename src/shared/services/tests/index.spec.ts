import api from '..';
import * as services from '../Auth/index';

jest.mock('@services/api');

describe('Auth Services', () => {
  it('should signInCredentials with the right URL and data', async () => {
    const data = { email: 'test@test.com', password: 'test' };
    await services.signInCredentials(data);
    expect(api.post).toHaveBeenCalledWith('/accounts/login/', data);
  });

  it('should signInGithub with the right URL and data', async () => {
    const code = 'test_code';
    await services.signInGithub(code);
    expect(api.post).toHaveBeenCalledWith('accounts/github/login/', { code });
  });

  it('should signUp with the right URL and data', async () => {
    const data = {
      email: 'test@test.com',
      password: 'test',
      username: 'testUser',
      first_name: 'Test',
      last_name: 'User',
      confirmPassword: 'test',
    };

    await services.signUp(data);

    expect(api.post).toHaveBeenCalledWith('accounts/signin/', data);
  });



  it('should signOut with the right URL', async () => {
    await services.signOut();
    expect(api.delete).toHaveBeenCalledWith('accounts/logout/');
  });

  it('should getUserInfo with the right URL', async () => {
    await services.getUserInfo();
    expect(api.get).toHaveBeenCalledWith('/accounts/');
  });

  it('should getAccessToken with the right URL', async () => {
    await services.getAccessToken();
    expect(api.get).toHaveBeenCalledWith('/accounts/access-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
