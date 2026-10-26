import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  BAND_LABEL_STEPS,
  BAND_LETTER_ONLY_MAX_WIDTH,
  bandLabelRules,
  QualityBandRuler,
  VISUALLY_HIDDEN
} from '../DistributionHistogram';

function cssRules() {
  return Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules).map((rule) => rule.cssText));
}

describe('<QualityBandRuler />', () => {
  it('tem as cinco faixas, de E a A, com a letra e o rótulo no texto e no title', () => {
    render(<QualityBandRuler />);

    const bands = within(screen.getByRole('list', { name: 'Faixas de qualidade de A a E' })).getAllByRole('listitem');
    expect(bands.map((band) => band.textContent)).toEqual([
      'E · Muito ruim',
      'D · Ruim',
      'C · Bom',
      'B · Muito bom',
      'A · Ótimo'
    ]);
    expect(bands.map((band) => band.getAttribute('title'))).toEqual(bands.map((band) => band.textContent));
  });

  it('cada faixa é o próprio container: a decisão de mostrar o rótulo é pela largura da faixa, não da régua', () => {
    render(<QualityBandRuler />);

    const [band] = screen.getAllByTestId('quality-band');
    const bandClass = Array.from(band.classList).find((name) => name.startsWith('css-'));
    const list = screen.getByRole('list', { name: 'Faixas de qualidade de A a E' });
    const listClass = Array.from(list.classList).find((name) => name.startsWith('css-'));
    // o jsdom não calcula a largura nem guarda as regras @container: o teste confere quem é o container, e as
    // regras por largura ficam em bandLabelRules
    expect(cssRules()).toContainEqual(expect.stringMatching(`^\\.${bandClass} \\{.*container-type: inline-size;`));
    expect(cssRules().find((rule) => rule.startsWith(`.${listClass} `))).not.toContain('container-type');
  });
});

describe('bandLabelRules', () => {
  it('diminui a fonte em degraus conforme a faixa estreita e, quando nem assim cabe, deixa só a letra, no tamanho normal', () => {
    expect(bandLabelRules()).toEqual({
      '@container (max-width: 72px)': { fontSize: '10px' },
      '@container (max-width: 65px)': { fontSize: '9px' },
      '@container (max-width: 58px)': { fontSize: '11px', '& .quality-band-label': VISUALLY_HIDDEN }
    });
  });

  it('no desktop a letra e o rótulo aparecem, e em 360 px só a letra', () => {
    // largura de cada faixa medida na página: 1440 px → 76, 1314 px → 64, 1024 px → 102, 360 px → 25
    const desktop = [76, 64, 102];
    const narrow = 25;
    const [normal, small] = BAND_LABEL_STEPS;

    desktop.forEach((width) => expect(width).toBeGreaterThan(BAND_LETTER_ONLY_MAX_WIDTH));
    expect(narrow).toBeLessThanOrEqual(BAND_LETTER_ONLY_MAX_WIDTH);
    // "B · Muito bom" mede 69 px em 11 px, 63 px em 10 px e 56 px em 9 px: cada degrau ainda cabe no seu limite
    expect(normal.maxWidth).toBeGreaterThan(69);
    expect(small.maxWidth).toBeGreaterThan(63);
    expect(BAND_LETTER_ONLY_MAX_WIDTH).toBeGreaterThanOrEqual(56);
  });
});
