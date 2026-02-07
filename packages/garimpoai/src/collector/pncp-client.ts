import {
  ContratacaoPNCP,
  ContratacaoQueryParams,
  PaginatedResponse,
  PropostaQueryParams,
  Modalidade,
} from '../types/pncp';

const BASE_URL = 'https://pncp.gov.br/api/consulta';
const DEFAULT_PAGE_SIZE = 50; // Maximum allowed by PNCP API
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

interface PncpClientOptions {
  baseUrl?: string;
  pageSize?: number;
  maxRetries?: number;
  logger?: (message: string) => void;
}

export class PncpClient {
  private baseUrl: string;
  private pageSize: number;
  private maxRetries: number;
  private log: (message: string) => void;

  constructor(options: PncpClientOptions = {}) {
    this.baseUrl = options.baseUrl || BASE_URL;
    this.pageSize = options.pageSize || DEFAULT_PAGE_SIZE;
    this.maxRetries = options.maxRetries || MAX_RETRIES;
    this.log = options.logger || (() => {});
  }

  /** Format date as yyyyMMdd for PNCP API */
  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /** Fetch with retry and exponential backoff */
  private async fetchWithRetry(url: string): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url);

        if (response.ok) {
          return response;
        }

        // Don't retry client errors (except 429)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          const body = await response.text();
          throw new Error(`PNCP API error ${response.status}: ${body}`);
        }

        lastError = new Error(`PNCP API error ${response.status}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry non-retryable errors
        if (lastError.message.includes('PNCP API error 4')) {
          throw lastError;
        }
      }

      // Exponential backoff
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      this.log(`Retry ${attempt + 1}/${this.maxRetries} in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /** Build URL with query params */
  private buildUrl(path: string, params: Record<string, unknown>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  /** Fetch a single page of contratacoes by publicacao date */
  async getContratacoesByPublicacao(
    params: ContratacaoQueryParams
  ): Promise<PaginatedResponse<ContratacaoPNCP>> {
    const url = this.buildUrl('/v1/contratacoes/publicacao', {
      ...params,
      tamanhoPagina: params.tamanhoPagina || this.pageSize,
    });

    this.log(`Fetching: ${url}`);
    const response = await this.fetchWithRetry(url);
    return response.json() as Promise<PaginatedResponse<ContratacaoPNCP>>;
  }

  /** Fetch a single page of contratacoes by atualizacao date (incremental sync) */
  async getContratacoesByAtualizacao(
    params: ContratacaoQueryParams
  ): Promise<PaginatedResponse<ContratacaoPNCP>> {
    const url = this.buildUrl('/v1/contratacoes/atualizacao', {
      ...params,
      tamanhoPagina: params.tamanhoPagina || this.pageSize,
    });

    this.log(`Fetching updates: ${url}`);
    const response = await this.fetchWithRetry(url);
    return response.json() as Promise<PaginatedResponse<ContratacaoPNCP>>;
  }

  /** Fetch contratacoes with open proposals */
  async getContratacoesByProposta(
    params: PropostaQueryParams
  ): Promise<PaginatedResponse<ContratacaoPNCP>> {
    const url = this.buildUrl('/v1/contratacoes/proposta', {
      ...params,
      tamanhoPagina: params.tamanhoPagina || this.pageSize,
    });

    this.log(`Fetching open proposals: ${url}`);
    const response = await this.fetchWithRetry(url);
    return response.json() as Promise<PaginatedResponse<ContratacaoPNCP>>;
  }

  /** Async generator that yields all pages for a given modalidade and date range */
  async *getAllContratacoes(
    modalidade: Modalidade,
    dataInicial: string,
    dataFinal: string,
    uf?: string
  ): AsyncGenerator<ContratacaoPNCP[], void, unknown> {
    let pagina = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getContratacoesByPublicacao({
        dataInicial,
        dataFinal,
        codigoModalidadeContratacao: modalidade,
        uf,
        pagina,
        tamanhoPagina: this.pageSize,
      });

      if (response.empty || response.data.length === 0) {
        break;
      }

      yield response.data;

      hasMore = response.paginasRestantes > 0;
      pagina++;
    }
  }

  /** Collect all contratacoes for multiple modalidades */
  async collectAll(
    modalidades: Modalidade[],
    dataInicial: string,
    dataFinal: string,
    uf?: string,
    onProgress?: (modalidade: Modalidade, count: number) => void
  ): Promise<ContratacaoPNCP[]> {
    const allResults: ContratacaoPNCP[] = [];

    // Process modalidades sequentially to avoid overloading the API
    for (const modalidade of modalidades) {
      let count = 0;
      try {
        for await (const page of this.getAllContratacoes(
          modalidade,
          dataInicial,
          dataFinal,
          uf
        )) {
          allResults.push(...page);
          count += page.length;
          onProgress?.(modalidade, count);
        }
        this.log(`Modalidade ${modalidade}: ${count} registros`);
      } catch (error) {
        this.log(`Erro na modalidade ${modalidade}: ${error}`);
        // Continue with other modalidades
      }
    }

    return allResults;
  }
}
