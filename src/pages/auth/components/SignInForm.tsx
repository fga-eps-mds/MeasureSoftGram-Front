import React, { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '@contexts/Auth';

interface SignInFormProps {
  changeAuthState: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ changeAuthState }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const { setProvider, signInWithCredentials } = useAuth();
  const onSubmit = async (data: LoginFormData) => {
    setProvider('credentials');
    await signInWithCredentials(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: '2rem' }}>
        <TextField
          label="Email"
          id="outlined-start-adornment"
          error={!!errors?.email}
          helperText={errors?.email?.message}
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value:
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              message: 'Formato de email inválido'
            }
          })}
        />
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
            {...register('password')}
          />
        </FormControl>
        <Button type="submit" variant="contained">
          Login
        </Button>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Ainda não tem cadastro?{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: 'primary.main', cursor: 'pointer' }}
              onClick={changeAuthState}
            >
              Crie uma conta agora
            </Typography>
          </Typography>
        </Box>
      </Box>
    </form>
  );
};
