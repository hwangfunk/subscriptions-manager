document.addEventListener('DOMContentLoaded', () => {
    loadSubscriptions();
});

let subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];

function saveToLocalStorage() {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    loadSubscriptions();
}

function loadSubscriptions() {
    const listContainer = document.getElementById('subsList');
    const emptyState = document.getElementById('emptyState');
    const totalAmountEl = document.getElementById('totalAmount');
    
    listContainer.innerHTML = '';
    
    let totalMonthly = 0;

    if (subscriptions.length === 0) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        totalAmountEl.textContent = '0';
        return;
    }

    emptyState.classList.add('hidden');
    emptyState.classList.remove('flex');

    subscriptions.forEach((sub, index) => {
        // Calculate total
        if (sub.cycle === 'monthly') {
            totalMonthly += parseInt(sub.price);
        } else if (sub.cycle === 'yearly') {
            totalMonthly += Math.round(parseInt(sub.price) / 12);
        }

        const iconConfig = getIconConfig(sub.name);
        const startDateStr = formatDate(sub.startDate);
        const cancelDateStr = sub.cancelDate ? `<div class="mt-2 text-[10px] font-medium text-red-400/80 bg-red-500/10 inline-block px-2 py-0.5 rounded-md border border-red-500/20">Cancels: ${formatDate(sub.cancelDate)}</div>` : '';
        const cycleText = sub.cycle === 'monthly' ? '/mo' : '/yr';

        const card = document.createElement('div');
        // Add staggered animation delay based on index
        const delay = index * 0.05;
        card.className = `linear-card p-4 rounded-2xl relative overflow-hidden group opacity-0`;
        card.style.animation = `fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`;
        
        card.innerHTML = `
            <div class="flex items-center gap-4 relative z-10">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 bg-white/[0.03]" style="box-shadow: inset 0 0 20px ${iconConfig.color}20">
                    <i class="ph-fill ${iconConfig.icon} text-2xl" style="color: ${iconConfig.color}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-white text-sm truncate">${sub.name}</h3>
                    <p class="text-[11px] text-vercel-gray3 mt-0.5 truncate flex items-center gap-1.5 font-medium">
                        <i class="ph-fill ph-credit-card text-white/40"></i> ${sub.paymentMethod}
                        <span class="w-0.5 h-0.5 rounded-full bg-white/20"></span>
                        ${startDateStr}
                    </p>
                    ${cancelDateStr}
                </div>
                <div class="text-right flex-shrink-0">
                    <div class="font-semibold text-white text-sm">${formatMoney(sub.price)}</div>
                    <div class="text-[11px] text-vercel-gray3 font-medium mt-0.5">${cycleText}</div>
                </div>
            </div>
            
            <button onclick="deleteSubscription('${sub.id}')" class="absolute top-1/2 -translate-y-1/2 right-4 w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500/20 hover:scale-110 z-20 md:flex hidden">
                <i class="ph ph-trash"></i>
            </button>
            
            <!-- Mobile delete swipe/tap area -->
            <button onclick="deleteSubscription('${sub.id}')" class="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-red-500/50 md:hidden z-20 active:bg-red-500/10 active:text-red-500 transition-colors">
                <i class="ph ph-trash"></i>
            </button>
        `;
        listContainer.appendChild(card);
    });

    // Update total monthly amount with smooth counter effect could be added, but formatting for now
    totalAmountEl.textContent = formatMoney(totalMonthly);
}

function getIconConfig(name) {
    const lowerName = name.toLowerCase();
    // Vibrant colors for dark mode
    if (lowerName.includes('youtube')) return { icon: 'ph-youtube-logo', color: '#ff0000' };
    if (lowerName.includes('spotify')) return { icon: 'ph-spotify-logo', color: '#1db954' };
    if (lowerName.includes('netflix')) return { icon: 'ph-play-circle', color: '#E50914' };
    if (lowerName.includes('icloud') || lowerName.includes('apple')) return { icon: 'ph-apple-logo', color: '#FFFFFF' };
    if (lowerName.includes('google') || lowerName.includes('gemini')) return { icon: 'ph-google-logo', color: '#4285F4' };
    if (lowerName.includes('chatgpt') || lowerName.includes('openai')) return { icon: 'ph-robot', color: '#10A37F' };
    if (lowerName.includes('github') || lowerName.includes('copilot')) return { icon: 'ph-github-logo', color: '#FFFFFF' };
    if (lowerName.includes('adobe')) return { icon: 'ph-bezier-curve', color: '#FF0000' };
    if (lowerName.includes('vercel')) return { icon: 'ph-triangle', color: '#FFFFFF' };
    if (lowerName.includes('figma')) return { icon: 'ph-figma-logo', color: '#F24E1E' };
    if (lowerName.includes('notion')) return { icon: 'ph-notebook', color: '#FFFFFF' };
    
    // Default fallback
    return { icon: 'ph-planet', color: '#0070F3' };
}

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    // Format to minimal style like "Oct 24, 2023"
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Modal handling with Vercel/Linear style smooth fade & scale
function openModal() {
    const modal = document.getElementById('addModal');
    const backdrop = document.getElementById('modalBackdrop');
    const modalContent = modal.querySelector('.modal-content');
    
    // Clear form
    document.getElementById('addForm').reset();
    document.getElementById('startDate').valueAsDate = new Date();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    backdrop.classList.remove('hidden');
    
    // Trigger animation
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
    }, 300); // match transition duration
}

function saveSubscription() {
    const name = document.getElementById('name').value.trim();
    const price = document.getElementById('price').value;
    const cycle = document.getElementById('cycle').value;
    const startDate = document.getElementById('startDate').value;
    const cancelDate = document.getElementById('cancelDate').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!name || !price || !startDate) {
        alert('Please fill in Name, Price and Start Date.');
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

    subscriptions.unshift(newSub); // Add to top
    saveToLocalStorage();
    closeModal();
}

function deleteSubscription(id) {
    if (confirm('Delete this subscription?')) {
        subscriptions = subscriptions.filter(sub => sub.id !== id);
        saveToLocalStorage();
    }
}
