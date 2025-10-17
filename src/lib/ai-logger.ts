"use server";

import fs from 'fs';
import path from 'path';
import type { AIRequestLog } from './ai-logger.types';


const LOGS_DIR = path.join(process.cwd(), 'logs', 'ai-requests');

// Ensure logs directory exists
function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

// Get today's log file path
function getTodayLogPath(): string {
  const today = new Date().toISOString().split('T')[0];
  return path.join(LOGS_DIR, `ai-requests-${today}.json`);
}

// Read existing logs
function readLogs(): AIRequestLog[] {
  ensureLogsDir();
  const logPath = getTodayLogPath();
  
  if (!fs.existsSync(logPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(logPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

// Append log entry
export async function logAIRequest(log: AIRequestLog) {
  try {
    ensureLogsDir();
    const logPath = getTodayLogPath();
    const logs = readLogs();
    logs.push(log);
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    // Silently fail to avoid breaking the app
    console.error('[AI Logger] Failed to write log:', error);
  }
}

// Export logs for troubleshooting
export async function getAllAILogs(): Promise<AIRequestLog[]> {
  try {
    ensureLogsDir();
    return readLogs();
  } catch {
    return [];
  }
}

// Get logs from specific date
export async function getAILogsByDate(date: Date): Promise<AIRequestLog[]> {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const logPath = path.join(LOGS_DIR, `ai-requests-${dateStr}.json`);
    
    if (!fs.existsSync(logPath)) {
      return [];
    }
    
    const content = fs.readFileSync(logPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

// Get failed requests
export async function getFailedAIRequests(date?: Date): Promise<AIRequestLog[]> {
  const logs = date ? await getAILogsByDate(date) : readLogs();
  return logs.filter(log => log.status === 'error');
}

// Clear logs (optional)
export async function clearAILogs(date?: Date) {
  try {
    ensureLogsDir();
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      const logPath = path.join(LOGS_DIR, `ai-requests-${dateStr}.json`);
      if (fs.existsSync(logPath)) {
        fs.unlinkSync(logPath);
      }
    } else {
      const files = fs.readdirSync(LOGS_DIR);
      files.forEach(file => {
        if (file.startsWith('ai-requests-')) {
          fs.unlinkSync(path.join(LOGS_DIR, file));
        }
      });
    }
  } catch (error) {
    console.error('[AI Logger] Failed to clear logs:', error);
  }
}
