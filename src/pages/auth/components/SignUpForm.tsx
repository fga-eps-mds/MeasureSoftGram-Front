import React, { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { signUp } from '@services/Auth';
import { toast } from 'react-toastify';

export const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SignUpFormData>();
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const onSubmit = async (data: SignUpFormData) => {
    const response = await signUp(data);
    if (response.type === 'success') {
      toast.success('Usuário cadastrado com sucesso!');
    } else {
      toast.error(`Erro ao cadastrar usuário: ${response.error.message}`);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: '2rem' }}>
        <TextField
          label="Email"
          id="outlined-start-adornment"
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value:
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              message: 'Formato de email inválido'
            }
          })}
          error={!!errors?.email}
          helperText={errors?.email?.message}
        />
        <TextField
          label="Username"
          id="outlined-start-adornment"
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
          helperText={errors?.username?.message}
        />
        <TextField
          label="Nome"
          id="outlined-start-adornment"
          {...register('first_name', {
            required: 'Nome é obrigatório'
          })}
          error={!!errors?.first_name}
          helperText={errors?.first_name?.message as string}
        />
        <TextField
          label="Sobrenome"
          id="outlined-start-adornment"
          {...register('last_name', {
            required: 'Sobrenome é obrigatório'
          })}
          error={!!errors?.last_name}
          helperText={errors?.last_name?.message as string}
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
            {...register('password', {
              minLength: {
                value: 6,
                message: 'Senha precisa ter ao menos 6 dígitos'
              }
            })}
          />
        </FormControl>
        <FormControl variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Confirmar senha</InputLabel>
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
            label="Confirmar senha"
            {...register('confirmPassword', {
              validate: (value) => value === watch('password') || 'auth:signup.messages.passwordMatch'
            })}
          />
        </FormControl>

        <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
          Cadastrar
        </LoadingButton>
      </Box>
    </form>
  );
};
