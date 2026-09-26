import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  border: 1px solid #5a5a5a;
  border-radius: 5px;
  margin: 0 20%;
  margin-top: 4rem;
  max-width: 900px;
`;

export const Header = styled.div`
  background-color: #2b4d6fff;
  color: white;
  width: 100%;
  border-radius: 5px 5px 0 0;
  height: 31px;
  display: flex;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  font-size: 12px;
  align-items: center;
`;

export const Title = styled.div`
  display: flex;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 14px;
`;

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-top: 1rem;
  margin-left: 20%;
  gap: 2rem;
  margin-right: 20%;
  margin-bottom: 2rem;
`;

export const Description = styled.div`
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
`;

export const Form = styled.div`
  gap: 2rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

export const Botoes = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: wrap;
`;
