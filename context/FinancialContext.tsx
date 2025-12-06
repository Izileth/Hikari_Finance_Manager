import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Database } from '../lib/database.types';

// Define types based on database schema
export type OldAccount = Database['public']['Tables']['accounts']['Row'];
export type OldTransaction = Database['public']['Tables']['transactions']['Row'];
export type OldCategory = Database['public']['Tables']['transaction_categories']['Row'];
export type Budget = Database['public']['Tables']['budgets']['Row'];

// Manually extend types to include new fields from migration
export type Account = OldAccount & {
    is_public?: boolean;
    is_corporate?: boolean;
    current_balance?: number;
};

export type AccountInsert = Omit<
    Database['public']['Tables']['accounts']['Insert'], 
    'profile_id'
> & {
    is_public?: boolean;
    is_corporate?: boolean;
};

export type AccountUpdate = Database['public']['Tables']['accounts']['Update'] & {
    is_public?: boolean;
    is_corporate?: boolean;
};

export type Transaction = OldTransaction & {
    title?: string | null;
    is_corporate?: boolean;
};

export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'] & {
    title?: string | null;
    is_corporate?: boolean;
};

export type Category = OldCategory & {
    is_public?: boolean;
};

export type CategoryInsert = Omit<
    Database['public']['Tables']['transaction_categories']['Insert'], 
    'profile_id'
> & {
    is_public?: boolean;
};

export type CategoryUpdate = Database['public']['Tables']['transaction_categories']['Update'] & {
    is_public?: boolean;
};

interface FinancialContextType {
    accounts: Account[];
    transactions: Transaction[];
    categories: Category[];
    budgets: Budget[];
    loading: boolean;
    error: Error | null;
    refetch: () => void;
    addTransaction: (transaction: TransactionInsert) => Promise<any>;
    updateTransaction: (id: number, updates: Partial<Transaction>) => Promise<any>;
    deleteTransaction: (id: number) => Promise<any>;
    addAccount: (account: AccountInsert) => Promise<any>;
    updateAccount: (id: number, updates: AccountUpdate) => Promise<any>;
    deleteAccount: (id: number) => Promise<any>;
    addCategory: (category: CategoryInsert) => Promise<any>;
    updateCategory: (id: number, updates: CategoryUpdate) => Promise<any>;
    deleteCategory: (id: number) => Promise<any>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
    const { profile } = useAuth();
    
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        if (!profile?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [
                accountsRes,
                transactionsRes,
                categoriesRes,
                budgetsRes
            ] = await Promise.all([
                supabase.from('accounts').select('*').or(`profile_id.eq.${profile.id},is_public.eq.true`),
                supabase.from('transactions').select('*').eq('profile_id', profile.id).order('transaction_date', { ascending: false }),
                supabase.from('transaction_categories').select('*').or(`profile_id.eq.${profile.id},is_public.eq.true`),
                supabase.from('budgets').select('*').eq('profile_id', profile.id)
            ]);

            if (accountsRes.error) throw accountsRes.error;
            if (transactionsRes.error) throw transactionsRes.error;
            if (categoriesRes.error) throw categoriesRes.error;
            if (budgetsRes.error) throw budgetsRes.error;

            setAccounts(accountsRes.data || []);
            setTransactions(transactionsRes.data || []);
            setCategories(categoriesRes.data || []);
            setBudgets(budgetsRes.data || []);

        } catch (e: any) {
            setError(e);
            console.error("Failed to fetch financial data:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile?.id) {
            fetchData();
        } else {
            setAccounts([]);
            setTransactions([]);
            setCategories([]);
            setBudgets([]);
        }
    }, [profile]);

    const refetch = () => {
        fetchData();
    };

    // Transaction Management
    const addTransaction = async (transaction: TransactionInsert) => {
        if (!profile?.id) throw new Error("User not authenticated");
        const { data, error } = await supabase.from('transactions').insert({ ...transaction, profile_id: profile.id }).select();
        if (error) throw error;
        refetch();
        return data;
    };

    const updateTransaction = async (id: number, updates: Partial<Transaction>) => {
        const { data, error } = await supabase.from('transactions').update(updates).eq('id', id).select();
        if (error) throw error;
        refetch();
        return data;
    };

    const deleteTransaction = async (id: number) => {
        const { data, error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        refetch();
        return data;
    };

    // Account Management
    const addAccount = async (account: AccountInsert) => {
        if (!profile?.id) throw new Error("User not authenticated");
        const { data, error } = await supabase.from('accounts').insert({ ...account, profile_id: profile.id }).select();
        if (error) throw error;
        refetch();
        return data;
    };

    const updateAccount = async (id: number, updates: AccountUpdate) => {
        const { data, error } = await supabase.from('accounts').update(updates).eq('id', id).select();
        if (error) throw error;
        refetch();
        return data;
    };

    const deleteAccount = async (id: number) => {
        const { data, error } = await supabase.from('accounts').delete().eq('id', id);
        if (error) throw error;
        refetch();
        return data;
    };

    // Category Management
    const addCategory = async (category: CategoryInsert) => {
        if (!profile?.id) throw new Error("User not authenticated");
        const { data, error } = await supabase.from('transaction_categories').insert({ ...category, profile_id: profile.id }).select();
        if (error) throw error;
        refetch();
        return data;
    };

    const updateCategory = async (id: number, updates: CategoryUpdate) => {
        const { data, error } = await supabase.from('transaction_categories').update(updates).eq('id', id).select();
        if (error) throw error;
        refetch();
        return data;
    };

    const deleteCategory = async (id: number) => {
        const { data, error } = await supabase.from('transaction_categories').delete().eq('id', id);
        if (error) throw error;
        refetch();
        return data;
    };

    const value = {
        accounts,
        transactions,
        categories,
        budgets,
        loading,
        error,
        refetch,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
    };

    return (
        <FinancialContext.Provider value={value}>
            {children}
        </FinancialContext.Provider>
    );
};

export const useFinancials = () => {
    const context = useContext(FinancialContext);
    if (context === undefined) {
        throw new Error('useFinancials must be used within a FinancialProvider');
    }
    return context;
};