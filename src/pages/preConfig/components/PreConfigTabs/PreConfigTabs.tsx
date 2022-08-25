import React from 'react';
import { Tab, Tabs, TabsProps } from '@mui/material';
import titleFormater from '@utils/titleFormater';

interface PreConfigTabsPropType extends TabsProps {
  tabsValues: Array<string>;
}

const PreConfigTabs = ({ onChange, value, tabsValues, ...rest }: PreConfigTabsPropType) => (
  <Tabs {...rest} value={value} onChange={onChange}>
    {tabsValues.map((tabValue) => (
      <Tab value={tabValue} label={titleFormater(tabValue)} />
    ))}
  </Tabs>
);

export default PreConfigTabs;
