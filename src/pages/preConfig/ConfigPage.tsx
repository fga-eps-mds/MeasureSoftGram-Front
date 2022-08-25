import DrawerMenu from '@components/DrawerMenu';
import { ButtonType } from '@customTypes/project';
import React, { useState } from 'react';
import ConfigsForm from './ConfigsForm';
import mockedData from './mockData.json';
import { getCharacteristicsLabels, getSubCharacteristicsLabels } from './utils/getLabels';

const ConfigPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [data, setData] = useState(mockedData.data.characteristics);
  const [page, setPage] = useState(0);

  const buttons: Array<ButtonType> = [
    {
      label: 'Cancelar',
      onClick: () => setIsOpen(false),
      backgroundColor: 'black',
      color: 'white'
    },
    {
      label: 'Retornar',
      onClick: () => {
        const previousPage = page > 0 ? page - 1 : 3;
        setPage(previousPage);
      },
      backgroundColor: 'gray',
      color: 'white'
    },
    {
      label: 'Avançar',
      onClick: () => {
        const nextPage = page < 3 ? page + 1 : 0;
        setPage(nextPage);
      },
      backgroundColor: 'white',
      color: 'black',
      variant: 'outlined'
    }
  ];

  const renderPage = () => {
    if (page === 0) {
      return <ConfigsForm onChange={setData} data={data} type="characteristic" />;
    }
    if (page === 1) {
      return (
        <ConfigsForm
          onChange={setData}
          data={data}
          labels={getCharacteristicsLabels(mockedData.data)}
          type="subcharacteristic"
        />
      );
    }
    return (
      <ConfigsForm
        onChange={setData}
        data={data}
        labels={getSubCharacteristicsLabels(mockedData.data)}
        type="measure"
      />
    );
  };

  return (
    <DrawerMenu
      open={isOpen}
      buttons={buttons}
      title="Preencher pré configurações"
      subtitle="Mini explicação do que é caracteristica e como esse formulário pode demorar um tempo para ser preenchido"
    >
      {renderPage()}
    </DrawerMenu>
  );
};

export default ConfigPage;
