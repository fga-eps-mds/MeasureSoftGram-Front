import React, { useRef, useState } from 'react';
import { List, ListItem, IconButton, Box } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Organization } from '@customTypes/organization';

interface ScrollableListProps {
  organizationList: Organization[];
  onSelect: (organization: Organization) => void;
}

const ScrollableList: React.FC<ScrollableListProps> = ({ organizationList, onSelect }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleScrollUp = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ top: -50, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ top: 50, behavior: 'smooth' });
    }
  };

  const handleItemClick = (index: number) => {
    setSelectedIndex(index);
    onSelect(organizationList[index]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <IconButton onClick={handleScrollUp}>
          <ArrowUpwardIcon style={{ fontSize: '1.8em' }} />
        </IconButton>
      </Box>
      <Box
        ref={listRef}
        sx={{
          overflowY: 'auto',
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <List>
          {organizationList.map((organization, index) => (
            <ListItem
              key={organization.id}
              onClick={() => handleItemClick(index)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: selectedIndex === index ? '#2B4D6F' : 'inherit',
                '&:hover': { backgroundColor: '#F4F5F6' },
              }}
            >
              {organization.name}
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <IconButton onClick={handleScrollDown}>
          <ArrowDownwardIcon style={{ fontSize: '1.8em' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ScrollableList;
