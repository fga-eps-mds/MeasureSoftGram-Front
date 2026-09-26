import styled from 'styled-components';

import { Select } from '@mui/material';

export const DropDown = styled(Select)`
  margin-left: 10px;
  min-width: 220px;
  background-color: #f0f0f0;

  .MuiSelect-select {
    padding: 10px;
  }

  fieldset {
    border: none;
  }
`;
