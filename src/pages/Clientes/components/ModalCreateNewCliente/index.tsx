import { useState } from "react";
import { Modal } from "../../../../components/Modal";
import { ClienteContext } from "../../../../contexts/ClienteContext";
import { toast } from "react-toastify";
import { isEmailValid } from "../../../../helpers/utils";
import {
  SFormContainer,
  SCli_codigoInput,
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
} from "./styles";

interface ModalCreateNewClienteProps {
  open: boolean;
  onClose: () => void;
}

export function ModalCreateNewCliente({ open, onClose }: ModalCreateNewClienteProps) {
  const clienteContext = ClienteContext();

  const [formData, setFormData] = useState({
    cli_codigo: "",
    nome: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
    natureza: "",
    cnpj: "",
    ins_est: "", 
    ins_mun: "",	 
    email: "", 
    telefone: "",
    celular: "",
    situacao: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleClose = () => {
    onClose();
    setFormData({
      cli_codigo: "",
      nome: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
      natureza: "",
      cnpj: "",
      ins_est: "", 
      ins_mun: "",	 
      email: "", 
      telefone: "",
      celular: "",
      situacao: "",
    });
  };

  const handleCreate = async () => {
    if (!isEmailValid(formData.email)) {
      toast.error(
        "Formato de e-mail inválido, verifique se seu e-mail está correto."
      );
      return;
    }
    if (
      !formData.cli_codigo ||
      !formData.nome ||
      !formData.endereco ||
      !formData.numero ||
      !formData.bairro ||
      !formData.cidade ||
      !formData.uf ||
      !formData.cep ||
      !formData.natureza ||
      !formData.cnpj ||
      !formData.email ||
      !formData.telefone ||
      !formData.celular 
    ) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    if (formData.situacao !== "A" && formData.situacao !== "I" ) {
      toast.error(
        "Situação deve ser <A>tiva ou <I>nativa."
      );
      return;
    }

    try {
      const newCliente = await clienteContext.createCliente({
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
        situacao:    formData.situacao
      });

      toast.success(`Cliente ${formData.cli_codigo}, foi criado com sucesso!`);
      handleClose();

      return newCliente;
    } catch (error) {
      toast.error(`Erro ao tentar criar o Cliente, ${error}`);
    }
  };

  return (
    <Modal
      titleText={"Criar novo Cliente"}
      open={open}
      confirmButton="Criar"
      cancelButton="Fechar"
      onClose={handleClose}
      onHandleCreate={handleCreate}
      variantCancel={"primary"}
      variantConfirm={"success"}
    >
      <SFormContainer>
        <div>
          <label>Código:</label>
          <SCli_codigoInput
            type="text"
            name="cli_codigo"
            value={formData.cli_codigo}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Nome:</label>
          <SNomeInput
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>
        <div>
            <label>Endereço:</label>
            <SEnderecoInput
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              required
            />
        </div>
        <div>
            <label>Nro:</label>
            <SNumeroInput
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              required
            />
          <label>Complemento:</label>
          <SComplementoInput
            type="text"
            name="complemento"
            value={formData.complemento}
            onChange={handleChange}
          />
          <label>Bairro:</label>
          <SBairroInput
            type="text"
            name="bairro"
            value={formData.bairro}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Cidade:</label>
          <SCidadeInput
            type="text"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            required
          />
          <label>UF:</label>
          <SUfInput
            type="text"
            name="uf"
            value={formData.uf}
            onChange={handleChange}
            required
          />
          <label>CEP:</label>
          <SCepInput
            type="text"
            name="cep"
            value={formData.cep}
            onChange={handleChange}
            required
          />
        </div>   
        <div>
          <label>Natureza:</label>
          <SNaturezaInput
            type="text"
            name="natureza"
            value={formData.natureza}
            onChange={handleChange}
            required
          />
        </div>     
        <div>
          <label>CNPJ:</label>
          <SCnpjInput
            type="text"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            required
          />
        </div>  
        <div>
          <label>Ins.Estadual:</label>
          <SIns_estInput
            type="text"
            name="ins_est"
            value={formData.ins_est}
            onChange={handleChange}
          />
        </div> 
        <div>
          <label>Ins.Municipal:</label>
          <SIns_munInput
            type="text"
            name="ins_mun"
            value={formData.ins_mun}
            onChange={handleChange}
          />
        </div> 
        <div>
          <label>e-Mail:</label>
          <SemailInput
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div> 
        <div>
          <label>Telefone:</label>
          <STelefoneInput
            type="text"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
          />
          <label>Celular:</label>
          <SCelularInput
            type="text"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Situação:</label>
          <SSituacaoInput
            type="text"
            name="situacao"
            value={formData.situacao}
            onChange={handleChange}
            required
          />
        </div> 
      </SFormContainer>
    </Modal>
  );
}