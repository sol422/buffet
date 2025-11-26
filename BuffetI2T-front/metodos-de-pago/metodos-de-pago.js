let paymentMethods = JSON.parse(localStorage.getItem('paymentMethods')) || [
    { id: '1234', title: 'Visa Débito **** 1234', expiry: '12/2028', isDefault: true, type: 'Visa' },
    { id: '5678', title: 'Mastercard Crédito **** 5678', expiry: '06/2026', isDefault: false, type: 'Mastercard' }
];


let editModal;
let addModal;

document.addEventListener("DOMContentLoaded", () => {
 
    editModal = new bootstrap.Modal(document.getElementById('editPaymentModal'));
    addModal = new bootstrap.Modal(document.getElementById('addPaymentModal'));
    
    renderPaymentMethods();

    // **************** ASIGNACIÓN DE EVENTOS ****************

    // Botones de Tarjetas Existentes (Asegúrate de que los IDs existan en el HTML)
    document.getElementById("edit-1234")?.addEventListener("click", () => openEditModal('1234'));
    document.getElementById("delete-1234")?.addEventListener("click", () => handleDelete('1234'));

    document.getElementById("edit-5678")?.addEventListener("click", () => openEditModal('5678'));
    document.getElementById("delete-5678")?.addEventListener("click", () => handleDelete('5678'));
    
    document.getElementById('saveChangesBtn').addEventListener('click', saveEditedCard); // Guardar Edición
    document.getElementById("addPaymentBtn").addEventListener("click", openAddModal); // Abrir Añadir
    document.getElementById('saveNewMethodBtn').addEventListener('click', saveNewMethod); // Guardar Nuevo Método
    
    document.getElementById('newMethodType').addEventListener('change', toggleMethodFields);
});

// ************ FUNCIONES GENERALES ************

/**
 * Guarda el array actual de métodos de pago en localStorage.
 */
function savePaymentMethods() {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
}

/**
 * Función para renderizar dinámicamente el HTML basado en el array paymentMethods.
 * NOTA: Debido a que el HTML de las tarjetas es estático, esta función solo actualiza textos y visibilidad.
 */
function renderPaymentMethods() {
    document.getElementById('card-1234').style.display = paymentMethods.some(c => c.id === '1234') ? 'block' : 'none';
    document.getElementById('card-5678').style.display = paymentMethods.some(c => c.id === '5678') ? 'block' : 'none';

    paymentMethods.forEach(card => {
        const cardElement = document.getElementById(`card-${card.id}`);
        const expiryElement = cardElement?.querySelector('p.small.mb-0');
        const defaultBadge = cardElement?.querySelector('.badge');

        if (cardElement) {
            cardElement.style.display = 'block'; 
            if (expiryElement) expiryElement.textContent = `Vence ${card.expiry}`;
            
            if (defaultBadge) {
                defaultBadge.style.display = card.isDefault ? 'inline' : 'none';
                cardElement.classList.toggle('border-primary', card.isDefault);
            }
        }
    });
    
    savePaymentMethods();
}

// ************ LÓGICA DE AÑADIR MÉTODO ************

function toggleMethodFields() {
    const type = document.getElementById('newMethodType').value;
    document.getElementById('cardFields').style.display = (type === 'card' ? 'block' : 'none');
    document.getElementById('cashFields').style.display = (type === 'cash' ? 'block' : 'none');
}


function openAddModal() {
    document.getElementById('newMethodType').value = 'card';
    toggleMethodFields(); 
    document.getElementById('newCardNumber').value = '';
    document.getElementById('newCardExpiry').value = '';
    document.getElementById('setNewDefault').checked = false;
    addModal.show();
}

/**
 * Guarda el nuevo método de pago (tarjeta o efectivo).
 */
function saveNewMethod() {
    const type = document.getElementById('newMethodType').value;
    
    if (type === 'cash') {
        alert("✅ La opción 'Efectivo al Recibir' está ahora disponible en la pantalla de Pedido.");
    } else {
        const lastFour = document.getElementById('newCardNumber').value;
        const expiry = document.getElementById('newCardExpiry').value;
        const cardType = document.getElementById('newCardType').value;
        const isDefault = document.getElementById('setNewDefault').checked;

        if (lastFour.length !== 4 || isNaN(lastFour)) {
            alert("❌ Por favor, ingresa los últimos 4 dígitos de la tarjeta.");
            return;
        }

        const newCard = {
            id: String(Math.floor(Math.random() * 9000) + 1000), 
            title: `${cardType} **** ${lastFour}`,
            expiry: expiry,
            isDefault: isDefault,
            type: cardType
        };

        if (isDefault) {
            paymentMethods.forEach(c => c.isDefault = false);
        }
        
        paymentMethods.push(newCard);
        
        alert(`✅ Tarjeta ${newCard.title} añadida con éxito. (Sólo visible si ID es 1234 o 5678 en este HTML estático)`);
    }

    addModal.hide();
    renderPaymentMethods(); 
}

// ************ LÓGICA DE EDICIÓN Y ELIMINACIÓN ************

function openEditModal(cardId) {
    const card = paymentMethods.find(c => c.id === cardId);
    if (!card) return;

    document.getElementById('modalCardId').value = card.id;
    document.getElementById('modalCardTitle').textContent = card.title;
    document.getElementById('modalCardExpiry').value = card.expiry;
    document.getElementById('modalCardDefault').checked = card.isDefault;

    editModal.show();
}

/**
 * Guarda los cambios hechos en el modal y actualiza la vista.
 */
function saveEditedCard() {
    const cardId = document.getElementById('modalCardId').value;
    const newExpiry = document.getElementById('modalCardExpiry').value;
    const isDefault = document.getElementById('modalCardDefault').checked;
    
    const cardIndex = paymentMethods.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    paymentMethods[cardIndex].expiry = newExpiry;

    if (isDefault) {
        paymentMethods.forEach(c => c.isDefault = false); 
        paymentMethods[cardIndex].isDefault = true; 
    } else if (paymentMethods.filter(c => c.isDefault).length === 1 && paymentMethods[cardIndex].isDefault) {
        alert("Debes tener al menos un método de pago predeterminado. Selecciona otra tarjeta si quieres cambiar.");
        return; 
    }
    paymentMethods[cardIndex].isDefault = isDefault;

    editModal.hide();
    alert(`✅ Tarjeta ${paymentMethods[cardIndex].title} actualizada.`);
    renderPaymentMethods(); 
}

/**
 * Elimina una tarjeta del listado.
 */
function handleDelete(cardId) {
    const card = paymentMethods.find(c => c.id === cardId);
    if (!card) return;
    
    if (confirm(`¿Estás seguro que deseas eliminar la tarjeta ${card.title}?`)) {
        if (card.isDefault) {
            alert("❌ No puedes eliminar la tarjeta predeterminada. ¡Selecciona otra como predeterminada primero!");
            return;
        }

        // Eliminar del array
        paymentMethods = paymentMethods.filter(c => c.id !== cardId);
        
        alert(`🗑️ Tarjeta ${card.title} eliminada con éxito.`);
        renderPaymentMethods(); // Refrescar la vista
    }
}