import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getUserRepos } from '@services/user';
import { GithubRepositoriesModal } from '../GithubRepositoriesModal';

const mockHandleRepositoryAction = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({ query: { code: 'oauth-code', product: '1-5-MeasureSoftGram' } })
}));

jest.mock('@services/user', () => ({
  getUserRepos: jest.fn()
}));

jest.mock('@hooks/useQuery', () => ({
  useQuery: () => ({ handleRepositoryAction: mockHandleRepositoryAction })
}));

jest.mock('@contexts/Auth', () => ({
  useAuth: () => ({ provider: 'github' })
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn() }
}));

const REPOSITORY = {
  id: 7,
  name: 'MeasureSoftGram-Front',
  description: 'Interface web',
  html_url: 'https://github.com/fga-eps-mds/MeasureSoftGram-Front'
};

describe('<GithubRepositoriesModal />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserRepos as jest.Mock).mockResolvedValue({ type: 'success', value: { items: [REPOSITORY] } });
  });

  it('Deve listar os repositórios do usuário e importar o escolhido', async () => {
    mockHandleRepositoryAction.mockResolvedValue({ type: 'success' });
    const handleCloseModal = jest.fn();

    render(<GithubRepositoriesModal open handleCloseModal={handleCloseModal} />);

    fireEvent.click(await screen.findByText(REPOSITORY.name));

    expect(getUserRepos).toHaveBeenCalledWith('oauth-code');
    await waitFor(() => expect(handleCloseModal).toHaveBeenCalledTimes(1));
    expect(mockHandleRepositoryAction).toHaveBeenCalledWith('create', '1', '5', undefined, {
      name: REPOSITORY.name,
      description: REPOSITORY.description,
      url: REPOSITORY.html_url,
      platform: 'github',
      imported: true
    });
  });
});
