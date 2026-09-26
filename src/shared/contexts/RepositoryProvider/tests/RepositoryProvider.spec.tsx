import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { RepositoryProvider, useRepositoryContext } from '../RepositoryProvider';

describe('RepositoryContext', () => {

  afterEach(() => {
    localStorage.clear();
  });

  it('should render RepositoryProvider correctly with children', () => {
    const { getByTestId } = render(
      <RepositoryProvider>
        <div data-testid="child">Child</div>
      </RepositoryProvider>
    );
    expect(getByTestId('child').textContent).toBe('Child');
  });

  it('should return correct context values and update them', () => {
    const Child = () => {
      const {
        repositoryList, setRepositoryList,
        currentRepository, setCurrentRepository,
        characteristics, setCharacteristics,
        latestTSQMI, setLatestTSQMI,
        characteristicBadgeUrls, setCharacteristicBadgeUrls,
        repositoriesLatestTsqmi, setRepositoriesLatestTsqmi
      } = useRepositoryContext();

      return (
        <div>
          <span data-testid="repo-len">{repositoryList?.length || 0}</span>
          <span data-testid="curr-repo">{currentRepository?.name || 'none'}</span>
          <span data-testid="char-len">{characteristics.length}</span>
          <button onClick={() => setRepositoryList([{ id: 1, name: 'Repo 1', description: '', created_at: '', updated_at: '' }])}>Set List</button>
          <button onClick={() => setCurrentRepository({ id: 2, name: 'Repo 2', description: '', created_at: '', updated_at: '' })}>Set Curr</button>
          <button onClick={() => setRepositoryList([])}>Clear List</button>
        </div>
      );
    };

    render(
      <RepositoryProvider>
        <Child />
      </RepositoryProvider>
    );

    expect(screen.getByTestId('repo-len').textContent).toBe('0');

    act(() => {
      screen.getByText('Set List').click();
    });
    
    // Automatically selects the first repo because storedRepoId is not set
    expect(screen.getByTestId('curr-repo').textContent).toBe('Repo 1');

    act(() => {
      screen.getByText('Set Curr').click();
    });

    expect(screen.getByTestId('curr-repo').textContent).toBe('Repo 2');

    act(() => {
      screen.getByText('Clear List').click();
    });

    expect(screen.getByTestId('curr-repo').textContent).toBe('none');
  });

  it('should load repository from local storage', () => {
    localStorage.setItem('selectedRepositoryId', '"99"');
    
    const Child = () => {
      const { setRepositoryList, currentRepository } = useRepositoryContext();
      return (
        <div>
          <span data-testid="curr-repo">{currentRepository?.name || 'none'}</span>
          <button onClick={() => {
            localStorage.setItem('selectedRepositoryId', '"99"');
            window.dispatchEvent(new Event('local-storage'));
            setRepositoryList([
              { id: 1, name: 'Repo 1', description: '', created_at: '', updated_at: '' },
              { id: 99, name: 'Repo 99', description: '', created_at: '', updated_at: '' }
            ]);
          }}>Set List</button>
        </div>
      );
    };

    render(
      <RepositoryProvider>
        <Child />
      </RepositoryProvider>
    );

    act(() => {
      screen.getByText('Set List').click();
    });

    expect(screen.getByTestId('curr-repo').textContent).toBe('Repo 99');
  });

  it('should throw error if used outside provider', () => {
    const Child = () => {
      useRepositoryContext();
      return <div />;
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Child />)).toThrow('useRepositoryContext must be used within a RepositoryContext');
    consoleSpy.mockRestore();
  });
});
