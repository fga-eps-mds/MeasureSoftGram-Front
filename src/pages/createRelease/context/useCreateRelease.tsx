import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { projectQuery } from '@services/project';
import { Changes } from '@customTypes/project';

interface CreateReleaseProviderProps {
  children: ReactNode;
  projectId: string;
  organizationId: string;
}

interface ReleaseInfoForm {
  name: string;
  startDate: string;
  endDate: string;
  characteristics: string[];
  changes: Changes[]
}

interface CreateReleaseContextData {
  releaseInfoForm: ReleaseInfoForm;
  preConfigCharacteristics: string[] | undefined;
  // eslint-disable-next-line no-unused-vars
  handleChangeForm: (field: string, value: string | Changes[]) => void;
  // eslint-disable-next-line no-unused-vars
  handleSelectCharacteristics: (characteristic: string) => void;
  createProjectReleaseGoal: () => void
}

const CreateReleaseContext = createContext({} as CreateReleaseContextData);

export function CreateReleaseProvider({ children, projectId, organizationId }: CreateReleaseProviderProps) {
  const [preConfigCharacteristics, setPreConfigCharacteristics] = useState<string[]>();
  const [releaseInfoForm, setReleaseInfoForm] = useState<ReleaseInfoForm>({} as ReleaseInfoForm);

  async function loadCurrentPreConfig() {
    try {
      const result = await projectQuery.getProjectCurrentPreConfig(organizationId, projectId);
      setPreConfigCharacteristics(result.data.data.characteristics.map(item => item.key));
    } catch (error) {
      console.error(error);
    }
  }

  async function createProjectReleaseGoal() {
    try {
      console.log(releaseInfoForm)
      const data = {
        release_name: releaseInfoForm.name,
        start_at: releaseInfoForm.startDate,
        end_at: releaseInfoForm.endDate,
        changes: releaseInfoForm.changes
      }

      await projectQuery.createProjectReleaseGoal(organizationId, projectId, data);
    } catch (error) {
      console.error(error);
    }
  }

  function handleChangeForm(field: string, value: string | string[] | Changes[]) {
    setReleaseInfoForm(form => ({
      ...form,
      [field]: value
    }))
  }

  function handleSelectCharacteristics(characteristic: string) {
    const selectedCharacteristics = [...releaseInfoForm.characteristics || []]

    if(!selectedCharacteristics.includes(characteristic)){
      selectedCharacteristics.push(characteristic);
    }else{
      selectedCharacteristics.splice(selectedCharacteristics.indexOf(characteristic), 1);
    }

    handleChangeForm('characteristics', selectedCharacteristics)
  }

  useEffect(() => {
    loadCurrentPreConfig();
  }, [projectId]);

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value = {
    releaseInfoForm,
    preConfigCharacteristics,
    handleChangeForm,
    handleSelectCharacteristics,
    createProjectReleaseGoal
  };

  return (
    <CreateReleaseContext.Provider value={value}>
      {children}
    </CreateReleaseContext.Provider>
  )
}

export function useCreateReleaseContext(): CreateReleaseContextData {
  return useContext(CreateReleaseContext);
}
