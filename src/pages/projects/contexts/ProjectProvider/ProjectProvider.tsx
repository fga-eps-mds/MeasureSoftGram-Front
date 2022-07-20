import React, { Dispatch, PropsWithChildren, useState } from 'react';

import Project from '@types/project';

interface ProjectContextType {
  project?: Project;
  setProject: Dispatch<React.SetStateAction<Project | undefined>>;
}

const ProjectContext = React.createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [project, setProject] = useState<Project>();

  const value = { project, setProject };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export function useProject() {
  const context = React.useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
