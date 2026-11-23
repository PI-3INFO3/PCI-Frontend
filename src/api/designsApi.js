import { uploadArquivo } from './designUpload.js';
import {
  meusDesigns,
  meusProjetosImportantes,
  marcarImportante,
  criarVazio,
  obterDesign,
  obterPagina,
  renomearDesign,
  alterarNome,
  salvarElementos,
  excluirDesign,
  obterHistorico,
  reordenarCamadas,
} from './designRequests.js';

const designsApi = {
  meusDesigns,
  meusProjetosImportantes,
  marcarImportante,
  criarVazio,
  uploadArquivo,
  obterDesign,
  obterPagina,
  renomearDesign,
  alterarNome,
  salvarElementos,
  excluirDesign,
  obterHistorico,
  reordenarCamadas,
};

export default designsApi;