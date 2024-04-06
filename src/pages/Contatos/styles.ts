import styled from "styled-components";
import { btnReset } from "../../styles/variables";

export const BoxContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: 16px;
`;

export const ButtonCreate = styled.button`
  ${btnReset};
  background-color: ${({ theme }) => theme["yellow-100"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;

export const ButtonGravar = styled.button`
  ${btnReset};
  background-color: ${({ theme }) => theme["yellow-100"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;

export const ButtonCancelar = styled.button`
  ${btnReset};
  background-color: ${({ theme }) => theme["gray-300"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;

export const SFormContainer = styled.div`
  width: 750px;
  display: flex;
  flex-direction: column;
  align-items: left;
  padding: 32px 0;
`;

export const SFormEndereco = styled.div`
  width: 750px;
  display: flex;
  flex-direction: row;
  align-items: left;
`;

export const SCli_codigoInput = styled.input`
  width: 130px;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;


export const SNomeInput = styled.input`
  width: 80%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;


  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SCepInput = styled.input`
  width: 120px;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SEnderecoInput = styled.input`
  width: 80%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SNumeroInput = styled.input`
  width: 10%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SComplementoInput = styled.input`
  width: 40%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SBairroInput = styled.input`
  width: 40%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SCidadeInput = styled.input`
  width: 50%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SUfInput = styled.input`
  width: 10%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  padding: 0 16px;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;



export const SNaturezaInput = styled.input`
  width: 20%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  padding: 0 16px;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SCnpjInput = styled.input`
  width: 50%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  padding: 0 16px;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SIns_estInput = styled.input`
  width: 50%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SIns_munInput = styled.input`
  width: 50%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SemailInput = styled.input`
  width: 50%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const STelefoneInput = styled.input`
  width: 30%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SCelularInput = styled.input`
  width: 30%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SSituacaoInput = styled.input`
  width: 30%;
  height: 38px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 8px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

export const SInputPesquisar = styled.input`
  width: 500px;
  height: 38px;
  padding: 0px 10px;
  margin: 5px 0px 5px 0px;
  display: flex;
  flex-direction: row;

  color: ${(props) => props.theme["black"]};
  border-color: ${(props) => props.theme["gray-100"]};
  border-radius: 5px;

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme["yellow-500"]};
  }

  &::placeholder {
    color: ${(props) => props.theme["gray-500"]};
  }
`;

