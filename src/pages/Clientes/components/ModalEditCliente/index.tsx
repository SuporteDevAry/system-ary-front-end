import { useState, useEffect } from "react";
import { Modal } from "../../../../components/Modal";
import { ClienteContext } from "../../../../contexts/ClienteContext";
import { toast } from "react-toastify";
import { isEmailValid } from "../../../../helpers/utils";
import { IListCliente } from "../../../../contexts/ClienteContext/types";
import {
  SNomeInput,
  SEnderecoInput,
  SNumeroInput,
  SComplementoInput, 
  SBairroInput,
  SCidadeInput,
  SUfInput,
  SCepInput,
  SNaturezaInput,
  SCnpjInput,
  SIns_estInput,
  SIns_munInput,
  SemailInput,
  STelefoneInput,
  SCelularInput,
  SSituacaoInput,
  SFormContainer,
} from "./styles";

interface ModalEditClienteProps {
  open: boolean;
  onClose: () => void;
  cliente: IListCliente;
}

export function ModalEditCliente({ open, onClose, cliente }: ModalEditClienteProps) {
  const clienteContext = ClienteContext();

  const [formData, setFormData] = useState({
    cli_codigo:  cliente.cli_codigo,
    nome:        cliente.nome,
    endereco:    cliente.endereco,
    numero:      cliente.numero,
    complemento: cliente.complemento,
    bairro:      cliente.bairro,
    cidade:      cliente.cidade,
    uf:          cliente.uf,
    cep:         cliente.cep,
    natureza:    cliente.natureza,
    cnpj:        cliente.cnpj,
    ins_est:     cliente.ins_est, 
    ins_mun:	   cliente.ins_mun,	 
    email:       cliente.email, 
    telefone:    cliente.telefone,
    celular:     cliente.celular,
    situacao:    cliente.situacao
  });

  useEffect(() => {
    setFormData({
      cli_codigo: cliente.cli_codigo ?? "",
      nome: cliente.nome ?? "",
      endereco: cliente.endereco ?? "",
      numero: cliente.numero ?? "",      
      complemento: cliente.complemento ?? "",
      bairro: cliente.bairro ?? "",
      cidade: cliente.cidade ?? "",
      uf: cliente.uf ?? "",
      cep: cliente.cep ?? "",
      natureza: cliente.natureza ?? "",
      cnpj: cliente.cnpj ?? "",
      ins_est: cliente.ins_est ?? "",
      ins_mun: cliente.ins_mun ?? "",
      email: cliente.email ?? "",
      telefone: cliente.telefone ?? "",
      celular: cliente.celular ?? "",
      situacao: cliente.situacao ?? "",
    });
  }, [cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleClose = () => {
    onClose();
  };

  const handleUpdate = async () => {
    if (!isEmailValid(formData.email)) {
      toast.error("Formato de e-mail inválido.");
      return;
    }

    try {
      await clienteContext.updateCliente(cliente.cli_codigo, {
        cli_codigo:  formData.cli_codigo,
        nome:        formData.nome,
        endereco:    formData.endereco,
        numero:      formData.numero,
        complemento: formData.complemento,
        bairro:      formData.bairro,
        cidade:      formData.cidade,
        uf:          formData.uf,
        cep:         formData.cep,
        natureza:    formData.natureza,
        cnpj:        formData.cnpj,
        ins_est:     formData.ins_est, 
        ins_mun:	   formData.ins_mun,	 
        email:       formData.email, 
        telefone:    formData.telefone,
        celular:     formData.celular,
        situacao:    formData.situacao,
      });
      toast.success("Cliente atualizado com sucesso!");
      handleClose();
    } catch (error) {
      toast.error("Erro ao atualizar Cliente.");
    }
  };

  return (
    <Modal
      titleText={"Editar Cliente"}
      open={open}
      confirmButton="Atualizar"
      cancelButton="Cancelar"
      onClose={handleClose}
      onHandleCreate={handleUpdate}
      variantCancel={"primary"}
      variantConfirm={"success"}
    >
      <SFormContainer>
      <div>
          <label>Nome:</label>
          <SNomeInput
            type="text"
            name="name"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Endereço:</label>
          <SEnderecoInput
            type="text"
            name="name"
            value={formData.endereco}
            onChange={handleChange}
            required
          />
          <label>Nro:</label>
          <SNumeroInput
            type="text"
            name="name"
            value={formData.numero}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Complemento:</label>
          <SComplementoInput
            type="text"
            name="name"
            value={formData.complemento}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Bairro:</label>
          <SBairroInput
            type="text"
            name="name"
            value={formData.bairro}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Cidade:</label>
          <SCidadeInput
            type="text"
            name="name"
            value={formData.cidade}
            onChange={handleChange}
            required
          />
          <label>UF:</label>
          <SUfInput
            type="text"
            name="name"
            value={formData.uf}
            onChange={handleChange}
            required
          />
          <label>CEP:</label>
          <SCepInput
            type="text"
            name="name"
            value={formData.cep}
            onChange={handleChange}
            required
          />
        </div>   
        <div>
          <label>Natureza:</label>
          <SNaturezaInput
            type="text"
            name="name"
            value={formData.natureza}
            onChange={handleChange}
            required
          />
        </div>     
        <div>
          <label>CNPJ:</label>
          <SCnpjInput
            type="text"
            name="name"
            value={formData.cnpj}
            onChange={handleChange}
            required
          />
        </div>  
        <div>
          <label>Ins.Estadual:</label>
          <SIns_estInput
            type="text"
            name="name"
            value={formData.ins_est}
            onChange={handleChange}
            required
          />
        </div> 
        <div>
          <label>Ins.Municipal:</label>
          <SIns_munInput
            type="text"
            name="name"
            value={formData.ins_mun}
            onChange={handleChange}
            required
          />
        </div> 
        <div>
          <label>e-Mail:</label>
          <SemailInput
            type="text"
            name="name"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div> 
        <div>
          <label>Telefone:</label>
          <STelefoneInput
            type="text"
            name="name"
            value={formData.telefone}
            onChange={handleChange}
            required
          />
          <label>Celular:</label>
          <SCelularInput
            type="text"
            name="name"
            value={formData.celular}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Situação:</label>
          <SSituacaoInput
            type="text"
            name="name"
            value={formData.situacao}
            onChange={handleChange}
            required
          />
        </div> 
      </SFormContainer>
    </Modal>
  );
}
