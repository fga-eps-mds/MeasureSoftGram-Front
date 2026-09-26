import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import convertToCsv from '@utils/convertToCsv';
import Download from '../DownloadButton';

jest.mock('@utils/convertToCsv', () => jest.fn());

describe('Download Component', () => {
  const mockProduct = {
    historical_values: {
      metrics: 'https://api.example.com/metrics'
    }
  };

  const defaultProps = {
    product: mockProduct,
    kind: 'metrics',
    startDate: '01/01/2023',
    endDate: '10/01/2023',
    checkedOptions: { 'metric-1': true, 'metric-2': false }
  };

  const mockApiResponse = {
    results: [
      {
        key: 'metric-1',
        history: [
          { created_at: '2023-01-05T12:00:00-03:00' },
          { created_at: '2022-12-01T12:00:00-03:00' }  
        ]
      },
      {
        key: 'metric-2',
        history: [{ created_at: '2023-01-05T12:00:00-03:00' }]
      }
    ]
  };

  let originalFetch: any;
  let originalCreateObjectURL: any;
  let originalCreateElement: any; 

  beforeAll(() => {
    originalFetch = global.fetch;
    originalCreateObjectURL = global.URL.createObjectURL;
    originalCreateElement = document.createElement.bind(document);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    
    const mockClick = jest.fn();
    
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: ElementCreationOptions) => {
      if (tagName.toLowerCase() === 'a') {
        const a = originalCreateElement('a');
        a.click = mockClick;
        return a;
      }
      return originalCreateElement(tagName, options);
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
    global.URL.createObjectURL = originalCreateObjectURL;
    jest.restoreAllMocks();
  });

  it('should render the download button and open the dialog on click', () => {
    render(<Download {...defaultProps} />);
    
    const downloadButton = screen.getByRole('button', { name: /Download/i });
    expect(downloadButton).toBeInTheDocument();

    fireEvent.click(downloadButton);
    expect(screen.getByText('Escolha um formato para o download')).toBeInTheDocument();
  });

  it('should close the dialog when clicking Cancel', async () => {
    render(<Download {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));
    expect(screen.getByText('Escolha um formato para o download')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => {

    expect(screen.queryByText('Escolha um formato para o download')).not.toBeInTheDocument();
    
    });
  });

  it('should download JSON file correctly and filter data', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApiResponse)
    });

    render(<Download {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));
    
    const dialogDownloadButton = screen.getByRole('button', { name: 'Download' });
    fireEvent.click(dialogDownloadButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/metrics');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    await waitFor(() => {

    expect(screen.queryByText('Escolha um formato para o download')).not.toBeInTheDocument();

    });
  });

  it('should download CSV file correctly', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApiResponse)
    });
    (convertToCsv as jest.Mock).mockReturnValue('mock,csv,data');

    render(<Download {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));
    
    const csvRadio = screen.getByLabelText('CSV');
    fireEvent.click(csvRadio);

    fireEvent.click(screen.getByRole('button', { name: 'Download' }));

    await waitFor(() => {
      expect(convertToCsv).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('should handle fetch errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    render(<Download {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    await waitFor(() => {

    expect(screen.queryByText('Escolha um formato para o download')).not.toBeInTheDocument();

    });
  });

  it('should handle invalid date fallback logic', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApiResponse)
    });

    render(<Download {...defaultProps} startDate="invalid" endDate="invalid" />);
    
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });
});