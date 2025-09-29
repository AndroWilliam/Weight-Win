export const logger = {
  info: (message: string, meta?: object) => 
    console.log(JSON.stringify({ 
      level: 'info', 
      message, 
      meta, 
      ts: new Date().toISOString() 
    })),
  error: (message: string, err?: Error | unknown, meta?: object) => 
    console.error(JSON.stringify({
      level: 'error', 
      message, 
      error: err instanceof Error ? err.message : String(err), 
      meta, 
      ts: new Date().toISOString()
    })),
};
