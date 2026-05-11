document.addEventListener('DOMContentLoaded', () => {
    loadSubscriptions();
});

let subscriptions = readSubscriptions();

function readSubscriptions() {
    try {
        const saved = JSON.parse(localStorage.getItem('subscriptions')) || [];
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveToLocalStorage() {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    loadSubscriptions();
}

function loadSubscriptions() {
    const listContainer = document.getElementById('subsList');
    const emptyState = document.getElementById('emptyState');
    const totalAmountEl = document.getElementById('totalAmount');
    const monthlyHintEl = document.getElementById('monthlyHint');
    const subsCountEl = document.getElementById('subsCount');
    const subsCountTopEl = document.getElementById('subsCountTop');
    const yearlyCountEl = document.getElementById('yearlyCount');

    listContainer.innerHTML = '';

    const totalMonthly = subscriptions.reduce((sum, sub) => sum + getMonthlyPrice(sub), 0);
    const yearlyCount = subscriptions.filter((sub) => sub.cycle === 'yearly').length;

    totalAmountEl.textContent = formatMoney(totalMonthly);
    monthlyHintEl.textContent = `${formatMoney(totalMonthly)} VND/tháng`;
    subsCountEl.textContent = `${subscriptions.length} hoạt động`;
    subsCountTopEl.textContent = `${subscriptions.length} dịch vụ`;
    yearlyCountEl.textContent = `${yearlyCount} dịch vụ`;

    if (subscriptions.length === 0) {
        emptyState.hidden = false;
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.hidden = true;
    emptyState.classList.add('hidden');

    subscriptions.forEach((sub) => {
        const iconConfig = getIconConfig(sub.name);
        const price = getPrice(sub);
        const serviceName = escapeHtml(sub.name || 'Dịch vụ');
        const paymentMethod = escapeHtml(sub.paymentMethod || 'Chưa chọn');
        const startDateStr = formatDate(sub.startDate);
        const cycleText = sub.cycle === 'yearly' ? 'mỗi năm' : 'mỗi tháng';
        const monthlyEquivalent = sub.cycle === 'yearly'
            ? `Khoảng ${formatMoney(Math.round(price / 12))} VND/tháng`
            : 'Thanh toán hàng tháng';
        const cancelDateStr = sub.cancelDate
            ? `<p class="mt-1 text-xs font-semibold text-rose-600">Hủy ngày ${formatDate(sub.cancelDate)}</p>`
            : '';

        const card = document.createElement('article');
        card.className = 'subscription-row';
        card.innerHTML = `
            <div class="service-icon" style="color: ${iconConfig.color}; background: ${iconConfig.color}14; border-color: ${iconConfig.color}24">
                <i class="ph-fill ${iconConfig.icon} text-2xl"></i>
            </div>

            <div class="min-w-0">
                <h3 class="truncate text-[15px] font-bold text-slate-950">${serviceName}</h3>
                <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                    <span class="inline-flex items-center gap-1.5">
                        <i class="ph ph-credit-card text-slate-400"></i>
                        ${paymentMethod}
                    </span>
                    <span class="h-1 w-1 rounded-full bg-slate-300"></span>
                    <span>${startDateStr}</span>
                </div>
                <p class="mt-1 text-xs font-medium text-slate-400">${monthlyEquivalent}</p>
                ${cancelDateStr}
            </div>

            <div class="subscription-actions">
                <div class="subscription-price text-right">
                    <p class="whitespace-nowrap text-[15px] font-bold text-slate-950">${formatMoney(price)}</p>
                    <p class="mt-0.5 whitespace-nowrap text-xs font-semibold text-slate-400">${cycleText}</p>
                </div>
                <button class="delete-button" type="button" aria-label="Xóa ${escapeAttribute(sub.name || 'dịch vụ')}">
                    <i class="ph ph-trash text-lg"></i>
                </button>
            </div>
        `;

        card.querySelector('.delete-button').addEventListener('click', () => {
            deleteSubscription(sub.id);
        });

        listContainer.appendChild(card);
    });
}

function getMonthlyPrice(sub) {
    const price = getPrice(sub);
    return sub.cycle === 'yearly' ? Math.round(price / 12) : price;
}

function getPrice(sub) {
    const price = Number.parseInt(sub.price, 10);
    return Number.isFinite(price) ? price : 0;
}

function getIconConfig(name = '') {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('youtube')) return { icon: 'ph-youtube-logo', color: '#dc2626' };
    if (lowerName.includes('spotify')) return { icon: 'ph-spotify-logo', color: '#16a34a' };
    if (lowerName.includes('netflix')) return { icon: 'ph-play-circle', color: '#e11d48' };
    if (lowerName.includes('icloud') || lowerName.includes('apple')) return { icon: 'ph-apple-logo', color: '#111827' };
    if (lowerName.includes('google') || lowerName.includes('gemini')) return { icon: 'ph-google-logo', color: '#2563eb' };
    if (lowerName.includes('chatgpt') || lowerName.includes('openai')) return { icon: 'ph-robot', color: '#059669' };
    if (lowerName.includes('github') || lowerName.includes('copilot')) return { icon: 'ph-github-logo', color: '#111827' };
    if (lowerName.includes('adobe')) return { icon: 'ph-bezier-curve', color: '#dc2626' };
    if (lowerName.includes('vercel')) return { icon: 'ph-triangle', color: '#111827' };
    if (lowerName.includes('figma')) return { icon: 'ph-figma-logo', color: '#f97316' };
    if (lowerName.includes('notion')) return { icon: 'ph-notebook', color: '#111827' };

    return { icon: 'ph-receipt', color: '#2563eb' };
}

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'Chưa có ngày';

    const parts = dateString.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return dateString;

    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function openModal() {
    const modal = document.getElementById('addModal');
    const backdrop = document.getElementById('modalBackdrop');
    const modalContent = modal.querySelector('.modal-content');

    document.getElementById('addForm').reset();
    document.getElementById('startDate').valueAsDate = new Date();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    backdrop.classList.remove('hidden');

    requestAnimationFrame(() => {
        backdrop.classList.add('active');
        modalContent.classList.add('active');
    });
}

function closeModal() {
    const modal = document.getElementById('addModal');
    const backdrop = document.getElementById('modalBackdrop');
    const modalContent = modal.querySelector('.modal-content');

    backdrop.classList.remove('active');
    modalContent.classList.remove('active');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        backdrop.classList.add('hidden');
    }, 260);
}

function saveSubscription() {
    const name = document.getElementById('name').value.trim();
    const price = document.getElementById('price').value;
    const cycle = document.getElementById('cycle').value;
    const startDate = document.getElementById('startDate').value;
    const cancelDate = document.getElementById('cancelDate').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!name || !price || Number(price) <= 0 || !startDate) {
        alert('Vui lòng nhập tên dịch vụ, giá tiền hợp lệ và ngày bắt đầu.');
        return;
    }

    const newSub = {
        id: Date.now().toString(),
        name,
        price,
        cycle,
        startDate,
        cancelDate,
        paymentMethod
    };

    subscriptions.unshift(newSub);
    saveToLocalStorage();
    closeModal();
}

function deleteSubscription(id) {
    const target = subscriptions.find((sub) => sub.id === id);
    const name = target?.name || 'đăng ký này';

    if (confirm(`Xóa ${name}?`)) {
        subscriptions = subscriptions.filter((sub) => sub.id !== id);
        saveToLocalStorage();
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
    return escapeHtml(value).replaceAll('`', '&#096;');
}
