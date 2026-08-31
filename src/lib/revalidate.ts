import { revalidatePath } from "next/cache";

/**
 * Revalida o portal público depois de uma alteração no /admin.
 *
 * Usa `revalidatePath("/", "layout")` — invalida todas as rotas do site.
 * É o suficiente para um site desse porte e garante que qualquer mudança
 * (imóvel, foto, configurações, status por contrato) apareça na hora para
 * quem abrir o site depois. Um visitante com a aba já aberta ainda precisa
 * navegar/recarregar, mas o servidor sempre entrega o conteúdo atual.
 */
export function revalidarPortal() {
  revalidatePath("/", "layout");
}
