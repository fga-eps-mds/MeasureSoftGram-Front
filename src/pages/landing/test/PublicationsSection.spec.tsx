import React from 'react';
import { render, screen } from '@testing-library/react';
import { PublicationsSection } from '../components/PublicationsSection';
import { PUBLICATIONS } from '../constants';

// A secao de publicacoes da o acesso aos artigos cientificos que fundamentam o
// MeasureSoftGram. Titulo/autores/veiculo sao dados de citacao (neutros de
// idioma, vindos de constants); o chrome da secao e o rotulo do CTA vem da
// i18n (mock global devolve a propria chave).

describe('PublicationsSection', () => {
  it('renderiza o cabecalho da secao', () => {
    render(<PublicationsSection />);

    expect(screen.getByText('publications.title')).toBeInTheDocument();
    expect(screen.getByText('publications.subtitle')).toBeInTheDocument();
  });

  it('lista o titulo e os autores de cada publicacao', () => {
    render(<PublicationsSection />);

    // Titulos sao unicos por publicacao.
    PUBLICATIONS.forEach((pub) => {
      expect(screen.getByText(pub.title)).toBeInTheDocument();
    });

    // As duas publicacoes tem os mesmos autores; o nome aparece uma vez por
    // cartao, entao esperamos uma ocorrencia para cada item da lista.
    PUBLICATIONS.forEach((pub) => {
      expect(screen.getAllByText(pub.authors).length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText(PUBLICATIONS[0].authors)).toHaveLength(
      PUBLICATIONS.length
    );
  });

  it('cada CTA aponta para o DOI no ACM, em nova aba e com rel seguro', () => {
    render(<PublicationsSection />);

    const links = screen.getAllByRole('link', { name: 'publications.cta' });
    expect(links).toHaveLength(PUBLICATIONS.length);

    PUBLICATIONS.forEach((pub, index) => {
      expect(links[index]).toHaveAttribute('href', pub.url);
      expect(links[index]).toHaveAttribute('target', '_blank');
      expect(links[index].getAttribute('rel')).toContain('noopener');
    });
  });
});
