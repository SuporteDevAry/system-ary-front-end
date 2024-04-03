import styled from "styled-components";
import { btnReset } from "../../styles/variables";

export const SFormContainer = styled.div`
  width: 750px;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: space-between;
  flex-wrap: nowrap;
  padding: 10px 0;
  //gap: 1px;
`;

const BaseInput = styled.input`
  width: 260px;
  height: 30px;
  display: flex;
  flex-direction: column;

  padding: 0 10px;

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

export const SCli_codigoInput = styled(BaseInput)`
  width: 100px;
`;

export const SNomeInput = styled(BaseInput)`
  width: 80%;
`;

export const SCepInput = styled(BaseInput)`
  width: 20%;
`;

export const SEnderecoInput = styled(BaseInput)`
  width: 80%;
`;

export const SNumeroInput = styled(BaseInput)`
  width: 20%;
`;

export const SComplementoInput = styled(BaseInput)`
  width: 70%;
`;

export const SBairroInput = styled(BaseInput)`
  width: 50%;
`;

export const SCidadeInput = styled(BaseInput)`
  width: 50%;
`;

export const SUfInput = styled(BaseInput)`
  width: 20%;
`;

export const SNaturezaInput = styled(BaseInput)`
  width: 20%;
`;

export const SCnpjInput = styled(BaseInput)`
  width: 50%;
`;

export const SIns_estInput = styled(BaseInput)`
  width: 50%;
`;

export const SIns_munInput = styled(BaseInput)`
  width: 50%;
`;

export const SemailInput = styled(BaseInput)`
  width: 50%;
`;

export const STelefoneInput = styled(BaseInput)`
  width: 30%;
`;

export const SCelularInput = styled(BaseInput)`
  width: 30%;
`;

export const SSituacaoInput = styled(BaseInput)`
  width: 30%;
`;

export const BoxContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 5px;
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
  background-color: ${({ theme }) => theme["yellow-100"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;

export const ButtonCancelar = styled.button`
  background-color: ${({ theme }) => theme["gray-300"]};
  border-radius: 5px;
  padding: 8px;

  &:focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["black-200"]};
  }
`;

