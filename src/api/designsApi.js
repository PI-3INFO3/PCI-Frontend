import apiClient from "./config";

const UPLOAD_CHUNK_SIZE = 64 * 1024;
const CHUNKED_PPTX_THRESHOLD = 512 * 1024;
const POLL_INTERVAL_MS = 2000;
const MAX_PROCESSING_WAIT_MS = 10 * 60 * 1000;

function criarUploadId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (caractere) => {
      const aleatorio = Math.random() * 16 | 0;

      const valor = caractere === "x"
        ? aleatorio
        : (aleatorio & 0x3 | 0x8);

      return valor.toString(16);
    },
  );
}

function esperar(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const designsApi = {
  meusDesigns(usuarioId) {
    return apiClient.get("/designs/", {
      params: {
        usuario: usuarioId,
      },
    });
  },

  meusProjetosImportantes(usuarioId) {
    return apiClient.get("/designs/", {
      params: {
        usuario: usuarioId,
        importante: true,
      },
    });
  },

  marcarImportante(id, valor) {
    return apiClient.patch(
      `/designs/${id}/`,
      {
        importante: valor,
      },
    );
  },

  criarVazio() {
    return apiClient.post(
      "/designs/",
      {
        name: "Novo Design",
      },
    );
  },

  async uploadArquivo(arquivo) {
    if (!arquivo) {
      throw new Error(
        "Nenhum arquivo foi selecionado.",
      );
    }

    const ehPptx = /\.pptx$/i.test(
      arquivo.name || "",
    );

    const enviarEmPartes =
      ehPptx &&
      arquivo.size > CHUNKED_PPTX_THRESHOLD;

    // Mantém o endpoint original para os demais arquivos.
    if (!enviarEmPartes) {
      const formData = new FormData();

      formData.append(
        "file",
        arquivo,
        arquivo.name,
      );

      return apiClient.post(
        "/designs/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
    }

    const uploadId = criarUploadId();

    const totalChunks = Math.ceil(
      arquivo.size / UPLOAD_CHUNK_SIZE,
    );

    console.info(
      "[UPLOAD] Envio segmentado iniciado:",
      {
        nome: arquivo.name,
        tamanhoMB: Number(
          (
            arquivo.size /
            (1024 * 1024)
          ).toFixed(2),
        ),
        totalPartes: totalChunks,
        tamanhoParteKB:
          UPLOAD_CHUNK_SIZE / 1024,
      },
    );

    // Etapa 1: envia o arquivo ao backend em partes.
    for (
      let index = 0;
      index < totalChunks;
      index += 1
    ) {
      const start =
        index * UPLOAD_CHUNK_SIZE;

      const end = Math.min(
        start + UPLOAD_CHUNK_SIZE,
        arquivo.size,
      );

      const parte = arquivo.slice(
        start,
        end,
      );

      const formData = new FormData();

      formData.append(
        "upload_id",
        uploadId,
      );

      formData.append(
        "file_name",
        arquivo.name,
      );

      formData.append(
        "file_size",
        String(arquivo.size),
      );

      formData.append(
        "chunk_index",
        String(index),
      );

      formData.append(
        "total_chunks",
        String(totalChunks),
      );

      formData.append(
        "chunk",
        parte,
        `chunk-${index}.part`,
      );

      const resposta = await apiClient.post(
        "/designs/upload-chunk/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.info(
        `[UPLOAD] Parte ${index + 1}/${totalChunks} enviada.`,
        resposta.status,
      );
    }

    // Etapa 2: acompanha a importação no servidor.
    const startedAt = Date.now();

    while (
      Date.now() - startedAt <
      MAX_PROCESSING_WAIT_MS
    ) {
      await esperar(POLL_INTERVAL_MS);

      const resposta = await apiClient.get(
        "/designs/upload-chunk/",
        {
          params: {
            upload_id: uploadId,
          },
        },
      );

      const estado = resposta.data?.state;

      if (
        estado === "complete" &&
        resposta.data?.design
      ) {
        console.info(
          "[UPLOAD] PPTX importado com sucesso.",
        );

        // Mantém o formato de resposta esperado pelo Criar.vue.
        return {
          ...resposta,
          data: resposta.data.design,
        };
      }

      if (estado === "failed") {
        const mensagem =
          resposta.data?.error ||
          "O backend não conseguiu importar o PPTX.";

        console.error(
          "[UPLOAD] Falha na importação:",
          mensagem,
        );

        throw new Error(mensagem);
      }

      console.info(
        "[UPLOAD] O backend ainda está processando a apresentação.",
      );
    }

    throw new Error(
      "O backend recebeu o PPTX, mas a importação não terminou no tempo esperado.",
    );
  },

  obterDesign(id) {
    return apiClient.get(`/designs/${id}/`);
  },

  renomearDesign(id, nome) {
    return apiClient.patch(
      `/designs/${id}/`,
      {
        name: nome,
      },
    );
  },

  alterarNome(id, nome) {
    return apiClient.patch(
      `/designs/${id}/`,
      {
        name: nome,
      },
    );
  },

  salvarElementos(
    id,
    elementos,
    pageId = null,
  ) {
    const payload = {
      elements: elementos,
    };

    if (
      pageId !== null &&
      pageId !== undefined
    ) {
      payload.page_id = pageId;
    }

    return apiClient.patch(
      `/designs/${id}/save-elements/`,
      payload,
    );
  },

  excluirDesign(id) {
    return apiClient.delete(
      `/designs/${id}/`,
    );
  },

  obterHistorico(id) {
    return apiClient.get(
      `/designs/${id}/history/`,
    );
  },

  reordenarCamadas(id, elementIds) {
    return apiClient.patch(
      `/designs/${id}/reorder-elements/`,
      {
        element_ids: elementIds,
      },
    );
  },
};

export default designsApi;