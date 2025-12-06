-- Migração para adicionar um campo 'current_balance' à tabela 'accounts'
-- e gerenciar seu valor através de triggers na tabela 'transactions'.

-- ========= INÍCIO DA MIGRATION =========

-- 1. Adicionar a coluna 'current_balance' à tabela 'accounts'
ALTER TABLE public.accounts
ADD COLUMN current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00;

-- 2. Criar uma função para calcular o saldo total de uma conta
CREATE OR REPLACE FUNCTION calculate_account_balance(account_id_param INT)
RETURNS DECIMAL AS $$
DECLARE
    total_transactions_amount DECIMAL(15, 2);
    initial_acc_balance DECIMAL(15, 2);
BEGIN
    -- Obter o initial_balance da conta
    SELECT initial_balance INTO initial_acc_balance
    FROM public.accounts
    WHERE id = account_id_param;

    -- Somar os valores de todas as transações associadas a esta conta
    SELECT COALESCE(SUM(amount), 0) INTO total_transactions_amount
    FROM public.transactions
    WHERE account_id = account_id_param;

    -- O saldo atual é o initial_balance mais a soma das transações
    RETURN initial_acc_balance + total_transactions_amount;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar uma função trigger para atualizar 'current_balance'
CREATE OR REPLACE FUNCTION update_account_current_balance_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    account_id_to_update INT;
BEGIN
    -- Determina qual account_id precisa ser atualizado, dependendo da operação
    IF (TG_OP = 'DELETE') THEN
        account_id_to_update := OLD.account_id;
    ELSE -- INSERT or UPDATE
        account_id_to_update := NEW.account_id;
    END IF;

    -- Atualiza o current_balance da conta
    UPDATE public.accounts
    SET current_balance = calculate_account_balance(account_id_to_update)
    WHERE id = account_id_to_update;

    RETURN NULL; -- Trigger AFTER INSERT/UPDATE/DELETE
END;
$$ LANGUAGE plpgsql;

-- 4. Anexar o trigger à tabela 'transactions'
CREATE TRIGGER update_account_current_balance_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_current_balance_trigger_func();

-- 5. Opcional: Popular o 'current_balance' para contas existentes
--    Isso garantirá que as contas criadas antes desta migração tenham o saldo correto.
DO $$
DECLARE
    acc_record RECORD;
BEGIN
    FOR acc_record IN SELECT id FROM public.accounts LOOP
        UPDATE public.accounts
        SET current_balance = calculate_account_balance(acc_record.id)
        WHERE id = acc_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ========= FIM DA MIGRATION =========