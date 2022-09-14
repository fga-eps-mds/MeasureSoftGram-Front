import React from 'react';
import { Tab, Tabs, TabsProps } from '@mui/material';
import undelineRemover from '@utils/undelineRemover';

interface PreConfigTabsPropType extends TabsProps {
  tabsValues: Array<string>;
}

const PreConfigTabs = ({ onChange, value, tabsValues, ...rest }: PreConfigTabsPropType) => (
  <Tabs {...rest} value={value} onChange={onChange}>
    {tabsValues.map((tabValue) => (
      <Tab value={tabValue} label={undelineRemover(tabValue)} />
    ))}
  </Tabs>
);

export default PreConfigTabs;
