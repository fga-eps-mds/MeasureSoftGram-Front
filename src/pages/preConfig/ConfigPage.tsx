import DrawerMenu from '@components/DrawerMenu';
import { ButtonType } from '@customTypes/project';
import React, { useState } from 'react';
import ConfigsForm from './ConfigsForm';
import mockedData from './mockData.json';

const ConfigPage = () => {
  const [data, setData] = useState(mockedData.data.characteristics);
  const [characterCheckbox, setCharacterCheckbox] = useState<string[]>([]);
  const [subcharacterCheckbox, setSubcharacterCheckbox] = useState<string[]>([]);
  const [measureCheckbox, setMeasureheckbox] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [page, setPage] = useState(0);

  const isArrayNull = (array: Array<any>) => array.length === 0;

  const isFormCompleted = () => {
    if (isArrayNull(characterCheckbox) && page === 0) return true;
    if (isArrayNull(subcharacterCheckbox) && page === 1) return true;
    if (isArrayNull(measureCheckbox) && page === 2) return true;
  };

  const sendJson = () => {
    const responseCharacterFiltered = data.filter((charcterValue) => characterCheckbox.includes(charcterValue.key));
    const responseSubcharacterFiltered = responseCharacterFiltered.map((charcterValue) => ({
      ...charcterValue,
      subcharacteristics: charcterValue.subcharacteristics.filter((subcharcterValue) =>
        subcharacterCheckbox.includes(subcharcterValue.key)
      )
    }));
    const responseMeasureFiltered = responseSubcharacterFiltered.map((charcterValue) => ({
      ...charcterValue,
      subcharacteristics: charcterValue.subcharacteristics.map((subcharcterValue) => ({
        ...subcharcterValue,
        measures: subcharcterValue.measures.filter((measureValue) => measureCheckbox.includes(measureValue.key))
      }))
    }));
    console.log(responseMeasureFiltered);
  };

  const renderNextOrEndButton = (): ButtonType => {
    let label = 'Avançar';
    let onClick = () => {
      const nextPage = page <= 2 ? page + 1 : 0;
      setPage(nextPage);
    };
    if (page === 2) {
      label = 'Finalizar';
      onClick = () => {
        setIsOpen(false);
        sendJson();
      };
    }
    return {
      label,
      onClick,
      disabled: isFormCompleted(),
      backgroundColor: 'white',
      color: 'black',
      variant: 'outlined'
    };
  };

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
        const previousPage = page >= 0 ? page - 1 : 2;
        setPage(previousPage);
      },
      backgroundColor: 'gray',
      disabled: page === 0,
      color: 'white'
    },
    renderNextOrEndButton()
  ];

  const renderPage = () => {
    const genericProps = { onChange: setData, data };

    if (page === 0) {
      return (
        <ConfigsForm
          {...genericProps}
          type="characteristic"
          checkboxValues={characterCheckbox}
          setCheckboxValues={setCharacterCheckbox}
        />
      );
    }
    if (page === 1) {
      return (
        <ConfigsForm
          {...genericProps}
          tabs={characterCheckbox}
          type="subcharacteristic"
          checkboxValues={subcharacterCheckbox}
          setCheckboxValues={setSubcharacterCheckbox}
        />
      );
    }
    return (
      <ConfigsForm
        {...genericProps}
        tabs={subcharacterCheckbox}
        type="measure"
        checkboxValues={measureCheckbox}
        setCheckboxValues={setMeasureheckbox}
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
