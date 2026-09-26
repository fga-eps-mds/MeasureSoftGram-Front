import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntegrationsSection } from '../components/IntegrationsSection';

// A secao de integracoes lista as ferramentas que o MeasureSoftGram conecta:
// SonarQube, GitHub, assistentes de IA via MCP, Grafana e VS Code. O texto vem
// do namespace `landing` (mockado globalmente, devolve a propria chave) e cada
// integracao exibe um icone de marca acessivel (role="img" + aria-label).

const ITEM_KEYS = ['sonar', 'github', 'ai', 'grafana', 'vscode'] as const;

const BRAND_LABELS = ['SonarQube', 'GitHub', 'Claude', 'Grafana', 'Visual Studio Code'];

describe('IntegrationsSection', () => {
  it('renderiza o cabecalho da secao', () => {
    render(<IntegrationsSection />);

    expect(screen.getByText('integrations.title')).toBeInTheDocument();
    expect(screen.getByText('integrations.subtitle')).toBeInTheDocument();
  });

  it('renderiza um cartao para cada integracao suportada', () => {
    render(<IntegrationsSection />);

    ITEM_KEYS.forEach((key) => {
      expect(
        screen.getByText(`integrations.items.${key}.title`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`integrations.items.${key}.description`)
      ).toBeInTheDocument();
    });
  });

  it('expoe cada icone de marca com rotulo acessivel', () => {
    render(<IntegrationsSection />);

    BRAND_LABELS.forEach((label) => {
      expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
    });
  });
});
