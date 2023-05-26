import React, { useState } from 'react';

import { List, ListItemButton, ListItemIcon, Box, Typography } from '@mui/material';
import { ArrowForwardOutlined } from "@mui/icons-material/"

interface Props {
  navListData: Array<string>,
}

const ListNavCard: React.FC<Props> = ({ navListData }) => {
  const [selected, setSelected] = useState<string>(navListData[0]);

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    elementId: string,
  ) => {
    setSelected(elementId);
    document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth" })
  };

  return (
    <List component="nav">
      {navListData.map(data => (
        <ListItemButton
          key={data}
          selected={selected === data}
          onClick={(event) => handleListItemClick(event, data)}
          sx={{
            ':active, :hover, :focus, :visited': { backgroundColor: "transparent", '.button-text': { color: "#113D4C" } },
          }}
        >
          <Box display="flex" justifyContent="flex-start" width="100%" alignContent="center" alignItems="center">
            <Box display="flex" minWidth="55px">
              {selected === data &&
                <ListItemIcon>
                  <ArrowForwardOutlined />
                </ListItemIcon>
              }
            </Box>
            <Typography className="button-text" variant="body1" sx={{ alignSelf: "end" }} >
              {data}
            </Typography>
          </Box>
        </ListItemButton>
      ))
      }
    </List >
  );
};

export default ListNavCard;
