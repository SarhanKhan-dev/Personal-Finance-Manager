let envUrl = process.env.NEXT_PUBLIC_API_URL || '';
if (envUrl && !envUrl.startsWith('http')) {
    envUrl = `https://${envUrl}`;
}
const BASE_URL = envUrl;

// --- TRANSACTIONS ---
export async function fetchTransactions(params = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') q.append(k, v);
    });

    const res = await fetch(`${BASE_URL}/transactions?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
}

export async function createTransaction(data) {
    const res = await fetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create transaction');
    }
    return res.json();
}

export async function voidTransaction(id) {
    const res = await fetch(`${BASE_URL}/transactions/${id}/void`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to void transaction');
    return res.json();
}

// --- DASHBOARD / REPORTS ---
export async function fetchSummary(from, to) {
    const res = await fetch(`${BASE_URL}/reports/summary?from=${from}&to=${to}`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
}

export async function fetchReportRange(from, to) {
    const res = await fetch(`${BASE_URL}/reports/range?from=${from}&to=${to}`);
    if (!res.ok) throw new Error('Failed to fetch range report');
    return res.json();
}

// --- ASSETS ---
export async function fetchAssets() {
    const res = await fetch(`${BASE_URL}/assets`);
    if (!res.ok) throw new Error('Failed to fetch assets');
    return res.json();
}

export async function createAsset(data) {
    const res = await fetch(`${BASE_URL}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function fetchSources() {
    const res = await fetch(`${BASE_URL}/sources`);
    if (!res.ok) throw new Error('Failed to fetch sources');
    return res.json();
}

// --- OWNERS ---
export async function fetchOwners() {
    const res = await fetch(`${BASE_URL}/owners`);
    if (!res.ok) throw new Error('Failed to fetch owners');
    return res.json();
}

export async function createOwner(data) {
    const res = await fetch(`${BASE_URL}/owners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

// --- PEOPLE ---
export async function fetchPeople(search = '') {
    const res = await fetch(`${BASE_URL}/people?search=${search}`);
    if (!res.ok) throw new Error('Failed to fetch people');
    return res.json();
}

export async function createPerson(data) {
    const res = await fetch(`${BASE_URL}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create person');
    return res.json();
}

export async function updatePerson(id, data) {
    const res = await fetch(`${BASE_URL}/people/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update person');
    return res.json();
}

export async function deletePerson(id) {
    const res = await fetch(`${BASE_URL}/people/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete person');
    return res.json();
}


// --- DEBTS ---
export async function fetchDebtsSummary() {
    const res = await fetch(`${BASE_URL}/debts/summary`);
    if (!res.ok) throw new Error('Failed to fetch debts summary');
    return res.json();
}

export async function fetchReceivables(page = 1, pageSize = 20) {
    const res = await fetch(`${BASE_URL}/debts/receivables?page=${page}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error('Failed to fetch receivables');
    return res.json();
}

export async function fetchPayables(page = 1, pageSize = 20) {
    const res = await fetch(`${BASE_URL}/debts/payables?page=${page}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error('Failed to fetch payables');
    return res.json();
}

export async function fetchPersonTimeline(personId) {
    const res = await fetch(`${BASE_URL}/debts/person/${personId}`);
    if (!res.ok) throw new Error('Failed to fetch person timeline');
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

