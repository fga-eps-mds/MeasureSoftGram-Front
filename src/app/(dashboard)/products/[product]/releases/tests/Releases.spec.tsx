import { act, fireEvent, render } from "@testing-library/react";
import { useRequest } from "@hooks/useRequest";
import Releases from "../Releases";
import filterReleaseList from "../util/filterReleaseList";

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: jest.fn(() => ({
    currentProduct: {
      id: '1',
      name: 'MeasureSoftGram'
    }
  }))
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: jest.fn(() => ({
    currentOrganization: {
      id: '1'
    }
  }))
}));

jest.mock('@hooks/useRequest', () => ({
  useRequest: jest.fn(() => ({
    data: [],
    isLoading: false
  }))
}));

jest.mock('../util/filterReleaseList', () => jest.fn(() => []));

interface MockPaginationProps {
  // eslint-disable-next-line no-unused-vars
  onChange: (_event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const MockPagination = ({ onChange }: MockPaginationProps) => (
  <select data-testid="select-page" onChange={onChange}>
    <option value="1">1</option>
    <option value="2">2</option>
  </select>
)

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Pagination: (props: any) => <MockPagination {...props} />
}));

describe('<Releases />', () => {
  it('Deve corresponder ao snapshot', async () => {
    const { asFragment } = render(<Releases />);

    expect(asFragment()).toMatchSnapshot();
  })

  it('Deve filtrar as releases pelo nome, data de início e data de fim', async () => {
    const { getByTestId, getByRole } = render(<Releases />);

    const startDate = getByTestId('inicio-release');
    const endDate = getByTestId('fim-release');
    const searchButton = getByRole('textbox');

    await act(async () => {
      fireEvent.change(startDate, { target: { value: '2021-01-01' } });
      fireEvent.change(endDate, { target: { value: '2021-01-02' } });
      fireEvent.input(searchButton, { target: { value: 'MeasureSoftGram' } });
    });

    expect(filterReleaseList).toHaveBeenCalledWith([], 'MeasureSoftGram', '2021-01-01', '2021-01-02');
  });

  it('Deve mostrar ao menos uma opção de página', async () => {
    const { getByTestId } = render(<Releases />);

    const pageSelect = getByTestId('select-page');

    fireEvent.change(pageSelect, { target: { value: '1' } });
    expect(pageSelect).toBeDefined();
  })

  it('Deve chamar o filterReleaseList com array vazia quando o releaseList for undefined', async () => {
    (useRequest as jest.Mock).mockImplementationOnce(() => ({
      data: undefined,
      isLoading: false
    }));

    render(<Releases />);

    expect(filterReleaseList).toHaveBeenCalledWith([], '', '', '');
  })

  it('Deve mostrar o Skeleton enquanto o isLoading for true', async () => {
    (useRequest as jest.Mock).mockImplementationOnce(() => ({
      data: undefined,
      isLoading: true
    }));

    const { queryByText } = render(<Releases />);
    expect(queryByText('Nome')).toBeNull();
  })
});
