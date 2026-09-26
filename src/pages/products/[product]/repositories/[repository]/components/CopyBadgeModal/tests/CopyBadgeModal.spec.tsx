import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import CopyBadgeModal from '../CopyBadgeModal';


const mockBadgeUrl = 'http://localhost:8000/organizations/1/products/1/repositories/1/latest-values/tsqmi/badge';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback
  })
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockUseRepositoryContext = jest.fn();
jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => mockUseRepositoryContext()
}));

describe('<CopyBadgeModal />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRepositoryContext.mockReturnValue({
      latestTSQMIBadgeUrl: mockBadgeUrl
    });
  });

  it('should render the copy icon button', () => {
    render(<CopyBadgeModal />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should open modal when copy button is clicked', () => {
    render(<CopyBadgeModal />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Copiar Badge')).toBeInTheDocument();
    expect(screen.getByText('Cole o código abaixo no README do seu repositório:')).toBeInTheDocument();
  });

  it('should display the markdown code in the modal', () => {
    render(<CopyBadgeModal />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText(`![MeasureSoftGram](${mockBadgeUrl})`)).toBeInTheDocument();
  });

  it('should display badge preview image in the modal', () => {
    render(<CopyBadgeModal />);
    fireEvent.click(screen.getByRole('button'));

    const img = screen.getByAltText('Badge Preview');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockBadgeUrl);
  });

  it('should copy markdown to clipboard and show success toast', async () => {
    const writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock }
    });

    render(<CopyBadgeModal />);
    fireEvent.click(screen.getByRole('button'));

    const copyButton = screen.getByText('Copiar');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(`![MeasureSoftGram](${mockBadgeUrl})`);
      expect(toast.success).toHaveBeenCalledWith('Badge copiada com sucesso!');
    });
  });

  it('should show error toast when clipboard write fails', async () => {
    const writeTextMock = jest.fn().mockRejectedValue(new Error('Permission denied'));
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock }
    });

    render(<CopyBadgeModal />);
    fireEvent.click(screen.getByRole('button'));

    const copyButton = screen.getByText('Copiar');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Falha ao copiar para a área de transferência.');
    });
  });

  it('should show error alert when latestTSQMIBadgeUrl is not available', () => {
    mockUseRepositoryContext.mockReturnValue({
      latestTSQMIBadgeUrl: ''
    });

    render(<CopyBadgeModal />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Ocorreu um erro ao tentar carregar as informações.')).toBeInTheDocument();
  });

  it('should close modal when cancel button is clicked', async () => {
    render(<CopyBadgeModal />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Copiar Badge')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Cole o código abaixo no README do seu repositório:')).not.toBeInTheDocument();
    });
  });
});



