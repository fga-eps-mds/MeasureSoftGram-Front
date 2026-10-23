import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MSGAlert, { MSG_ALERT_STYLES } from '../MSGAlert';

describe('<MSGAlert />', () => {
  it('mostra o erro do guia de IDV com a ação de tentar de novo', () => {
    const onAction = jest.fn();
    render(
      <MSGAlert severity="error" title="Não foi possível carregar" actionLabel="Tentar novamente" onAction={onAction}>
        Tente de novo em alguns instantes.
      </MSGAlert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('data-severity', 'error');
    expect(alert).toHaveTextContent('Não foi possível carregar');
    expect(alert).toHaveTextContent('Tente de novo em alguns instantes.');

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onAction).toHaveBeenCalled();
  });

  it('mostra o aviso com uma ação que já é um elemento', () => {
    render(
      <MSGAlert severity="warning" title="Ainda não há análises" action={<a href="#guia">Ver como configurar</a>}>
        Rode a coleta.
      </MSGAlert>
    );

    expect(screen.getByRole('status')).toHaveAttribute('data-severity', 'warning');
    expect(screen.getByRole('link', { name: 'Ver como configurar' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('usa as cores das mensagens claras do guia de IDV', () => {
    expect(MSG_ALERT_STYLES.error).toMatchObject({ border: '#D13310', text: '#D13310' });
    expect(MSG_ALERT_STYLES.warning).toMatchObject({ border: '#DF8E16', text: '#C07910' });
  });
});
