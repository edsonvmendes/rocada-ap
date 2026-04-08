"use client";
// ============================================================
// CAMADA DE ARMAZENAMENTO LOCAL - IndexedDB
// Salva relatórios no celular quando sem internet
// ============================================================

import { openDB, DBSchema, IDBPDatabase } from "idb";
import { RelatorioCompleto, AdminConfig } from "@/types";

interface AdminConfigRecord extends AdminConfig {
  id: string;
}

// Schema do banco local
interface RocadaDB extends DBSchema {
  relatorios: {
    key: string;
    value: RelatorioCompleto;
    indexes: { "por-status": string; "por-data": string };
  };
  config: {
    key: string;
    value: AdminConfigRecord;
  };
}

const DB_NAME = "rocada-db";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<RocadaDB> | null = null;

// Abre (ou cria) o banco de dados
async function getDB(): Promise<IDBPDatabase<RocadaDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<RocadaDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store de relatórios
      const store = db.createObjectStore("relatorios", { keyPath: "id" });
      store.createIndex("por-status", "syncStatus");
      store.createIndex("por-data", "criadoEm");

      // Store de configuração do admin
      db.createObjectStore("config", { keyPath: "id" });
    },
  });

  return dbInstance;
}

// Gera ID único para cada relatório
function gerarId(): string {
  return `rel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ---- RELATÓRIOS ----

// Salva um relatório novo
export async function salvarRelatorio(
  relatorio: Omit<RelatorioCompleto, "id" | "syncStatus" | "criadoEm">
): Promise<string> {
  const db = await getDB();
  const id = gerarId();
  const completo: RelatorioCompleto = {
    ...relatorio,
    id,
    syncStatus: "pendente",
    criadoEm: new Date().toISOString(),
  };
  await db.put("relatorios", completo);
  return id;
}

// Atualiza status de sincronização
export async function atualizarStatusSync(
  id: string,
  status: RelatorioCompleto["syncStatus"]
): Promise<void> {
  const db = await getDB();
  const relatorio = await db.get("relatorios", id);
  if (relatorio) {
    await db.put("relatorios", { ...relatorio, syncStatus: status });
  }
}

// Busca todos os relatórios pendentes de envio
export async function buscarPendentes(): Promise<RelatorioCompleto[]> {
  const db = await getDB();
  return db.getAllFromIndex("relatorios", "por-status", "pendente");
}

// Busca todos os relatórios (para dashboard)
export async function buscarTodos(): Promise<RelatorioCompleto[]> {
  const db = await getDB();
  const todos = await db.getAll("relatorios");
  return todos.sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  );
}

// Busca relatórios com erro para retentar
export async function buscarComErro(): Promise<RelatorioCompleto[]> {
  const db = await getDB();
  return db.getAllFromIndex("relatorios", "por-status", "erro");
}

// ---- CONFIGURAÇÕES ADMIN ----

const CONFIG_KEY = "admin_config";

// Salva configuração do admin
export async function salvarConfig(config: AdminConfig): Promise<void> {
  const db = await getDB();
  await db.put("config", { ...config, id: CONFIG_KEY });
}

// Carrega configuração do admin
export async function carregarConfig(): Promise<AdminConfig | null> {
  const db = await getDB();
  const result = await db.get("config", CONFIG_KEY);
  if (!result) return null;
  const { id: configId, ...config } = result;
  void configId;
  return config;
}
