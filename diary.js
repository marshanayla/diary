// Check if user is logged in (simple check - in a real app, use proper session management)
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
}

// Set today's date
function setTodayDate() {
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('entryDate').textContent = today.toLocaleDateString('en-US', options);
}

// Save entry to localStorage
function saveEntry() {
    const entryText = document.getElementById('diaryEntry').value.trim();
    
    if (!entryText) {
        alert('Please write something before saving!');
        return;
    }
    
    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        content: entryText
    };
    
    // Get existing entries
    let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    
    // Add new entry at the beginning
    entries.unshift(entry);
    
    // Save to localStorage
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
    
    // Clear textarea
    document.getElementById('diaryEntry').value = '';
    
    // Refresh entries list
    displayEntries();
    
    // Show success message
    showNotification('Entry saved successfully!');
}

// Clear current entry
function clearEntry() {
    if (confirm('Are you sure you want to clear this entry?')) {
        document.getElementById('diaryEntry').value = '';
    }
}

// Display all entries
function displayEntries() {
    const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    const entriesList = document.getElementById('entriesList');
    
    if (entries.length === 0) {
        entriesList.innerHTML = '<p class="no-entries">No entries yet. Start writing your first entry!</p>';
        return;
    }
    
    entriesList.innerHTML = entries.map(entry => {
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="entry-item">
                <div class="entry-item-header">
                    <span class="entry-item-date">${formattedDate}</span>
                    <button class="delete-btn" onclick="deleteEntry(${entry.id})" title="Delete entry">×</button>
                </div>
                <div class="entry-item-content">${escapeHtml(entry.content).replace(/\n/g, '<br>')}</div>
            </div>
        `;
    }).join('');
}

// Delete an entry
function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
        entries = entries.filter(entry => entry.id !== id);
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
        displayEntries();
        showNotification('Entry deleted');
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }
}

// Show notification
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize page
setTodayDate();
displayEntries();

// Auto-save draft every 30 seconds
let autoSaveTimer;
const diaryEntry = document.getElementById('diaryEntry');
diaryEntry.addEventListener('input', function() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        const draft = diaryEntry.value;
        if (draft.trim()) {
            localStorage.setItem('diaryDraft', draft);
        }
    }, 30000);
});

// Load draft on page load
window.addEventListener('load', function() {
    const draft = localStorage.getItem('diaryDraft');
    if (draft) {
        if (confirm('You have an unsaved draft. Would you like to restore it?')) {
            diaryEntry.value = draft;
        } else {
            localStorage.removeItem('diaryDraft');
        }
    }
});

