import { Characteristic } from '@customTypes/product';

export type ComparisonStatus = 'equal' | 'above' | 'below' | 'no-data';

export interface CharacteristicComparison {
  key: string;
  /** Valor planejado (Rp) da característica, de 0 a 1. */
  rp: number;
  /** Valor realizado (Rd); `null` quando não há dado realizado. */
  rd: number | null;
  /** Rc = max(0, Rp − Rd), igual à função `diff` do MeasureSoftGram-Core. */
  rc: number | null;
  /** Rp − Rd, com sinal: negativo indica realizado acima do planejado. */
  delta: number | null;
  status: ComparisonStatus;
}

/**
 * Diferenças menores que meio centésimo são tratadas como "igual ao planejado",
 * pois os valores são exibidos com duas casas decimais.
 */
export const EQUALITY_TOLERANCE = 0.005;

const isValidValue = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export function compareCharacteristic(key: string, rp: number, rd: number | null): CharacteristicComparison {
  if (!isValidValue(rd)) {
    return { key, rp, rd: null, rc: null, delta: null, status: 'no-data' };
  }

  const delta = rp - rd;
  const rc = Math.max(0, delta);

  let status: ComparisonStatus = 'below';
  if (Math.abs(delta) < EQUALITY_TOLERANCE) {
    status = 'equal';
  } else if (delta < 0) {
    status = 'above';
  }

  return { key, rp, rd, rc, delta, status };
}

/**
 * Monta a comparação Planejado × Realizado na ordem das características planejadas.
 * O realizado é associado pelo nome da característica (e não pela posição no vetor),
 * e uma característica sem valor realizado fica como `no-data` em vez de zero.
 */
export function comparePlannedAccomplished(
  planned: Characteristic[],
  accomplished?: Characteristic[],
): CharacteristicComparison[] {
  const accomplishedByName = new Map<string, number>();

  (accomplished ?? []).forEach((characteristic) => {
    if (isValidValue(characteristic?.value)) {
      accomplishedByName.set(characteristic.name, characteristic.value);
    }
  });

  return planned.map((characteristic) =>
    compareCharacteristic(
      characteristic.name,
      characteristic.value,
      accomplishedByName.has(characteristic.name) ? (accomplishedByName.get(characteristic.name) as number) : null,
    ),
  );
}

/** Formata com duas casas, evitando exibir "-0.00". */
export function formatComparisonValue(value: number | null, emptyLabel = '—'): string {
  if (!isValidValue(value)) return emptyLabel;
  const fixed = value.toFixed(2);
  return fixed === '-0.00' ? '0.00' : fixed;
}
