import DrawerMenu from '@components/DrawerMenu';
import { Characteristic } from '@customTypes/preConfig';
import { ButtonType } from '@customTypes/project';
import { Alert, Snackbar, Typography } from '@mui/material';
import { projectQuery } from '@services/project';
import React, { useEffect, useState } from 'react';
import ConfigsForm from './components/ConfigsForm';
import { useQuery } from './hooks/useQuery';
import CONFIG_PAGE from './consts';

const { TITLE, SUB_TITLE, DEFAULT_MESSAGE, ERROR_MESSAGE } = CONFIG_PAGE;

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
  const [isValuesValid, setIsValuesValid] = useState(false);
  const [error, setError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    setPage(0);
    setData(clearRequest(data));

    setCharacterCheckbox([]);
    setSubcharacterCheckbox([]);
    setMeasureheckbox([]);
  }, [isOpen]);

  useEffect(() => {
    setIsValuesValid(false);
  }, [page]);

  useEffect(() => {}, []);

  const clearRequest = (jsonValue: Characteristic[]): Characteristic[] => {
    const jsonString = JSON.stringify(jsonValue);
    const jsonStringReplaced = jsonString?.replace(/\d+/g, '0');
    return JSON?.parse(jsonStringReplaced) as Characteristic[];
  };

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

    setShowAlert(true);
    projectQuery.postPreConfig('1', '1', { name: repoName, data: { characteristics: finalData } }).catch(() => {
      setError(true);
    });
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
      disabled: isFormCompleted() || !isValuesValid,
      backgroundColor: 'white',
      color: 'black',
      variant: 'outlined'
    };
  };

  const buttons: Array<ButtonType> = [
    {
      label: 'Cancelar',
      onClick: () => {
        setData(clearRequest(data));
        onClose(false);
      },
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
    const genericProps = { onChange: setData, setIsValuesValid, data };
    const subtitle = 'Definir os pesos das';
    if (page === 0) {
      return (
        <ConfigsForm
          {...genericProps}
          subtitle={`${subtitle} caracteristicas`}
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
          subtitle={`${subtitle} subcaracteristicas`}
          checkboxValues={subcharacterCheckbox}
          setCheckboxValues={setSubcharacterCheckbox}
        />
      );
    }
    return (
      <ConfigsForm
        {...genericProps}
        tabs={subcharacterCheckbox}
        subtitle={`${subtitle} medidas`}
        type="measure"
        checkboxValues={measureCheckbox}
        setCheckboxValues={setMeasureheckbox}
      />
    );
  };

  return (
    <>
      <DrawerMenu open={isOpen} buttons={buttons} title={TITLE} subtitle={SUB_TITLE}>
        <>
          <Typography variant="h6" mt="24px">
            {repoName}
          </Typography>
          {renderPage()}
        </>
      </DrawerMenu>
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => {
          setShowAlert(false);
          setError(false);
        }}
      >
        <Alert severity={error ? 'error' : 'success'} sx={{ width: '100%' }}>
          {error ? ERROR_MESSAGE : DEFAULT_MESSAGE}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConfigPage;
