import React, { useState } from 'react';

import { List, ListItemButton, ListItemIcon, Box, Typography } from '@mui/material';
import EastOutlinedIcon from "@mui/icons-material/EastOutlined"

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
            display: "flex",
            width: "100%",
            backgroundColor: "transparent",
            '.button-text': { color: selected === data ? "#2B4D6F" : "#000" },
          }}
        >
          <Box display="flex" justifyContent="flex-start" alignContent="center" alignItems="center">
            <Box display="flex" minWidth="55px">
              {selected === data &&
                <ListItemIcon>
                  <EastOutlinedIcon />
                </ListItemIcon>
              }
            </Box>
            <Typography className="button-text" variant="body1" fontWeight="bold" sx={{ alignSelf: "end" }} >
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
