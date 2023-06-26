import React from "react";
import { Box } from "@mui/material";

interface Props {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel( { children, value, index }: Props) {

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      sx={{height: 'auto', width: '100%'}}
    >
      {value === index && (children)}
    </Box>
  );
}

export default TabPanel;
