/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import { ExpandCircleDown, ExpandCircleDownOutlined } from '@mui/icons-material';
import { Checkbox } from '@mui/material';
import { FiltersTitle, Option, OptionContainer } from './styles';

interface OptionProps {
  name: string;
  key: string;
}

interface FiltersProps {
  filterTitle: string;
  options?: Array<OptionProps>;
}

const Filters: React.FC<FiltersProps> = ({ filterTitle, options = [] }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  return (
    <div>
      <FiltersTitle onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? <ExpandCircleDown /> : <ExpandCircleDownOutlined />}
        <span>{filterTitle}</span>
      </FiltersTitle>

      {isVisible ? (
        <OptionContainer display="flex" flexDirection="column">
          {options.map((option) => (
            <Option key={option.key} display="flex" flexDirection="row" alignItems="center">
              <Checkbox onChange={() => console.log(`oi ${option.name}`)} />
              <span>{option.name}</span>
            </Option>
          ))}
        </OptionContainer>
      ) : null}
    </div>
  );
};

export default Filters;
