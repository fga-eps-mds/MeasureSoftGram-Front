/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import { ExpandCircleDown, ExpandCircleDownOutlined } from '@mui/icons-material';
import { Checkbox } from '@mui/material';
import undelineRemover from '@utils/undelineRemover';
import capitalizer from '@utils/capitalizer';
import { FiltersTitle, Option, OptionContainer } from './styles';

interface OptionCheckedProps {
  [key: string]: boolean;
}

export interface FiltersProps {
  filterTitle: string;
  options?: Array<string>;
  updateOptions: Function;
  checkedOptions: OptionCheckedProps;
}

const Filters: React.FC<FiltersProps> = ({ filterTitle, options = [], updateOptions, checkedOptions }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const handleUpdate = (selectedOption: string) => {
    updateOptions({
      ...checkedOptions,
      [selectedOption]: !checkedOptions[selectedOption]
    });
  };

  return (
    <div>
      <FiltersTitle onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? <ExpandCircleDown /> : <ExpandCircleDownOutlined />}
        <span>{filterTitle}</span>
      </FiltersTitle>

      {isVisible ? (
        <OptionContainer display="flex" flexDirection="column">
          {options.map((option) => (
            <Option key={option} display="flex" flexDirection="row" alignItems="center">
              <Checkbox data-testid={option} onClick={() => handleUpdate(option)} checked={checkedOptions[option]} />
              <span>{capitalizer(undelineRemover(option))}</span>
            </Option>
          ))}
        </OptionContainer>
      ) : null}
    </div>
  );
};

export default Filters;
