const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';




// --- TRANSACTIONS ---
export async function fetchTransactions() {
    const res = await fetch(`${BASE_URL}/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
}

// --- DASHBOARD / REPORTS ---
export async function fetchSummary(from, to) {
    const res = await fetch(`${BASE_URL}/reports/summary?from=${from}&to=${to}`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
}

export async function fetchTopCategories(from, to) {
    // For now, we reuse summary and map it, or call a specific endpoint if we create it
    const summary = await fetchSummary(from, to);
    return summary.byCategory || [];
}

export async function fetchTopMerchants(from, to) {
    const summary = await fetchSummary(from, to);
    return summary.byMerchant || [];
}

export async function fetchBalances() {
    const res = await fetch(`${BASE_URL}/assets`);
    if (!res.ok) throw new Error('Failed to fetch assets/balances');
    const assets = await res.json();
    return assets;
}

export async function createTransaction(data) {
    const res = await fetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
}

export async function deleteTransaction(id) {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete transaction');
    return res.json();
}

// --- CATEGORIES ---
export async function fetchCategories() {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
}

export async function createCategory(data) {
    const res = await fetch(`${BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
}

export async function updateCategory(id, data) {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
}

export async function deleteCategory(id) {
    const res = await fetch(`${BASE_URL}/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
}

// --- MERCHANTS ---
export async function fetchMerchants() {
    const res = await fetch(`${BASE_URL}/merchants`);
    if (!res.ok) throw new Error('Failed to fetch merchants');
    return res.json();
}

export async function createMerchant(data) {
    const res = await fetch(`${BASE_URL}/merchants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create merchant');
    return res.json();
}

export async function updateMerchant(id, data) {
    const res = await fetch(`${BASE_URL}/merchants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update merchant');
    return res.json();
}

export async function deleteMerchant(id) {
    const res = await fetch(`${BASE_URL}/merchants/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete merchant');
    return res.json();
}

// --- DEBTS ---
export async function fetchDebts() {
    const res = await fetch(`${BASE_URL}/debts`);
    if (!res.ok) throw new Error('Failed to fetch debts');
    return res.json();
}

export async function createDebt(data) {
    const res = await fetch(`${BASE_URL}/debts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create debt');
    return res.json();
}

export async function updateDebt(id, data) {
    const res = await fetch(`${BASE_URL}/debts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update debt');
    return res.json();
}

export async function deleteDebt(id) {
    const res = await fetch(`${BASE_URL}/debts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete debt');
    return res.json();
}

// --- ASSETS ---
export async function fetchAssets() {
    const res = await fetch(`${BASE_URL}/assets`);
    if (!res.ok) throw new Error('Failed to fetch assets');
    return res.json();
}

export async function updateAsset(id, data) {
    const res = await fetch(`${BASE_URL}/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update asset');
    return res.json();
}

// --- SOURCES ---
export async function fetchSources() {
    const res = await fetch(`${BASE_URL}/sources`);
    if (!res.ok) throw new Error('Failed to fetch sources');
    return res.json();
}

export async function updateSource(id, data) {
    const res = await fetch(`${BASE_URL}/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update source');
    return res.json();
}
