import React, { useEffect, useState } from 'react';

import { Typography } from '@mui/material';

import DrawerMenu from '@components/DrawerMenu';
import { productQuery } from '@services/product';

import { Characteristic } from '@customTypes/preConfig';
import { ButtonType } from '@customTypes/product';

import ConfigsForm from './components/ConfigsForm';
import { useQuery } from './hooks/useQuery';
import CONFIG_PAGE from './consts';

const { TITLE, SUB_TITLE } = CONFIG_PAGE;

interface ConfigPageProps {
  isOpen: boolean;
  onClose: Function;
  repoName: string;
}

const ConfigPage = ({ isOpen, onClose, repoName }: ConfigPageProps) => {
  const request = useQuery();

  const [data, setData] = useState(request?.data.characteristics);
  const [characterCheckbox, setCharacterCheckbox] = useState<string[]>([]);
  const [subcharacterCheckbox, setSubcharacterCheckbox] = useState<string[]>([]);
  const [measureCheckbox, setMeasureheckbox] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [isOpen]);

  const isArrayNull = (array: Array<any>) => array.length === 0;

  const isFormCompleted = () => {
    if (isArrayNull(characterCheckbox) && page === 0) return true;
    if (isArrayNull(subcharacterCheckbox) && page === 1) return true;
    if (isArrayNull(measureCheckbox) && page === 2) return true;
  };

  const sendJson = () => {
    const responseCharacterFiltered = data?.filter((charcterValue) => characterCheckbox.includes(charcterValue.key));
    const responseSubcharacterFiltered = responseCharacterFiltered?.map((charcterValue) => ({
      ...charcterValue,
      subcharacteristics: charcterValue.subcharacteristics.filter((subcharcterValue) =>
        subcharacterCheckbox.includes(subcharcterValue.key)
      )
    }));
    const finalData = responseSubcharacterFiltered?.map((charcterValue) => ({
      ...charcterValue,
      subcharacteristics: charcterValue.subcharacteristics.map((subcharcterValue) => ({
        ...subcharcterValue,
        measures: subcharcterValue.measures.filter((measureValue) => measureCheckbox.includes(measureValue.key))
      }))
    })) as Characteristic[];

    productQuery.postPreConfig('1', '1', { name: repoName, data: { characteristics: finalData } });
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
        onClose(false);
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
      onClick: () => onClose(false),
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
    <DrawerMenu open={isOpen} buttons={buttons} title={TITLE} subtitle={SUB_TITLE}>
      <>
        <Typography variant="h6" mt="24px">
          {repoName}
        </Typography>
        {renderPage()}
      </>
    </DrawerMenu>
  );
};

export default ConfigPage;
