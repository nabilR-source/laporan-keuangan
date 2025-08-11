const API_BASE = 'http://localhost:4000';

// Auth UI
function setAuthArea(user) {
  const el = document.getElementById('authArea');
  el.innerHTML = '';
  if (!user) {
    el.innerHTML = `<button id="showLogin" class="px-3 py-1 border rounded">Login</button> <button id="showReg" class="px-3 py-1 border rounded">Register</button>`;
    document.getElementById('showLogin').addEventListener('click', showLogin);
    document.getElementById('showReg').addEventListener('click', showRegister);
  } else {
    el.innerHTML = \`<span class="mr-3">Hi, \${user.username}</span><button id="logout" class="px-3 py-1 border rounded">Logout</button>\`;
    document.getElementById('logout').addEventListener('click', () => {
      localStorage.removeItem('token'); localStorage.removeItem('user'); setAuthArea(null);
    });
  }
}

function showLogin() {
  const html = prompt('Login\nMasukkan: username,password (terpisah koma)'); // quick prompt for demo
  if (!html) return;
  const [username,password] = html.split(',').map(s=>s.trim());
  fetch(API_BASE + '/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})})
    .then(r=>r.json()).then(data=>{
      if (data.token) {
        localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user));
        setAuthArea(data.user); alert('Login berhasil');
      } else alert(data.error || 'Gagal login');
    });
}
function showRegister() {
  const html = prompt('Register\nMasukkan: username,password (terpisah koma)');
  if (!html) return;
  const [username,password] = html.split(',').map(s=>s.trim());
  fetch(API_BASE + '/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})})
    .then(r=>r.json()).then(data=>{
      if (data.id) alert('Register berhasil. Silakan login.'); else alert(data.error||'Gagal register');
    });
}

// Fetch and render
async function fetchTransaksi() {
  const res = await fetch(API_BASE + '/api/transactions');
  return res.json();
}

function el(tag, attrs = {}, text = '') {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (text) e.textContent = text;
  return e;
}

async function renderList() {
  const listEl = document.getElementById('list');
  listEl.innerHTML = 'Memuat...';
  const data = await fetchTransaksi();
  if (!data || data.length === 0) {
    listEl.innerHTML = '<div class="p-4 bg-white rounded shadow">Belum ada transaksi.</div>';
    renderChart([]);
    return;
  }
  listEl.innerHTML = '';
  data.forEach(t => {
    const card = el('div', { class: 'p-3 bg-white rounded shadow flex justify-between items-start' });
    const left = el('div');
    left.innerHTML = `<div class="font-semibold">${t.kategori || '-'} · ${t.jenis}</div><div class="text-sm text-gray-500">${t.tanggal}</div><div class="mt-1">${t.keterangan || ''}</div>`;
    const right = el('div', { class: 'text-right' });
    right.innerHTML = `<div class="font-medium">Rp ${Number(t.nominal).toLocaleString('id-ID')}</div><div class="mt-2"><button data-id="${t.id}" class="hapus px-2 py-1 text-sm border rounded">Hapus</button></div>`;
    card.appendChild(left);
    card.appendChild(right);
    listEl.appendChild(card);
  });

  document.querySelectorAll('.hapus').forEach(btn => btn.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    await fetch(API_BASE + '/api/transactions/' + id, { method: 'DELETE' });
    await init();
  }));

  renderChart(data);
}

// Chart & summary
let chartInstance = null;
function renderChart(data) {
  const ctx = document.getElementById('chart').getContext('2d');
  const grouped = data.reduce((acc, t) => {
    acc[t.jenis] = (acc[t.jenis] || 0) + Number(t.nominal || 0);
    return acc;
  }, {});
  const labels = Object.keys(grouped);
  const values = labels.map(l => grouped[l]);
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values }] },
    options: { responsive: true, maintainAspectRatio: false }
  });

  const sum = values.reduce((a,b)=>a+b,0);
  document.getElementById('summary').innerHTML = `<div class="mt-3">Total: Rp ${sum.toLocaleString('id-ID')}</div>`;
}

// Export PDF
document.getElementById('exportPdf').addEventListener('click', async () => {
  const data = await fetchTransaksi();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('Laporan Transaksi', 14, 20);
  let y = 30;
  data.forEach((t, i) => {
    const line = `${t.tanggal} | ${t.jenis} | ${t.kategori || '-'} | Rp ${Number(t.nominal).toLocaleString('id-ID')} | ${t.keterangan || ''}`;
    doc.text(line, 14, y);
    y += 8;
    if (y > 270) { doc.addPage(); y = 20; }
  });
  doc.save('laporan-transaksi.pdf');
});

// form submit
document.getElementById('formTransaksi').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const payload = {
    tanggal: document.getElementById('tanggal').value,
    jenis: document.getElementById('jenis').value,
    kategori: document.getElementById('kategori').value,
    nominal: Number(document.getElementById('nominal').value) || 0,
    metode_pembayaran: document.getElementById('metode').value,
    keterangan: document.getElementById('keterangan').value
  };
  await fetch(API_BASE + '/api/transactions', {
    method: 'POST', headers: {'Content-Type': 'application/json', ...(token?{Authorization:'Bearer '+token}:{})}, body: JSON.stringify(payload)
  });
  e.target.reset();
  await init();
});

async function init() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  setAuthArea(user);
  await renderList();
}

init();
