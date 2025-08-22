// Extender los tipos de Express para incluir propiedades personalizadas
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        type: string;
        status: string;
        isEmailVerified: boolean;
        sessionId?: string;
      };
    }
  }
}

export {};