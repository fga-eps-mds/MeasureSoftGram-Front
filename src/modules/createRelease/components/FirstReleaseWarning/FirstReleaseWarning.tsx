import React from 'react';
import * as Styles from './styles';

export default function FirstReleaseWarning() {
  return (
    <>
      <Styles.Header>
        <h1>Planejar Release</h1>
      </Styles.Header>
      <Styles.Body>
        <p>
          Por ser a primeira release do seu projeto, será disponibilizada a seguir uma pré-configuração base gerada pelo
          sistema.
        </p>{' '}
        <br />
        <p>
          Caso deseje, existe a opção de fazer alterações em cada tela, utilizando o botão correspondente para ativar ou
          desativar a edição daquela configuração específica. Dessa forma, é possível personalizar a pré-configuração de
          acordo com suas necessidades.
        </p>
      </Styles.Body>
    </>
  );
}
