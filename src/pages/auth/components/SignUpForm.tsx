import React, { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { signUp } from '@services/Auth';
import { toast } from 'react-toastify';

interface SignupFormProps {
  changeAuthState: () => void;
}

export const SignUpForm: React.FC<SignupFormProps> = ({ changeAuthState }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<any>();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const onSubmit = async (data: any) => {
    const response = await signUp(data);

    if (response.type === 'success') {
      toast.success('Usuário cadastrado com sucesso!');
      changeAuthState();
    } else {
      const AxiosError = response.error;
      const status = AxiosError.response?.status;
      const errorData = AxiosError.response?.data as any;

      if (status === 400 && (errorData?.email || errorData?.username || JSON.stringify(errorData).includes('already exists'))) {
        toast.error("Esse usuário já existe, tente usar um email diferente.");
      } else {
        toast.error(`Erro ao cadastrar usuário: ${AxiosError.message}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: '2rem' }}>
        <TextField
          label="Email"
          id="email" // <-- ID Único
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value:
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              message: 'Formato de email inválido'
            }
          })}
          error={!!errors?.email}
          helperText={errors?.email?.message as string}
        />
        <TextField
          label="Username"
          id="username" // <-- ID Único
          {...register('username', {
            required: 'Username é obrigatório',
            pattern: {
              value: /^\S+$/g,
              message: 'Username não pode ter espaços'
            },
            minLength: {
              value: 3,
              message: 'Username deve ter no mínimo 3 caracteres'
            }
          })}
          error={!!errors?.username}
          helperText={errors?.username?.message as string}
        />
        <TextField
          label="Nome"
          id="first_name" // <-- ID Único
          {...register('first_name', {
            required: 'Nome é obrigatório'
          })}
          error={!!errors?.first_name}
          helperText={errors?.first_name?.message as string}
        />
        <TextField
          label="Sobrenome"
          id="last_name" // <-- ID Único
          {...register('last_name', {
            required: 'Sobrenome é obrigatório'
          })}
          error={!!errors?.last_name}
          helperText={errors?.last_name?.message as string}
        />
        <FormControl variant="outlined" error={!!errors?.password}>
          <InputLabel htmlFor="password">Senha</InputLabel>
          <OutlinedInput
            id="password" // <-- ID Único e atrelado ao htmlFor acima
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
            label="Senha"
            {...register('password', {
              required: 'Senha é obrigatória',
              minLength: {
                value: 6,
                message: 'Senha precisa ter ao menos 6 dígitos'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                message: 'A senha deve conter ao menos 1 letra maiúscula, 1 número, e ter no mínimo 6 caracteres'
              }
            })}
          />
          {errors.password && (
            <Typography variant="body2" color="error">
              {errors.password.message as string}
            </Typography>
          )}
        </FormControl>
        <FormControl variant="outlined" error={!!errors?.confirmPassword}>
          <InputLabel htmlFor="confirm-password">Confirmar senha</InputLabel>
          <OutlinedInput
            id="confirm-password" // <-- ID Único e atrelado ao htmlFor acima
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Confirmar senha"
            {...register('confirmPassword', {
              required: 'Confirmação de senha é obrigatória',
              validate: (value) => value === watch('password') || 'As senhas devem corresponder'
            })}
          />
          {errors.confirmPassword && (
            <Typography variant="body2" color="error">
              {errors.confirmPassword.message as string}
            </Typography>
          )}
        </FormControl>

        <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
          Cadastrar
        </LoadingButton>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Já possui conta?{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: 'primary.main', cursor: 'pointer' }}
              onClick={changeAuthState}
            >
              Faça login agora
            </Typography>
          </Typography>
        </Box>
      </Box>
    </form>
  );
};
