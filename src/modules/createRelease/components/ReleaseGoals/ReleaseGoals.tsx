import React from 'react';

import Equalizer from '@modules/createRelease/components/Equalizer';

import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import * as Styles from './styles';

export default function ReleaseGoals() {
  const { releaseInfoForm } = useCreateReleaseContext();
  const { characteristics, endDate, name, startDate } = releaseInfoForm;

  return (
    <>
      <Styles.Header>
        <h1>Balancear a Meta de Qualidade</h1>
        <p>
          Mini explicação como funciona as metas da release (Configuração das caracteristicas, valor de uma
          caracteristica pode influenciar em outra, etc)
        </p>
      </Styles.Header>

      <Styles.Body>
        <div>
          <strong>{name}</strong>
          <p>
            {startDate} - {endDate}
          </p>
        </div>

        <Equalizer selectedCharacteristics={characteristics} />
      </Styles.Body>
    </>
  );
}
