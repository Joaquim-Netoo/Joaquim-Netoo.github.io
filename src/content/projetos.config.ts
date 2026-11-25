import type { ProjetoManual, ProjetosConfig, Sobrescrita } from "../lib/types";

/**
 * Curadoria dos projetos.
 * - githubUser: seu usuário do GitHub. Todos os repositórios públicos entram sozinhos
 *   (menos forks e arquivados, se desligados abaixo).
 * - destaques: nomes dos repos em destaque, na ordem. Vazio = 4 repos com mais estrelas.
 *   Repos com o tópico "portfolio" no GitHub entram como destaque automaticamente.
 * - ocultos: repos que não devem aparecer em lugar nenhum.
 * - faculdade: trabalhos da faculdade, numa pasta FACULDADE\ separada no arquivo.
 * - sobrescrever: troca título, descrição, capa ou papel de um repo, ou acrescenta tecnologias.
 *   (As tecnologias são detectadas sozinhas: linguagens do GitHub + bibliotecas do site no ar.)
 * - manuais: projetos FORA do GitHub (clientes, sites no ar, projetos sem repo).
 */
export const projetosConfig: ProjetosConfig = {
  githubUser: "Joaquim-Netoo",
  destaques: ["forja", "apogeu", "direito-delas", "checklist-campori"] as string[],
  ocultos: [] as string[],
  faculdade: ["pweb-ts-estruturas", "tipos-de-typescript", "afya-admin"] as string[],
  mostrarForks: false,
  mostrarArquivados: false,

  sobrescrever: {
    "checklist-campori": {
      descricao:
        "Checklist de bagagem para o acampamento do Campori: marque item por item do que levar e, quando a lista fica completa, uma mala em 3D aparece animada fechando a viagem.",
    },
    "afya-admin": {
      tecnologias: ["Blazor WebAssembly", "MudBlazor"],
    },
  } as Record<string, Sobrescrita>,

  manuais: [
    // Exemplo (copie, preencha e tire as barras "//" para ativar):
    // {
    //   nome: "Loja da Padaria Silva",
    //   descricao: "Site com cardápio e pedidos pelo WhatsApp para uma padaria do bairro.",
    //   data: "2025-08",
    //   linguagem: "TypeScript",
    //   tecnologias: ["next.js", "tailwind"],
    //   link: "https://padariasilva.com.br",
    //   capa: "images/projetos/padaria.webp",
    //   papel: "Front-end e design",
    //   texto: "O que o projeto resolve, como foi feito e o resultado.",
    //   destaque: true,
    // },
  ] as ProjetoManual[],
};

export const PLACEHOLDER_USER = "{{GITHUB_USER}}";
