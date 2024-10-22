import { useState } from "react";
import { ClienteContext } from "../../../../contexts/ClienteContext";
import { toast } from "react-toastify";
import { FormularioCliente } from "../../../../components/FormularioCliente";
import { useNavigate } from "react-router-dom";
import ValidatorDocto from "../../../../helpers/validatorDocto";

export function CadastrarCliente() {
    const clienteContext = ClienteContext();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nickname: "",
        name: "",
        address: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
        zip_code: "",
        kind: "",
        cnpj_cpf: "",
        ins_est: "",
        ins_mun: "",
        telephone: "",
        cellphone: "",
        situation: "",
        account: [],
        cnpj_pagto: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleClean = () => {
        setFormData({
            nickname: "",
            name: "",
            address: "",
            number: "",
            complement: "",
            district: "",
            city: "",
            state: "",
            zip_code: "",
            kind: "",
            cnpj_cpf: "",
            ins_est: "",
            ins_mun: "",
            telephone: "",
            cellphone: "",
            situation: "",
            account: [],
            cnpj_pagto: "",
        });
    };

    const handleCreate = async () => {
        if (formData.kind == "F" && !ValidatorDocto.isCPF(formData.cnpj_cpf)) {
            toast.error("Digito verificador do CPF está incorreto.");
            return;
        }
        if (formData.kind == "J" && !ValidatorDocto.isCNPJ(formData.cnpj_cpf)) {
            toast.error("Digito verificador do CNPJ está incorreto.");
            return;
        }
        if (!formData.name || !formData.zip_code || !formData.cnpj_cpf) {
            toast.error("Por favor, preencha todos os campos.");
            return;
        }

        try {
            const newCliente = await clienteContext.createCliente({
                nickname: formData.nickname.toUpperCase(),
                name: formData.name.toUpperCase(),
                address: formData.address.toUpperCase(),
                number: formData.number,
                complement: formData.complement.toUpperCase(),
                district: formData.district.toUpperCase(),
                city: formData.city.toUpperCase(),
                state: formData.state.toUpperCase(),
                zip_code: formData.zip_code,
                kind: formData.kind,
                cnpj_cpf: formData.cnpj_cpf,
                ins_est: formData.ins_est,
                ins_mun: formData.ins_mun,
                telephone: formData.telephone,
                cellphone: formData.cellphone,
                situation: formData.situation,
                account: formData.account,
                cnpj_pagto: formData.cnpj_pagto,
            });

            toast.success(`Cliente ${formData.name}, foi criado com sucesso!`);
            navigate("/clientes");
            handleClean();

            return newCliente;
        } catch (error) {
            toast.error(`Erro ao tentar criar o Cliente, ${error}`);
        }
    };

    const checkCEP = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, "");
        fetch(`${process.env.REACT_APP_URL_VIA_CEP}/${cep}/json/`)
            .then((res) => res.json())
            .then((data) => {
                const dadosEndereco = {
                    address: data.logradouro,
                    district: data.bairro,
                    city: data.localidade,
                    state: data.uf,
                };

                setFormData({ ...formData, ...dadosEndereco });
            });
    };

    return (
        <>
            <FormularioCliente
                titleText={"Cadastrar Cliente"}
                data={formData}
                onHandleCreate={handleCreate}
                onChange={handleChange}
                onCheckCEP={checkCEP}
            />
        </>
    );
}
