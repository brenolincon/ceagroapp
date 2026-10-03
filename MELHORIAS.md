# Ideias de melhorias para o CeagroApp

Este documento reúne oportunidades para evoluir o aplicativo de scanner e gestão
de documentos/contratos. São ideias para priorização futura; nenhuma das
funcionalidades abaixo está sendo implementada neste momento.

## O que o aplicativo já oferece

- Captura de imagens pela câmera e seleção de imagens da galeria.
- Remoção de imagens antes de gerar o documento.
- Geração de PDF a partir das imagens selecionadas.
- Informar nome do arquivo e pasta.
- Listagem local dos PDFs e visualização de alguns metadados.
- Compartilhamento de PDFs.
- Tipo de dados de contrato e funções utilitárias para agendar alertas de
  vencimento.

## Prioridade sugerida

### P0 — Confiabilidade e proteção dos documentos

- **Armazenamento persistente:** guardar PDFs em um diretório de documentos do
  aplicativo, em vez de depender do cache, que o sistema operacional pode
  limpar.
- **Confirmação antes de sair:** avisar se o usuário tentar voltar ou fechar o
  scanner com imagens ainda não salvas.
- **Tratamento de falhas por página:** informar se uma imagem não puder ser
  lida, em vez de gerar silenciosamente um PDF sem aquela página.
- **Salvar apenas quando todas as páginas forem válidas:** exibir claramente
  quais imagens falharam e permitir tentar novamente ou removê-las.
- **Validação dos nomes:** remover caracteres inválidos, evitar nomes vazios ou
  duplicados e apresentar uma prévia do nome final do arquivo.
- **Prevenção de sobrescrita:** oferecer opções explícitas para substituir,
  renomear ou manter versões diferentes de um documento.
- **Tratamento robusto de permissões:** explicar por que câmera, galeria ou
  notificações são necessárias e orientar o usuário quando o acesso for negado.
- **Testes em builds reais:** verificar câmera, galeria, compartilhamento,
  alertas e aparência da tela de abertura em Android e iOS, além de testar a
  exportação do PDF em dispositivos reais.

### P1 — Scanner mais completo

- **Recorte de bordas:** detectar automaticamente os limites da folha.
- **Correção de perspectiva:** transformar uma foto inclinada em uma página
  retangular alinhada.
- **Ajustes manuais da imagem:** permitir recortar, girar, endireitar e
  reposicionar cada página.
- **Filtros de documento:** oferecer modos colorido, escala de cinza,
  preto-e-branco e realce de contraste.
- **Reordenação de páginas:** permitir arrastar páginas para mudar sua ordem
  antes da geração do PDF.
- **Visualização ampliada:** abrir uma página em tela cheia para conferir
  legibilidade e detalhes.
- **Captura em lote:** facilitar a digitalização de várias páginas sem sair e
  reabrir a câmera a cada foto.
- **Controle de qualidade:** alertar sobre páginas borradas, muito escuras,
  cortadas ou repetidas.
- **Redução do tamanho do arquivo:** permitir escolher qualidade e resolução
  para equilibrar legibilidade e espaço ocupado.
- **Configuração de página:** escolher tamanho A4 ou carta, margens e orientação.
- **Pré-visualização do PDF:** conferir o documento completo antes de salvá-lo.
- **Continuação de digitalização:** adicionar páginas a um documento existente
  sem criar manualmente outro arquivo com sufixo.

### P1 — Biblioteca e organização de documentos

- **Busca:** localizar PDFs por nome, pasta, cliente, banco, tipo ou data.
- **Filtros e ordenação:** filtrar por pasta, período e tipo e ordenar por nome,
  data, tamanho ou vencimento.
- **Pastas gerenciáveis:** criar, renomear, mover e excluir pastas pelo app.
- **Ações nos documentos:** renomear, mover, duplicar, exportar e excluir com
  confirmação.
- **Favoritos e fixados:** destacar documentos acessados frequentemente.
- **Miniaturas:** mostrar uma prévia da primeira página na lista.
- **Visualizador de PDF no app:** abrir, ampliar e navegar pelas páginas sem
  depender de outro aplicativo.
- **Seleção múltipla:** compartilhar, mover ou excluir vários documentos de uma
  vez.
- **Compartilhamento em lote:** selecionar vários PDFs para exportar ou
  compartilhar juntos.
- **Indicadores de armazenamento:** exibir espaço usado e permitir identificar
  arquivos grandes.
- **Recuperação de excluídos:** manter uma lixeira temporária antes da remoção
  definitiva.
- **Exportação e importação de backup:** transferir cópias dos documentos para
  outro dispositivo ou serviço escolhido pelo usuário.

### P1 — Cadastro e acompanhamento de contratos

- **Cadastro de contratos:** criar e editar contratos com cliente, banco, tipo,
  valor, data de vencimento, observações e status.
- **Vincular documentos ao contrato:** associar um ou mais PDFs a um contrato e
  abrir os arquivos a partir dos detalhes dele.
- **Histórico do contrato:** guardar documentos e alterações por contrato, sem
  perder versões anteriores.
- **Painel de vencimentos:** apresentar próximos vencimentos, vencidos e
  contratos ativos.
- **Filtros de contratos:** buscar por cliente, banco, tipo, status e faixa de
  vencimento.
- **Status configuráveis:** por exemplo, em análise, ativo, renovado, encerrado
  ou vencido.
- **Campos personalizados:** permitir registrar informações relevantes ao
  processo de cada usuário.
- **Resumo financeiro:** somar valores por banco, cliente, tipo de contrato ou
  período.
- **Linha do tempo:** visualizar início, alterações, renovações e vencimentos de
  cada contrato.
- **Renovação de contrato:** criar uma nova vigência a partir de um contrato
  existente e preservar o histórico.
- **Exportação de relatórios:** gerar uma planilha ou PDF com contratos e datas
  selecionados.

### P1 — Lembretes e notificações

- **Integrar alertas à interface:** conectar as funções de notificação já
  existentes ao cadastro de contratos e às telas do app.
- **Preferências por contrato:** escolher se deseja alertas e quantos dias antes
  de cada vencimento.
- **Intervalos configuráveis:** deixar o usuário escolher os prazos, em vez de
  depender de uma lista fixa.
- **Reagendamento seletivo:** atualizar ou cancelar apenas os alertas do
  contrato alterado, sem remover os lembretes dos demais contratos.
- **Tratamento de erros de agendamento:** exibir alertas que não puderam ser
  registrados e oferecer uma ação para tentar novamente.
- **Abertura pelo lembrete:** tocar na notificação para abrir o contrato
  correspondente.
- **Resumo de vencimentos:** enviar uma notificação periódica com os contratos
  que vencerão em breve.
- **Fuso horário e data:** validar como horários e mudanças de fuso afetam os
  lembretes.
- **Permissões e canais no Android:** configurar canais de notificação e
  explicar como habilitar alertas nas configurações do aparelho.

### P2 — Extração e automação

- **OCR:** reconhecer texto nas páginas para tornar o conteúdo pesquisável.
- **Extração assistida de dados:** sugerir cliente, banco, valor e vencimento a
  partir de um contrato digitalizado.
- **Confirmação humana:** mostrar os dados extraídos para revisão antes de
  gravá-los no cadastro.
- **Detecção de documentos repetidos:** avisar quando o arquivo ou conteúdo
  parecer igual a um documento existente.
- **Classificação sugerida:** identificar se um arquivo parece ser contrato,
  comprovante, aditivo ou outro tipo de documento.
- **Modelos de nome:** gerar nomes padronizados usando dados do contrato, por
  exemplo, cliente, tipo e data.
- **Assinatura e anotação:** permitir registrar observações ou marcar páginas
  importantes, sem alterar o original.

### P2 — Segurança, privacidade e sincronização

- **Bloqueio do aplicativo:** proteger o acesso com biometria ou PIN.
- **Proteção local de dados:** avaliar criptografia dos arquivos e dos dados de
  contratos armazenados no dispositivo.
- **Sincronização opcional:** manter documentos disponíveis em mais de um
  dispositivo, com indicação clara do estado de sincronização.
- **Escolha do serviço de nuvem:** permitir que o usuário escolha se deseja
  usar um serviço remoto, sem enviar documentos sem consentimento.
- **Conflitos de versões:** definir como conciliar alterações feitas em mais de
  um dispositivo.
- **Sessão e acesso compartilhado:** se houver contas, controlar quem pode
  consultar, editar ou excluir cada documento.
- **Privacidade por padrão:** explicar onde os arquivos ficam, como são
  compartilhados e como apagá-los permanentemente.
- **Retenção configurável:** permitir definir por quanto tempo manter cópias,
  arquivos temporários e itens excluídos.

### P2 — Experiência e acessibilidade

- **Estados de carregamento:** mostrar progresso ao listar, salvar e preparar
  arquivos para compartilhamento.
- **Mensagens acionáveis:** explicar o problema e a ação recomendada em vez de
  apresentar apenas uma mensagem genérica.
- **Atualização da biblioteca ao voltar:** atualizar a lista depois de salvar,
  mover ou excluir um documento.
- **Desfazer ações:** permitir desfazer remoções ou alterações recentes quando
  for seguro.
- **Acessibilidade:** suportar leitores de tela, tamanho de fonte ampliado,
  contraste adequado e áreas de toque confortáveis.
- **Layout responsivo:** adaptar telas a tablets, orientação horizontal e
  diferentes tamanhos de aparelho.
- **Localização:** centralizar textos para facilitar ajustes de idioma e
  padronizar a linguagem.
- **Onboarding:** apresentar rapidamente como digitalizar, salvar e localizar
  documentos.
- **Configurações do usuário:** reunir preferências de qualidade, notificações,
  armazenamento e aparência.
- **Tema escuro:** oferecer uma aparência escura respeitando também a preferência
  do sistema.

### P3 — Evolução técnica e qualidade

- **Persistência estruturada:** armazenar metadados de documentos e contratos em
  uma base local, sem depender de varreduras repetidas do sistema de arquivos.
- **Separação entre dados e telas:** organizar regras de negócio, armazenamento
  e componentes para facilitar manutenção e testes.
- **Tratamento uniforme de erros:** padronizar registro, mensagens e recuperação
  de falhas em câmera, arquivos, PDF e notificações.
- **Testes automatizados:** cobrir geração de PDFs, nomes, organização,
  notificações e casos de erro.
- **Testes de interface:** validar fluxos principais de digitalização,
  gerenciamento e lembretes.
- **Monitoramento de falhas:** coletar diagnósticos com consentimento e sem
  incluir conteúdo sensível dos documentos.
- **Métricas locais opcionais:** medir operações como tempo de digitalização e
  falhas, com transparência e respeito à privacidade.
- **Acessibilidade e compatibilidade contínuas:** validar mudanças futuras do
  Expo SDK em dispositivos e versões de sistema suportadas.

## Roteiro inicial recomendado

1. Garantir armazenamento persistente e tratamento confiável de erros na
   geração do PDF.
2. Completar a edição das páginas: rotação, recorte, reordenação e prévia.
3. Melhorar a biblioteca com busca, renomeação, exclusão segura e visualização.
4. Criar o fluxo de cadastro de contratos e vinculação dos PDFs.
5. Integrar alertas configuráveis às telas de contratos e testar notificações em
   Android e iOS.
6. Avaliar OCR e extração assistida depois de estabilizar armazenamento e
   organização.

## Critérios para escolher a próxima funcionalidade

- Qual problema frequente do usuário ela resolve?
- Ela protege ou reduz o risco de perder documentos?
- Quantas telas e fluxos existentes serão afetados?
- Precisa de acesso à internet, conta ou serviço externo?
- Como será tratada a privacidade de contratos e documentos?
- Como será testada em Android e iOS?
- Qual será a primeira versão pequena que já entrega valor?
