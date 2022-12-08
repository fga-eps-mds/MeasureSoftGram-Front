import React, { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField
} from '@mui/material';
import { useForm } from 'react-hook-form';
import GitHubIcon from '@mui/icons-material/GitHub';

export const SignInForm = () => {
  const { register } = useForm<LoginFormData>();
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: '2rem' }}>
      <TextField label="Email" id="outlined-start-adornment" {...register('email')} />
      <FormControl variant="outlined">
        <InputLabel htmlFor="outlined-adornment-password">Senha</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password"
          type={showPassword ? 'text' : 'password'}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Password"
          {...register}
        />
      </FormControl>
      <Button type="submit" variant="contained">
        Login
      </Button>
    </Box>
  );
};
