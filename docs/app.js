document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SIMULAÇÃO DO BANCO DE DADOS E ESTADO INICIAL ---
    const DB = {
        getCardapio: () => JSON.parse(localStorage.getItem('cardapio')),
        saveCardapio: (cardapio) => localStorage.setItem('cardapio', JSON.stringify(cardapio)),
        getPedidos: () => JSON.parse(localStorage.getItem('pedidos')) || [],
        savePedidos: (pedidos) => localStorage.setItem('pedidos', JSON.stringify(pedidos)),
        getCart: () => JSON.parse(localStorage.getItem('cart')) || [],
        saveCart: (cart) => localStorage.setItem('cart', JSON.stringify(cart)),
    };

    // Cardápio inicial - Corrigido para ser mais robusto
    if (!DB.getCardapio()) {
        const initialCardapio = [
            { id: 1, nome: "Salada de Frutas", preco: 6.00, img: "imagem/salada-de-frutas.jpg" },
            { id: 2, nome: "Suco de Jambo", preco: 3.00, img: "imagem/suco.jpg" },
            { id: 3, nome: "Brownie Zero Açúcar", preco: 5.50, img: "imagem/brownie.jpg" },
            { id: 4, nome: "Cookies Fitness", preco: 4.00, img: "imagem/cookies.jpg" },
        ];
        DB.saveCardapio(initialCardapio);
    }

    let screenHistory = ['role-selection-screen'];

    // --- 2. GERENCIAMENTO DE NAVEGAÇÃO ---
    const navigateTo = (screenId, isBack = false) => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        if (!isBack) {
            screenHistory.push(screenId);
        }
    };

    // Listener de clique geral, mais seguro
    document.body.addEventListener('click', (e) => {
        const targetScreen = e.target.closest('[data-target]')?.dataset.target;
        if (targetScreen) {
            e.preventDefault();
            navigateTo(targetScreen);
            if(targetScreen === 'adm-dashboard-screen') renderAdminDashboard();
            if(targetScreen === 'adm-items-screen') renderAdminItems();
        }

        if (e.target.closest('.back-btn')) {
            if (screenHistory.length > 1) {
                screenHistory.pop();
                navigateTo(screenHistory[screenHistory.length - 1], true);
            }
        }

        if (e.target.closest('.logout-btn')) {
            screenHistory = ['role-selection-screen'];
            navigateTo('role-selection-screen');
        }
    });

    // ==================================================================
    //  NOVA LÓGICA DE LOGIN - A SOLUÇÃO DEFINITIVA
    // ==================================================================
    document.querySelectorAll('.login-submit-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const form = btn.closest('form');
    
            if (form.checkValidity()) {
                event.preventDefault();
                const role = btn.dataset.role
    
                if (role === 'aluno') {
                    // Se o botão clicado tiver data-role="aluno", executa isto:
                    renderCardapio();
                    navigateTo('cardapio-screen');
                } else if (role === 'adm') {
                    // Se o botão clicado tiver data-role="adm", executa isto:
                    renderAdminDashboard();
                    navigateTo('adm-dashboard-screen');
                }
            }
        });
    });

    // --- 3. LÓGICA DO ALUNO (CARDÁPIO E CARRINHO) ---
    const renderCardapio = (filter = '') => {
        const cardapioList = document.getElementById('cardapio-list');
        cardapioList.innerHTML = '';
        const cardapio = DB.getCardapio().filter(item => 
            item.nome.toLowerCase().includes(filter.toLowerCase())
        );
        cardapio.forEach(item => {
            // Código mais seguro para a imagem, evita erros se a imagem não existir
            const imageSrc = item.img || 'imagem/default.png'; 
            cardapioList.innerHTML += `
                <div class="cardapio-item">
                    <img src="${imageSrc}" alt="${item.nome}">
                    <h4>${item.nome}</h4>
                    <p class="price">R$${item.preco.toFixed(2)}</p>
                    <button class="add-to-cart-btn" data-id="${item.id}"> Adicionar </button>
                </div>`;
        });
    };

    // (O resto do seu código continua exatamente igual daqui para baixo)

    document.getElementById('search-input').addEventListener('input', (e) => renderCardapio(e.target.value));
    document.getElementById('cardapio-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const itemId = parseInt(e.target.dataset.id);
            const cart = DB.getCart();
            const itemInCart = cart.find(item => item.id === itemId);
            if (itemInCart) {
                itemInCart.quantity++;
            } else {
                cart.push({ id: itemId, quantity: 1 });
            }
            DB.saveCart(cart);
            updateCartCount();
        }
    });
    const updateCartCount = () => {
        const cart = DB.getCart();
        document.getElementById('cart-count').textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
    };
    const renderCart = () => {
        const cartContainer = document.getElementById('cart-items-container');
        let totalPrice = 0;
        const cart = DB.getCart();
        const cardapio = DB.getCardapio();
        
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Seu carrinho está vazio.</p>';
        } else {
             cartContainer.innerHTML = `<div class="cart-item-row"><strong>produto</strong><strong>unit.</strong><strong>qtd</strong><strong>preço</strong></div>`;
            cart.forEach(cartItem => {
                const product = cardapio.find(p => p.id === cartItem.id);
                if (!product) return;
                const itemTotalPrice = product.preco * cartItem.quantity;
                totalPrice += itemTotalPrice;
                cartContainer.innerHTML += `
                    <div class="cart-item-row">
                        <span>${product.nome}</span>
                        <span>R$${product.preco.toFixed(2)}</span>
                        <span>${cartItem.quantity}</span>
                        <span>R$${itemTotalPrice.toFixed(2)}</span>
                    </div>`;
            });
        }
        document.getElementById('cart-total-price').textContent = `R$${totalPrice.toFixed(2)}`;
    };
    document.getElementById('cart-btn').addEventListener('click', () => {
        renderCart();
        navigateTo('cart-screen');
    });
    document.getElementById('clear-cart-btn').addEventListener('click', () => {
        DB.saveCart([]);
        updateCartCount();
        renderCart();
    });
    document.getElementById('checkout-btn').addEventListener('click', () => {
        const cart = DB.getCart();
        if (cart.length === 0) return alert("Seu carrinho está vazio!");
        const pedidos = DB.getPedidos();
        pedidos.push({ id: Date.now(), items: cart, status: 'pendente' });
        DB.savePedidos(pedidos);
        DB.saveCart([]);
        updateCartCount();
        alert("Pedido realizado com sucesso!");
        navigateTo('cardapio-screen');
    });
    // --- 4. LÓGICA DO ADMINISTRADOR ---
    const renderAdminDashboard = () => {
        const pedidos = DB.getPedidos();
        const cardapio = DB.getCardapio();
        const lists = {
            pendente: document.querySelector('#pedidos-do-dia .order-list'),
            preparacao: document.querySelector('#em-preparacao .order-list'),
            entregue: document.querySelector('#entregue .order-list')
        };
        Object.values(lists).forEach(list => list.innerHTML = '');

        pedidos.forEach(order => {
            if (!lists[order.status]) return;
            const itemsHtml = order.items.map(item => {
                const product = cardapio.find(p => p.id === item.id);
                return `<li>${product?.nome || 'Item removido'} ${item.quantity}x</li>`;
            }).join('');
            lists[order.status].innerHTML += `
                <div class="order-card">
                    <ul>${itemsHtml}</ul>
                    <div class="order-card-actions">
                        ${order.status === 'pendente' ? `<button class="btn-prepare" data-id="${order.id}">Preparar</button>` : ''}
                        ${order.status === 'preparacao' ? `<button class="btn-deliver" data-id="${order.id}">Entregar</button>` : ''}
                    </div>
                </div>`;
        });
    };
    document.getElementById('pedidos-dashboard').addEventListener('click', e => {
        const orderId = e.target.dataset.id;
        if (!orderId) return;
        const pedidos = DB.getPedidos();
        const order = pedidos.find(o => o.id == orderId);
        if (e.target.classList.contains('btn-prepare')) order.status = 'preparacao';
        else if (e.target.classList.contains('btn-deliver')) order.status = 'entregue';
        DB.savePedidos(pedidos);
        renderAdminDashboard();
    });
    const renderAdminItems = () => {
        const cardapio = DB.getCardapio();
        const editList = document.getElementById('edit-items-list');
        const addList = document.getElementById('add-items-list');
        editList.innerHTML = '';
        cardapio.forEach(item => {
            editList.innerHTML += `
                <div class="edit-item" data-id="${item.id}">
                    <span>${item.nome}</span>
                    <input type="number" step="0.50" value="${item.preco.toFixed(2)}" min="0"> 
                    <button class="icon-btn remove-item-btn"><img src="imagem/lixo.png" alt="Lixo" class="logo-lixo" height="20" weight="20">
                    <i class="fas fa-trash-alt"></i></button>
               </div>`;
        });
        addList.innerHTML = `
            <div class="add-item-row">
                <input type="text" id="new-item-name" placeholder="Nome do produto">
                <input type="number" id="new-item-price" placeholder="Preço" step="0.50" min="0">
            </div>`;
    };
    document.getElementById('save-prices-btn').addEventListener('click', () => {
        const cardapio = DB.getCardapio();
        document.querySelectorAll('#edit-items-list .edit-item').forEach(itemEl => {
            const itemId = parseInt(itemEl.dataset.id);
            const newPrice = parseFloat(itemEl.querySelector('input').value);
            const item = cardapio.find(i => i.id === itemId);
            if (item) item.preco = newPrice;
        });
        DB.saveCardapio(cardapio);
        alert('Preços atualizados!');
    });
    document.getElementById('add-product-btn').addEventListener('click', () => {
        const name = document.getElementById('new-item-name').value;
        const price = parseFloat(document.getElementById('new-item-price').value);
        if (!name || isNaN(price)) return alert('Preencha o nome e o preço corretamente.');
        const cardapio = DB.getCardapio();
        cardapio.push({
            id: Date.now(),
            nome: name,
            preco: price,
            img: 'imagem/default.png' // Imagem padrão para novos itens
        });
        DB.saveCardapio(cardapio);
        alert('Produto adicionado!');
        renderAdminItems();
    });
    document.getElementById('edit-items-list').addEventListener('click', e => {
        if(e.target.closest('.remove-item-btn')) {
            const itemEl = e.target.closest('.edit-item');
            const itemId = parseInt(itemEl.dataset.id);
            if (confirm('Tem certeza que deseja remover este item?')) {
                let cardapio = DB.getCardapio();
                cardapio = cardapio.filter(i => i.id !== itemId);
                DB.saveCardapio(cardapio);
                renderAdminItems();
            }
        }
    });

    // --- 5. INICIALIZAÇÃO DO APP ---
    updateCartCount();
    navigateTo('role-selection-screen', true);
});

