import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import LatestValueTable from '../LatestValueTable';

let container: any = null;

beforeEach(() => {
  // configurando um elemento do DOM como o alvo do render
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // limpa o elemento do DOM
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('LatestValueTable', () => {
  it('renders with latestValue', () => {
    const title = 'Título da tabela';
    const latestValue = {
      results: [
        {
          name: 'item 1',
          latest: {
            value: 123,
            created_at: '2022-12-01T09:12:00.000Z'
          }
        },
        {
          name: 'item 2',
          latest: {
            value: 456,
            created_at: '2022-12-02T09:12:00.000Z'
          }
        }
      ]
    };

    act(() => {
      render(<LatestValueTable title={title} latestValue={latestValue} />, container);
    });

    const received = container.textContent;
    const expected = 'Título da tabelaÚltimo valorÚltima atualizaçãoitem 112301/12/2022 09:12item 245602/12/2022 09:12';

    expect(received).toContain(expected);
  });
});
