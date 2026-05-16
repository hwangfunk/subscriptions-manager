document.addEventListener('DOMContentLoaded', () => {
    initAuthGate();
    initPasswordToggle();
    initModalKeyboard();
    initDotWaves();
    initServiceSuggestions();
});

const APP_PASSWORD = '2210';
const BRAND_ICON_DIR = 'assets/brand-icons';
const SERVICE_SUGGESTIONS = [
    'YouTube Premium',
    'iCloud+',
    'Netflix',
    'ChatGPT Plus',
    'Shopee',
    'Canva Pro',
    'Spotify',
    'Google One',
    'Figma',
    'Notion',
    'Prime Video',
    'Microsoft 365',
    'Dropbox',
    'Zoom',
    'Slack',
    'Duolingo',
    'Apple Music',
    'Apple TV+'
];

const SERVICE_ICON_CONFIGS = [
    { brand: 'youtube', label: 'YouTube', matches: ['youtube', 'yt premium'], logo: 'youtube.svg', background: '#ff0000', color: '#ffffff', logoSize: '23px' },
    { brand: 'icloud', label: 'iCloud', matches: ['icloud', 'i cloud'], logo: 'icloud.svg', background: '#f7fbff', color: '#3693f3', logoSize: '24px' },
    { brand: 'netflix', label: 'Netflix', matches: ['netflix'], logo: 'netflix.svg', background: '#050506', color: '#e50914', logoSize: '22px' },
    { brand: 'chatgpt', label: 'ChatGPT', matches: ['chatgpt', 'chat gpt', 'openai', 'open ai'], logo: 'openai.svg', background: '#111111', color: '#ffffff', logoSize: '23px' },
    { brand: 'shopee', label: 'Shopee', matches: ['shopee'], logo: 'shopee.svg', background: '#ee4d2d', color: '#ffffff', logoSize: '23px' },
    { brand: 'canva', label: 'Canva', matches: ['canva'], logo: 'canva.svg', background: 'linear-gradient(135deg, #00c4cc 0%, #8b3dff 54%, #ff66c4 100%)', color: '#ffffff', logoSize: '23px' },
    { brand: 'spotify', label: 'Spotify', matches: ['spotify'], logo: 'spotify.svg', background: '#1ed760', color: '#07110a', logoSize: '23px' },
    { brand: 'google', label: 'Google', matches: ['google', 'gemini'], logo: 'google.svg', background: '#ffffff', color: '#4285f4', logoSize: '22px' },
    { brand: 'github', label: 'GitHub', matches: ['github', 'copilot'], logo: 'github.svg', background: '#111318', color: '#ffffff', logoSize: '23px' },
    { brand: 'adobe', label: 'Adobe', matches: ['adobe'], logo: 'adobe.svg', background: '#ff0000', color: '#ffffff', logoSize: '22px' },
    { brand: 'vercel', label: 'Vercel', matches: ['vercel'], logo: 'vercel.svg', background: '#ffffff', color: '#000000', logoSize: '20px' },
    { brand: 'figma', label: 'Figma', matches: ['figma'], logo: 'figma.svg', background: '#ffffff', color: '#f24e1e', logoSize: '23px' },
    { brand: 'notion', label: 'Notion', matches: ['notion'], logo: 'notion.svg', background: '#ffffff', color: '#000000', logoSize: '22px' },
    { brand: 'primevideo', label: 'Prime Video', matches: ['prime video', 'primevideo'], logo: 'primevideo.svg', background: '#1f2e3e', color: '#00a8e1', logoSize: '25px' },
    { brand: 'amazonprime', label: 'Amazon Prime', matches: ['amazon prime', 'amazonprime'], logo: 'amazonprime.svg', background: '#00a8e1', color: '#ffffff', logoSize: '24px' },
    { brand: 'microsoft365', label: 'Microsoft 365', matches: ['microsoft 365', 'microsoft365', 'office 365', 'office365', 'microsoft office'], logo: 'microsoftoffice.svg', background: '#f25022', color: '#ffffff', logoSize: '22px' },
    { brand: 'dropbox', label: 'Dropbox', matches: ['dropbox'], logo: 'dropbox.svg', background: '#0061ff', color: '#ffffff', logoSize: '23px' },
    { brand: 'zoom', label: 'Zoom', matches: ['zoom'], logo: 'zoom.svg', background: '#0b5cff', color: '#ffffff', logoSize: '24px' },
    { brand: 'slack', label: 'Slack', matches: ['slack'], logo: 'slack.svg', background: '#4a154b', color: '#ffffff', logoSize: '22px' },
    { brand: 'duolingo', label: 'Duolingo', matches: ['duolingo'], logo: 'duolingo.svg', background: '#58cc02', color: '#ffffff', logoSize: '24px' },
    { brand: 'applemusic', label: 'Apple Music', matches: ['apple music', 'applemusic'], logo: 'applemusic.svg', background: 'linear-gradient(135deg, #fa233b 0%, #fb5c74 100%)', color: '#ffffff', logoSize: '23px' },
    { brand: 'appletv', label: 'Apple TV', matches: ['apple tv', 'appletv'], logo: 'appletv.svg', background: '#ffffff', color: '#000000', logoSize: '24px' },
    { brand: 'apple', label: 'Apple', matches: ['apple one', 'apple arcade', 'apple'], logo: 'apple.svg', background: '#ffffff', color: '#000000', logoSize: '22px' }
];

let subscriptions = readSubscriptions();
let editingSubscriptionId = null;
let pendingDeleteSubscriptionId = null;

function initAuthGate() {
    const authScreen = document.getElementById('authScreen');
    const authForm = document.getElementById('authForm');
    const passwordInput = document.getElementById('appPassword');
    const authError = document.getElementById('authError');

    if (!authScreen || !authForm || !passwordInput) {
        loadSubscriptions();
        return;
    }

    document.body.classList.add('auth-locked');
    passwordInput.focus();

    authForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (passwordInput.value.trim() === APP_PASSWORD) {
            authError.textContent = '';
            authForm.reset();
            unlockApp(authScreen);
            loadSubscriptions();
            return;
        }

        authError.textContent = 'Mật khẩu không đúng.';
        passwordInput.value = '';
        passwordInput.focus();
    });
}

function initPasswordToggle() {
    const btn = document.getElementById('togglePasswordBtn');
    const input = document.getElementById('appPassword');
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
        const isPassword = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPassword ? 'text' : 'password');
        btn.setAttribute('aria-label', isPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
        btn.innerHTML = isPassword
            ? '<i class="ph ph-eye" aria-hidden="true"></i>'
            : '<i class="ph ph-eye-slash" aria-hidden="true"></i>';
    });
}

function initModalKeyboard() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (isDeleteConfirmOpen()) {
                closeDeleteConfirm();
                return;
            }

            closeModal();
        }
    });
}

function initDotWaves() {
    const canvases = Array.from(document.querySelectorAll('[data-dot-wave]'));
    if (!canvases.length) return;

    const states = canvases.map((canvas) => ({
        canvas,
        context: canvas.getContext('2d'),
        dpr: 1,
        width: 0,
        height: 0,
        kind: canvas.dataset.dotWave
    }));

    window.__dotWaveFrameCount = 0;

    const resize = (state) => {
        const rect = state.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(0, Math.round(rect.width));
        const height = Math.max(0, Math.round(rect.height));

        if (width === state.width && height === state.height && dpr === state.dpr) return;

        state.width = width;
        state.height = height;
        state.dpr = dpr;
        state.canvas.width = Math.max(1, Math.round(width * dpr));
        state.canvas.height = Math.max(1, Math.round(height * dpr));
    };

    const drawWave = (state, now) => {
        const { context, width, height, dpr, kind } = state;
        if (!context || width < 2 || height < 2) return;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, width, height);
        context.globalCompositeOperation = 'lighter';

        const time = now * 0.001;
        const rows = kind === 'auth' ? 28 : 24;
        const columns = 74;
        const rowGap = height / (rows + 4);
        const leftPad = -width * 0.08;
        const usableWidth = width * 1.16;
        const centerX = width / 2;
        const baseY = height * 0.18;

        for (let row = 0; row < rows; row += 1) {
            const depth = row / Math.max(1, rows - 1);
            const perspective = 0.58 + depth * 0.58;
            const rowY = baseY + row * rowGap;
            const rowAlpha = Math.sin(depth * Math.PI) * 0.52 + 0.18;
            const rowPhase = row * 0.43;
            const rowLift = Math.sin(time * 1.35 + rowPhase) * (5 + depth * 10);

            for (let col = 0; col < columns; col += 1) {
                const progress = col / Math.max(1, columns - 1);
                const rawX = leftPad + progress * usableWidth;
                const centered = rawX - centerX;
                const x = centerX + centered * perspective;
                const edgeFade = Math.sin(progress * Math.PI);
                if (edgeFade <= 0) continue;

                const ridge =
                    Math.sin(progress * Math.PI * 3.2 + time * 1.85 + rowPhase) * (10 + depth * 18) +
                    Math.sin(progress * Math.PI * 6.4 - time * 1.15 + row * 0.27) * (2 + depth * 6);
                const horizonCurve = Math.pow(progress - 0.5, 2) * (28 + depth * 44);
                const y = rowY + ridge + rowLift + horizonCurve;

                if (y < -8 || y > height + 8) continue;

                const radius = (0.72 + depth * 0.8) * (kind === 'auth' ? 1 : 0.92);
                const alpha = Math.min(0.92, rowAlpha * edgeFade * (0.65 + depth * 0.48));
                const glowAlpha = alpha * 0.2;

                context.beginPath();
                context.fillStyle = `rgba(255, 255, 255, ${glowAlpha})`;
                context.arc(x, y, radius * 2.2, 0, Math.PI * 2);
                context.fill();

                context.beginPath();
                context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                context.arc(x, y, radius, 0, Math.PI * 2);
                context.fill();
            }
        }

        context.globalCompositeOperation = 'source-over';
    };

    const frame = (now) => {
        window.__dotWaveFrameCount += 1;

        states.forEach((state) => {
            resize(state);
            drawWave(state, now);
            state.canvas.dataset.frame = String(window.__dotWaveFrameCount);
        });

        requestAnimationFrame(frame);
    };

    window.addEventListener('resize', () => {
        states.forEach(resize);
    }, { passive: true });

    requestAnimationFrame(frame);
}

function initServiceSuggestions() {
    const dataList = document.getElementById('serviceSuggestions');
    if (!dataList) return;

    dataList.innerHTML = SERVICE_SUGGESTIONS
        .map((service) => `<option value="${escapeAttribute(service)}"></option>`)
        .join('');
}

function unlockApp(authScreen) {
    document.body.classList.remove('auth-locked');
    authScreen.style.transition = 'opacity 0.3s ease';
    authScreen.style.opacity = '0';

    setTimeout(() => {
        authScreen.hidden = true;
        authScreen.style.display = 'none';
    }, 300);
}

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
    const subsCountEl = document.getElementById('subsCount');
    const yearlyCountEl = document.getElementById('yearlyCount');

    if (!listContainer || !emptyState || !totalAmountEl || !subsCountEl || !yearlyCountEl) return;

    listContainer.innerHTML = '';

    const totalMonthly = subscriptions.reduce((sum, sub) => sum + getMonthlyPrice(sub), 0);
    const yearlyCount = subscriptions.filter((sub) => sub.cycle === 'yearly').length;

    totalAmountEl.textContent = `${formatMoney(totalMonthly)} đ`;
    subsCountEl.textContent = `${subscriptions.length}`;
    yearlyCountEl.textContent = `${yearlyCount}`;

    const hasSubscriptions = subscriptions.length > 0;
    document.body.classList.toggle('has-subscriptions', hasSubscriptions);

    if (!hasSubscriptions) {
        emptyState.classList.add('is-visible');
        return;
    }

    emptyState.classList.remove('is-visible');

    subscriptions.forEach((sub) => {
        listContainer.appendChild(createSubscriptionCard(sub));
    });
}

function createSubscriptionCard(sub) {
    const iconConfig = getIconConfig(sub.name);
    const price = getPrice(sub);
    const serviceName = escapeHtml(sub.name || 'Dịch vụ');
    const rawServiceName = sub.name || 'dịch vụ này';
    const startDateStr = formatDate(sub.startDate);
    const cancelDateStr = sub.cancelDate ? formatDate(sub.cancelDate) : '';
    const paymentMethod = sub.paymentMethod || 'Chưa chọn';
    const monthlyEquivalent = sub.cycle === 'yearly'
        ? `${formatMoney(Math.round(price / 12))} đ/tháng`
        : `${formatMoney(price)} đ/tháng`;

    const card = document.createElement('article');
    card.className = 'subscription-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Chỉnh sửa đăng ký ${rawServiceName}`);

    const iconClass = iconConfig.logo ? 'service-icon service-icon--brand' : 'service-icon';
    const iconStyle = [
        `background: ${iconConfig.background}`,
        `color: ${iconConfig.color}`,
        iconConfig.logo ? `--service-logo: url('${escapeAttribute(iconConfig.logo)}')` : '',
        iconConfig.logoSize ? `--service-logo-size: ${iconConfig.logoSize}` : ''
    ].filter(Boolean).join('; ');
    const iconMarkup = iconConfig.logo
        ? `<span class="service-logo" aria-hidden="true"></span>`
        : `<i class="ph-fill ${iconConfig.icon}" aria-hidden="true"></i>`;

    card.innerHTML = `
        <div class="subscription-main">
            <div class="${iconClass}" style="${iconStyle};">
                ${iconMarkup}
            </div>
            <div class="subscription-copy">
                <h3 class="service-name">${serviceName}</h3>
                <p class="service-price">${monthlyEquivalent}</p>
                <div class="subscription-details" aria-label="Thông tin thanh toán">
                    <span><i class="ph ph-credit-card" aria-hidden="true"></i>${escapeHtml(paymentMethod)}</span>
                    ${cancelDateStr ? `<span><i class="ph ph-calendar-x" aria-hidden="true"></i>Hủy: ${cancelDateStr}</span>` : ''}
                </div>
            </div>
        </div>
        <div class="subscription-date">
            <span>Bắt đầu: ${startDateStr}</span>
            <i class="ph ph-caret-right" style="font-size: 13px;" aria-hidden="true"></i>
        </div>
    `;

    const openEditor = () => openEditModal(sub.id);

    card.addEventListener('click', openEditor);
    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openEditor();
        }
    });

    return card;
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
    const lowerName = normalizeServiceName(name);
    const matchedService = SERVICE_ICON_CONFIGS.find((service) =>
        service.matches.some((match) => lowerName.includes(match))
    );

    if (!matchedService) {
        return { brand: 'generic', icon: 'ph-cube', background: '#2e3138', color: '#ffffff' };
    }

    return {
        ...matchedService,
        logo: `${BRAND_ICON_DIR}/${matchedService.logo}`
    };
}

function normalizeServiceName(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
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
    openSubscriptionModal();
}

function openEditModal(id) {
    const sub = subscriptions.find((item) => item.id === id);
    if (!sub) return;

    openSubscriptionModal(sub);
}

function openSubscriptionModal(sub = null) {
    const modal = document.getElementById('addModal');
    const backdrop = document.getElementById('modalBackdrop');
    const form = document.getElementById('addForm');
    const title = document.getElementById('modalTitle');
    const saveButton = document.getElementById('saveSubscriptionButton');
    const deleteButton = document.getElementById('deleteSubscriptionButton');
    const startDate = document.getElementById('startDate');
    const nameInput = document.getElementById('name');

    if (!modal || !backdrop || !form || !startDate) return;

    editingSubscriptionId = sub?.id || null;
    clearFormError();
    form.reset();
    fillSubscriptionForm(sub);

    if (!sub) {
        startDate.valueAsDate = new Date();
    }

    if (title) {
        title.textContent = sub ? 'Chỉnh sửa đăng ký' : 'Thêm đăng ký';
    }

    if (saveButton) {
        saveButton.innerHTML = sub
            ? '<i class="ph ph-check" aria-hidden="true"></i>Lưu thay đổi'
            : '<i class="ph ph-check" aria-hidden="true"></i>Lưu đăng ký';
    }

    if (deleteButton) {
        deleteButton.hidden = !sub;
    }

    backdrop.hidden = false;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
        backdrop.classList.add('active');
        modal.classList.add('active');
        nameInput?.focus();
    });
}

function closeModal() {
    const modal = document.getElementById('addModal');
    const backdrop = document.getElementById('modalBackdrop');

    if (!modal || !backdrop || !modal.classList.contains('active')) return;

    closeDeleteConfirm();
    editingSubscriptionId = null;
    clearFormError();

    backdrop.classList.remove('active');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');

    setTimeout(() => {
        backdrop.hidden = true;
        modal.hidden = true;
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
        showFormError('Vui lòng nhập tên dịch vụ, giá tiền hợp lệ và ngày bắt đầu.');
        return;
    }

    const subData = {
        id: editingSubscriptionId || Date.now().toString(),
        name,
        price,
        cycle,
        startDate,
        cancelDate,
        paymentMethod
    };

    if (editingSubscriptionId) {
        subscriptions = subscriptions.map((sub) => (
            sub.id === editingSubscriptionId ? subData : sub
        ));
    } else {
        subscriptions.unshift(subData);
    }

    saveToLocalStorage();
    closeModal();
}

function deleteSubscription(id) {
    subscriptions = subscriptions.filter((sub) => sub.id !== id);
    saveToLocalStorage();
}

function fillSubscriptionForm(sub) {
    const fields = {
        name: document.getElementById('name'),
        price: document.getElementById('price'),
        cycle: document.getElementById('cycle'),
        startDate: document.getElementById('startDate'),
        cancelDate: document.getElementById('cancelDate'),
        paymentMethod: document.getElementById('paymentMethod')
    };

    fields.name.value = sub?.name || '';
    fields.price.value = sub?.price || '';
    fields.cycle.value = sub?.cycle || 'monthly';
    fields.startDate.value = sub?.startDate || '';
    fields.cancelDate.value = sub?.cancelDate || '';
    fields.paymentMethod.value = sub?.paymentMethod || 'Apple Pay';
}

function requestDeleteSubscription() {
    if (!editingSubscriptionId) return;

    const sub = subscriptions.find((item) => item.id === editingSubscriptionId);
    if (!sub) return;

    pendingDeleteSubscriptionId = editingSubscriptionId;

    const message = document.getElementById('deleteConfirmMessage');
    if (message) {
        message.textContent = `Đăng ký ${sub.name || 'này'} sẽ bị xóa khỏi danh sách của bạn.`;
    }

    const dialog = document.getElementById('deleteConfirm');
    if (!dialog) return;

    dialog.hidden = false;
    dialog.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
        dialog.classList.add('active');
        document.getElementById('cancelDeleteButton')?.focus();
    });
}

function confirmDeleteSubscription() {
    if (!pendingDeleteSubscriptionId) return;

    const id = pendingDeleteSubscriptionId;
    closeDeleteConfirm();
    closeModal();
    deleteSubscription(id);
}

function closeDeleteConfirm() {
    const dialog = document.getElementById('deleteConfirm');
    if (!dialog || !dialog.classList.contains('active')) return;

    pendingDeleteSubscriptionId = null;
    dialog.classList.remove('active');
    dialog.setAttribute('aria-hidden', 'true');

    setTimeout(() => {
        dialog.hidden = true;
    }, 180);
}

function isDeleteConfirmOpen() {
    const dialog = document.getElementById('deleteConfirm');
    return Boolean(dialog?.classList.contains('active'));
}

function showFormError(message) {
    const error = document.getElementById('formError');
    if (!error) return;

    error.textContent = message;
}

function clearFormError() {
    const error = document.getElementById('formError');
    if (!error) return;

    error.textContent = '';
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
