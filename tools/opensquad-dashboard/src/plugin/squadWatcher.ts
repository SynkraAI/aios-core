import type { Plugin, ViteDevServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { SquadInfo, SquadState, WsMessage } from "../types/state";

function resolveSquadsDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "../squads"),  // started from dashboard/
    path.resolve(process.cwd(), "squads"),     // started from project root
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(process.cwd(), "../squads"); // default (will be created on demand)
}

function discoverSquads(squadsDir: string): SquadInfo[] {
  if (!fs.existsSync(squadsDir)) return [];

  const entries = fs.readdirSync(squadsDir, { withFileTypes: true });
  const squads: SquadInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const yamlPath = path.join(squadsDir, entry.name, "squad.yaml");
    if (fs.existsSync(yamlPath)) {
      try {
        const raw = fs.readFileSync(yamlPath, "utf-8");
        const parsed = parseYaml(raw);
        const s = parsed?.squad;
        if (s) {
          squads.push({
            code: typeof s.code === "string" ? s.code : entry.name,
            name: typeof s.name === "string" ? s.name : entry.name,
            description: typeof s.description === "string" ? s.description : "",
            icon: typeof s.icon === "string" ? s.icon : "\u{1F4CB}",
            agents: Array.isArray(s.agents) ? (s.agents as unknown[]).filter((a): a is string => typeof a === "string") : [],
          });
          continue;
        }
      } catch {
        // Fall through to default
      }
    }

    // No squad.yaml or invalid YAML — use directory name as fallback
    squads.push({
      code: entry.name,
      name: entry.name,
      description: "",
      icon: "\u{1F4CB}",
      agents: [],
    });
  }

  return squads;
}

function isValidState(data: unknown): data is SquadState {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.status === "string" &&
    d.step != null && typeof d.step === "object" &&
    Array.isArray(d.agents)
  );
}

function readActiveStates(squadsDir: string): Record<string, SquadState> {
  const states: Record<string, SquadState> = {};
  if (!fs.existsSync(squadsDir)) return states;

  const entries = fs.readdirSync(squadsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const statePath = path.join(squadsDir, entry.name, "state.json");
    if (!fs.existsSync(statePath)) continue;

    try {
      const raw = fs.readFileSync(statePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (isValidState(parsed)) {
        states[entry.name] = parsed;
      }
    } catch {
      // Skip invalid JSON
    }
  }

  return states;
}

function buildSnapshot(squadsDir: string): WsMessage {
  return {
    type: "SNAPSHOT",
    squads: discoverSquads(squadsDir),
    activeStates: readActiveStates(squadsDir),
  };
}

function broadcast(wss: WebSocketServer, msg: WsMessage) {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

export function squadWatcherPlugin(): Plugin {
  return {
    name: "squad-watcher",
    configureServer(server: ViteDevServer) {
      const squadsDir = resolveSquadsDir();
      server.config.logger.info(`[squad-watcher] squads dir: ${squadsDir}`);

      // Create WebSocket server with noServer to avoid intercepting Vite's HMR
      const wss = new WebSocketServer({ noServer: true });
      (server.httpServer as Server).on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        if (req.url === "/__squads_ws") {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
          });
        }
        // Let Vite handle all other upgrade requests (HMR)
      });

      // Send snapshot on new connection
      wss.on("connection", (ws) => {
        ws.send(JSON.stringify(buildSnapshot(squadsDir)));
      });

      // Ensure squads directory exists
      if (!fs.existsSync(squadsDir)) {
        fs.mkdirSync(squadsDir, { recursive: true });
      }

      // Watch state.json files using Vite's built-in chokidar watcher
      const stateGlob = path.join(squadsDir, "*/state.json").replace(/\\/g, "/");
      server.watcher.add(stateGlob);

      // Debounce timers per squad to avoid reading partial writes
      const changeTimers = new Map<string, ReturnType<typeof setTimeout>>();

      // Also watch for new squad.yaml files
      const yamlGlob = path.join(squadsDir, "*/squad.yaml").replace(/\\/g, "/");
      server.watcher.add(yamlGlob);

      server.watcher.on("add", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          const squadName = extractSquadName(filePath, squadsDir);
          if (!squadName) return;
          clearTimeout(changeTimers.get(squadName));
          changeTimers.set(squadName, setTimeout(() => {
            try {
              const raw = fs.readFileSync(filePath, "utf-8");
              const state: SquadState = JSON.parse(raw);
              broadcast(wss, { type: "SQUAD_ACTIVE", squad: squadName, state });
            } catch { /* skip */ }
          }, 50));
        } else if (filePath.endsWith("squad.yaml")) {
          broadcast(wss, buildSnapshot(squadsDir));
        }
      });

      server.watcher.on("change", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          const squadName = extractSquadName(filePath, squadsDir);
          if (!squadName) return;
          clearTimeout(changeTimers.get(squadName));
          changeTimers.set(squadName, setTimeout(() => {
            try {
              const raw = fs.readFileSync(filePath, "utf-8");
              const state: SquadState = JSON.parse(raw);
              broadcast(wss, { type: "SQUAD_UPDATE", squad: squadName, state });
            } catch { /* skip */ }
          }, 50));
        } else if (filePath.endsWith("squad.yaml")) {
          broadcast(wss, buildSnapshot(squadsDir));
        }
      });

      server.watcher.on("unlink", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          const squadName = extractSquadName(filePath, squadsDir);
          if (!squadName) return;
          clearTimeout(changeTimers.get(squadName));
          changeTimers.delete(squadName);
          broadcast(wss, { type: "SQUAD_INACTIVE", squad: squadName });
        } else if (filePath.endsWith("squad.yaml")) {
          broadcast(wss, buildSnapshot(squadsDir));
        }
      });
    },
  };
}

function extractSquadName(filePath: string, squadsDir: string): string | null {
  const normalized = filePath.replace(/\\/g, "/");
  const normalizedBase = squadsDir.replace(/\\/g, "/");
  const relative = normalized.replace(normalizedBase + "/", "");
  const parts = relative.split("/");
  return parts.length >= 2 ? parts[0] : null;
}
