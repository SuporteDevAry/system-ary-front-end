import styled from "styled-components";

export const SFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 32px 0;
  gap: 8px;
`;

const BaseInput = styled.input`
  width: 260px;
  height: 38px;
  display: flex;
  flex-direction: column;

  padding: 0 16px;

  color: ${(props) => props.theme["gray-500"]};
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

export const SNomeInput = styled(BaseInput)``;
export const SEnderecoInput = styled(BaseInput)``;
export const SNumeroInput = styled(BaseInput)``;
export const SComplementoInput = styled(BaseInput)``;
export const SBairroInput = styled(BaseInput)``;
export const SCidadeInput = styled(BaseInput)``;
export const SUfInput = styled(BaseInput)``;
export const SCepInput = styled(BaseInput)``;
export const SNaturezaInput = styled(BaseInput)``;
export const SCnpjInput = styled(BaseInput)``;
export const SIns_estInput = styled(BaseInput)``;
export const SIns_munInput = styled(BaseInput)``;
export const SemailInput = styled(BaseInput)``;
export const STelefoneInput = styled(BaseInput)``;
export const SCelularInput = styled(BaseInput)``;
export const SSituacaoInput = styled(BaseInput)``;
