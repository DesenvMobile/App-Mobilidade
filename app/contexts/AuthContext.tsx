import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, createClient } from '@supabase/supabase-js';

// 1. Crie o cliente Supabase AQUI e EXPORTE-O
export const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

// Define o tipo do que o nosso contexto vai fornecer
interface AuthContextProps {
    session: Session | null;
    loading: boolean;
}

// Cria o Contexto
const AuthContext = createContext<AuthContextProps>({
    session: null,
    loading: true,
});

// Hook customizado para usar o contexto facilmente
export const useAuth = () => {
    return useContext(AuthContext);
};

// Este é o componente "Provedor" que vai abraçar o app
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Tenta pegar a sessão que já existe (se o app foi fechado e reaberto)
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // 2. Ouve por mudanças no estado de autenticação (Login ou Logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setLoading(false);
            }
        );

        // 3. Limpa o listener quando o componente é desmontado
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ session, loading }}>
            {children}
        </AuthContext.Provider>
    );
};