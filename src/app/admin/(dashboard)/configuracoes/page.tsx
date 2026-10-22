import Image from "next/image";
import { getEmpresa } from "@/lib/comum/empresa";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { UploadLogo } from "@/components/admin/UploadLogo";
import { updateEmpresa, removerLogo } from "./actions";

export default async function ConfiguracoesPage() {
  const empresa = await getEmpresa();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Configurações da imobiliária</h1>
        <p className="mt-1 text-sm text-slate-500">
          Esses dados aparecem no portal público e são usados para preencher a
          qualificação da LOCADORA nos contratos gerados.
        </p>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-medium text-slate-900">Logo</h2>
        <div className="flex items-center gap-4">
          {empresa.logoUrl ? (
            <Image
              src={empresa.logoUrl}
              alt="Logo da imobiliária"
              width={96}
              height={96}
              className="rounded-md border border-slate-200 object-contain p-2"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-slate-300 text-xs text-slate-400">
              Sem logo
            </div>
          )}
          <UploadLogo />
          {empresa.logoUrl && (
            <form action={removerLogo}>
              <ConfirmButton size="sm" variant="danger" confirmMessage="Remover a logo atual?">
                Remover
              </ConfirmButton>
            </form>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-medium text-slate-900">Dados cadastrais</h2>
        <form action={updateEmpresa} className="space-y-4">
          <Input
            label="Nome fantasia"
            name="nome"
            defaultValue={empresa.nome}
            placeholder="Nome usado no portal público"
            required
          />
          <Input
            label="Razão social"
            name="razaoSocial"
            defaultValue={empresa.razaoSocial ?? ""}
            placeholder="Nome jurídico usado na qualificação da LOCADORA no contrato"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="CNPJ" name="cnpj" defaultValue={empresa.cnpj ?? ""} />
            <Input label="Telefone / WhatsApp" name="telefone" defaultValue={empresa.telefone ?? ""} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Segundo telefone / WhatsApp"
              name="telefone2"
              defaultValue={empresa.telefone2 ?? ""}
            />
            <Input
              label="Instagram"
              name="instagram"
              defaultValue={empresa.instagram ?? ""}
              placeholder="@aguaclara.imoveis_"
            />
          </div>
          <Input label="Endereço completo" name="endereco" defaultValue={empresa.endereco ?? ""} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Corretor(a) responsável"
              name="responsavelNome"
              defaultValue={empresa.responsavelNome ?? ""}
              placeholder="Nome de quem assina pela imobiliária"
            />
            <Input
              label="CRECI do responsável"
              name="responsavelCreci"
              defaultValue={empresa.responsavelCreci ?? ""}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Segundo(a) corretor(a)"
              name="responsavel2Nome"
              defaultValue={empresa.responsavel2Nome ?? ""}
              placeholder="Exibido no portal (opcional)"
            />
            <Input
              label="CRECI do segundo(a)"
              name="responsavel2Creci"
              defaultValue={empresa.responsavel2Creci ?? ""}
            />
          </div>
          <Input
            label="Chave PIX para recebimento dos aluguéis"
            name="chavePix"
            defaultValue={empresa.chavePix ?? ""}
            placeholder="CNPJ, telefone, email ou chave aleatória"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="E-mail para assuntos de privacidade (LGPD)"
              name="emailPrivacidade"
              type="email"
              defaultValue={empresa.emailPrivacidade ?? ""}
              hint="Aparece na Política de Privacidade: é por onde clientes pedem acesso, correção ou exclusão dos seus dados."
            />
            <Input
              label="Responsável pelos dados pessoais"
              name="encarregadoNome"
              defaultValue={empresa.encarregadoNome ?? ""}
              placeholder="Quem atende esses pedidos (encarregado)"
            />
          </div>
          <Input
            label="Taxa de administração (%)"
            name="taxaAdministracaoPercentual"
            type="number"
            step="0.1"
            min={0}
            max={100}
            defaultValue={empresa.taxaAdministracaoPercentual}
            hint="Quanto você retém do aluguel. Aparece só no Financeiro (aluguel / administração / repasse) — nunca no contrato nem no site."
          />
          <div className="flex justify-end">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
