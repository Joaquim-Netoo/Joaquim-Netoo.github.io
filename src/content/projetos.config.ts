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
    {
      nome: "App Panata",
      descricao:
        "Aplicativo de organização para uma fábrica de pão de queijo: clientes, vendas e recebimentos num web app que se instala no celular.",
      data: "2026-10-02",
      linguagem: "TypeScript",
      tecnologias: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Supabase", "Cloudflare Pages", "PWA"],
      link: "https://teste.panata-75t.pages.dev/",
      // tela de dentro do app (logado com o acesso de demonstração)
      capa: "images/projetos/panata.webp",
      texto:
        "Web app feito para o dia a dia de uma fábrica de pão de queijo: clientes, novas vendas, rota de entregas, estoque, produção do dia, valores a receber e relatórios da semana e do mês, com lembretes de backup e de contagem do estoque.\n\nFoi pensado para ser instalado no telefone (PWA) e abrir como um aplicativo, sem passar por loja. Front-end em React com TypeScript, dados e autenticação no Supabase e hospedagem no Cloudflare Pages.",
      destaque: false,
      acessoDemo: { email: "integracao@example.com", senha: "iavIrbfDEsmFA2NLN9kqAfvV" },
      obs: "Feito no plano gratuito do Supabase: se o app ficar uma semana sem uso, o banco é pausado e a demonstração pode sair do ar até ser reativada.",
    },
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
