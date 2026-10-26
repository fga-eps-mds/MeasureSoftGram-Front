import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import PlannedVsAccomplishedEqualizer, { buildCurvePath } from '../PlannedVsAccomplishedEqualizer';

/** jsdom não calcula layout; simulamos trilhos de 240px lado a lado para as curvas e marcadores. */
const mockTrackLayout = () =>
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mockRect(this: HTMLElement) {
    const isSlider = this.classList.contains('MuiSlider-root');
    const index = isSlider ? Number(this.getAttribute('data-index') ?? 0) : 0;
    return {
      x: 0,
      y: 0,
      left: isSlider ? 100 + index * 150 : 0,
      top: isSlider ? 20 : 0,
      width: isSlider ? 30 : 600,
      height: isSlider ? 240 : 400,
      right: 0,
      bottom: 0,
      toJSON: () => ({}),
    } as DOMRect;
  });

const planned = [
  { name: 'reliability', value: 0.7, diff: 0 },
  { name: 'maintainability', value: 0.5, diff: 0 },
  { name: 'security', value: 0.4, diff: 0 },
];

const accomplished = [
  { name: 'reliability', value: 0.7, diff: 0 },
  { name: 'maintainability', value: 0.3, diff: 0.2 },
  { name: 'security', value: 0.6, diff: 0 },
];

describe('PlannedVsAccomplishedEqualizer', () => {
  it('renderiza um trilho por característica planejada, com o cursor no Rp', () => {
    render(<PlannedVsAccomplishedEqualizer planned={planned} accomplished={accomplished} normDiff={0.21} />);

    planned.forEach((characteristic) => {
      const slider = within(screen.getByTestId(`equalizer-slider-${characteristic.name}`)).getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', String(characteristic.value));
      expect(slider).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  it('projeta as curvas do planejado e do realizado e exibe a legenda', () => {
    render(<PlannedVsAccomplishedEqualizer planned={planned} accomplished={accomplished} />);

    expect(screen.getByTestId('equalizer-curve-planned')).toBeInTheDocument();
    expect(screen.getByTestId('equalizer-curve-accomplished')).toBeInTheDocument();

    const legend = screen.getByTestId('equalizer-legend');
    expect(legend).toHaveTextContent('equalizer.legend.planned');
    expect(legend).toHaveTextContent('equalizer.legend.accomplished');
    expect(legend).toHaveTextContent('equalizer.legend.cursor');
  });

  it('não exibe a escala vertical de 0 a 1', () => {
    const { container } = render(<PlannedVsAccomplishedEqualizer planned={planned} accomplished={accomplished} />);

    expect(container.querySelector('.MuiChartsAxis-root')).toBeNull();
    expect(container.querySelector('.MuiSlider-mark')).toBeNull();
  });

  it('exibe os vetores Rp, Rd, Rc e Rp − Rd na ordem das características', () => {
    render(<PlannedVsAccomplishedEqualizer planned={planned} accomplished={accomplished} normDiff={0.21} />);

    expect(screen.getByTestId('vector-rp')).toHaveTextContent('Rp0.700.500.40');
    expect(screen.getByTestId('vector-rd')).toHaveTextContent('Rd0.700.300.60');
    expect(screen.getByTestId('vector-rc')).toHaveTextContent('Rc = max(0, Rp − Rd)0.000.200.00');
    expect(screen.getByTestId('vector-delta')).toHaveTextContent('Rp − Rd0.000.20-0.20');
    expect(screen.getByTestId('equalizer-norm-diff')).toHaveTextContent('0.21');
  });

  it('indica a situação com símbolo e texto, e não apenas por cor', () => {
    render(<PlannedVsAccomplishedEqualizer planned={planned} accomplished={accomplished} />);

    const status = screen.getByTestId('vector-status');
    expect(status).toHaveTextContent('= equalizer.status.equal');
    expect(status).toHaveTextContent('▼ equalizer.status.below');
    expect(status).toHaveTextContent('▲ equalizer.status.above');
  });

  it('mostra planejado, realizado, diferença e situação ao passar o mouse', async () => {
    render(<PlannedVsAccomplishedEqualizer planned={planned} accomplished={accomplished} />);

    fireEvent.mouseOver(screen.getByTestId('equalizer-track-maintainability'));

    const tooltip = await screen.findByTestId('equalizer-tooltip-maintainability');
    expect(tooltip).toHaveTextContent('(Rp): 0.50');
    expect(tooltip).toHaveTextContent('(Rd): 0.30');
    expect(tooltip).toHaveTextContent('(Rp − Rd): 0.20');
    expect(tooltip).toHaveTextContent('equalizer.status.below');
  });

  it('sinaliza característica sem valor realizado como sem dado, sem exibir zero', () => {
    const spy = mockTrackLayout();
    render(
      <PlannedVsAccomplishedEqualizer
        planned={planned}
        accomplished={[accomplished[0], accomplished[2]]}
      />,
    );

    expect(screen.getByTestId('vector-rd')).toHaveTextContent('Rd0.70equalizer.noData0.60');
    expect(screen.getByTestId('vector-status')).toHaveTextContent('equalizer.status.no-data');
    // a curva do realizado é interrompida na característica sem dado (dois trechos)
    const accomplishedPath = screen.getByTestId('equalizer-curve-accomplished').getAttribute('d') ?? '';
    expect(accomplishedPath.match(/M/g)).toHaveLength(2);
    spy.mockRestore();
  });

  it('exibe apenas o planejado e avisa quando a release ainda não tem análise', () => {
    render(<PlannedVsAccomplishedEqualizer planned={planned} />);

    expect(screen.getByTestId('equalizer-no-accomplished')).toBeInTheDocument();
    expect(screen.getByTestId('equalizer-curve-planned')).toBeInTheDocument();
    expect(screen.queryByTestId('equalizer-curve-accomplished')).not.toBeInTheDocument();
    expect(screen.queryByTestId('vector-status')).not.toBeInTheDocument();
  });

  it('não exibe o equalizador quando a release não tem planejamento', () => {
    render(<PlannedVsAccomplishedEqualizer planned={[]} accomplished={accomplished} />);

    expect(screen.getByTestId('equalizer-no-planning')).toHaveTextContent('equalizer.noPlanning');
    expect(screen.queryByTestId('planned-vs-accomplished-equalizer')).not.toBeInTheDocument();
  });
});

describe('helpers do equalizador', () => {
  const tracks = [
    { x: 50, top: 0, height: 200 },
    { x: 150, top: 0, height: 200 },
    { x: 250, top: 0, height: 200 },
  ];

  it('liga os pontos de trilhos na mesma linha com uma curva suave', () => {
    expect(buildCurvePath([1, 0.5, 0], tracks)).toBe(
      'M50.0 0.0 C100.0 0.0 100.0 100.0 150.0 100.0 C200.0 100.0 200.0 200.0 250.0 200.0',
    );
  });

  it('mantém a curva dentro da altura dos trilhos', () => {
    const path = buildCurvePath([0.5, 1, 1], tracks);

    expect(path).not.toMatch(/-/);
  });

  it('interrompe a curva onde não há valor e na quebra de linha do grid', () => {
    // valores isolados viram um traço horizontal curto
    expect(buildCurvePath([1, null, 0], tracks)).toBe('M38.0 0.0 L62.0 0.0 M238.0 200.0 L262.0 200.0');
    expect(buildCurvePath([1, 1], [tracks[0], { x: 50, top: 300, height: 200 }])).toBe(
      'M38.0 0.0 L62.0 0.0 M38.0 300.0 L62.0 300.0',
    );
  });

  it('não desenha enquanto os trilhos não foram medidos', () => {
    expect(buildCurvePath([0.5, 0.5], [])).toBe('');
  });
});
