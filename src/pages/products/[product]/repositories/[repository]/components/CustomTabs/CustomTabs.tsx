import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";

interface Props {
  tabId: string,
  orientation: 'vertical' | 'horizontal',
  tabHeaderItems: Array<React.ReactNode>,
  tabPanelItems: Array<React.ReactNode>,
}

function CustomTabs({ tabId, orientation, tabHeaderItems, tabPanelItems }: Props) {

  const [value, setValue] = useState<number>(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  }

  const TabHeaderItems = (): Array<React.ReactNode> => {
    const allyProps = (tab: string, index: number) => ({
      id: `vertical-${tab}-${index}`,
      'aria-controls': `vertical-${tab}panel-${index}`,
    });

    return tabHeaderItems?.map((item, idx) => {
      const style = { minWidth: '50px' } as const;
      const key: string = tabId + idx.toString();

      if (item) {
        if (typeof item === 'string')
          return <Tab sx={style} key={key} label={item} {...allyProps(tabId, idx)}/>

        if (React.isValidElement(item))
          return <Tab sx={style} key={key} icon={item} {...allyProps(tabId, idx)}/>
      }

      return <Box key={key}/>
    })
  }

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, margin: '1rem 0', backgroundColor: 'white' }}>
      <Tabs
        orientation={orientation}
        value={value}
        onChange={handleTabChange}
        sx={{ borderRight: '1px solid #B8B8B8', boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)' }}
      >
        {TabHeaderItems()}
      </Tabs>

      {tabPanelItems.map((item, idx) =>
        <Box
          key={tabId + idx.toString()}
          role="tabpanel"
          height="auto"
          hidden={value !== idx}
          width="100%"
          id={`vertical-tabpanel-${idx}`}
          aria-labelledby={`vertical-tab-${idx}`}
        >
          {value === idx && item}
        </Box>
      )}
    </Box>);
}

export default CustomTabs;
