// Check if user is logged in (simple check - in a real app, use proper session management)
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
}

// Text element management
let currentTextElement = null;
let textElementIdCounter = 0;

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

// Font and styling functions
let currentFont = 'Arial';
let currentFontSize = '16px';

function changeFont() {
    const fontFamily = document.getElementById('fontFamily').value;
    currentFont = fontFamily;
    const editor = document.getElementById('diaryEntry');
    editor.style.fontFamily = fontFamily;
    editor.focus();
}

function changeFontSize() {
    const fontSize = document.getElementById('fontSize').value + 'px';
    currentFontSize = fontSize;
    const editor = document.getElementById('diaryEntry');
    editor.style.fontSize = fontSize;
    editor.focus();
}

// Emoji picker functions
function toggleEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    picker.classList.toggle('hidden');
}

function insertEmoji(emoji) {
    const editor = document.getElementById('diaryEntry');
    editor.focus();
    
    // Insert emoji at cursor position
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(emoji);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        editor.textContent += emoji;
    }
    
    // Close emoji picker
    document.getElementById('emojiPicker').classList.add('hidden');
}

// Image upload functions
function insertImage() {
    document.getElementById('imageInput').click();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.draggable = false; // Prevent default drag
        
        // Create resizable and draggable image container
        const imageContainer = createResizableImageContainer(img);
        
        const editor = document.getElementById('diaryEntry');
        editor.focus();
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(imageContainer);
            // Move cursor after image
            range.setStartAfter(imageContainer);
            range.setEndAfter(imageContainer);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            editor.appendChild(imageContainer);
            // Add a line break after image
            const br = document.createElement('br');
            editor.appendChild(br);
        }
        
        // Initialize drag and resize functionality
        makeImageResizableAndDraggable(imageContainer);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    event.target.value = '';
}

// Create a container for resizable and draggable images
function createResizableImageContainer(img) {
    const container = document.createElement('div');
    container.className = 'image-container';
    container.style.position = 'relative';
    container.style.display = 'inline-block';
    container.style.margin = '10px';
    container.style.cursor = 'move';
    container.style.verticalAlign = 'top';
    
    // Set initial image styles
    img.style.display = 'block';
    img.style.borderRadius = '8px';
    img.style.userSelect = 'none';
    img.style.pointerEvents = 'none';
    
    // Set initial container size based on image
    if (img.complete && img.naturalWidth) {
        // Image already loaded
        const maxWidth = 300;
        const width = Math.min(img.naturalWidth, maxWidth);
        const height = (width / img.naturalWidth) * img.naturalHeight;
        container.style.width = width + 'px';
        container.style.height = height + 'px';
        img.style.width = '100%';
        img.style.height = '100%';
    } else {
        // Image not loaded yet, set default size
        container.style.width = '300px';
        container.style.height = 'auto';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        
        // Update when image loads
        img.onload = function() {
            if (!container.style.width || container.style.width === '300px') {
                const maxWidth = 300;
                const width = Math.min(img.naturalWidth, maxWidth);
                const height = (width / img.naturalWidth) * img.naturalHeight;
                container.style.width = width + 'px';
                container.style.height = height + 'px';
                img.style.width = '100%';
                img.style.height = '100%';
            }
        };
    }
    
    container.appendChild(img);
    
    // Add resize handles
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.innerHTML = '↘';
    container.appendChild(resizeHandle);
    
    return container;
}

// Make image resizable and draggable
function makeImageResizableAndDraggable(container) {
    const img = container.querySelector('img');
    const resizeHandle = container.querySelector('.resize-handle');
    let isDragging = false;
    let isResizing = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;
    
    // Drag functionality
    container.addEventListener('mousedown', function(e) {
        if (e.target === resizeHandle) {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(window.getComputedStyle(container).width, 10);
            startHeight = parseInt(window.getComputedStyle(container).height, 10);
        } else {
            isDragging = true;
            startX = e.clientX - container.offsetLeft;
            startY = e.clientY - container.offsetTop;
        }
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isResizing) {
            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);
            
            // Maintain aspect ratio
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const newWidth = Math.max(50, width);
            const newHeight = newWidth / aspectRatio;
            
            container.style.width = newWidth + 'px';
            container.style.height = newHeight + 'px';
            img.style.width = '100%';
            img.style.height = '100%';
        } else if (isDragging) {
            container.style.position = 'absolute';
            container.style.left = (e.clientX - startX) + 'px';
            container.style.top = (e.clientY - startY) + 'px';
            container.style.zIndex = '1000';
        }
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        isResizing = false;
        if (container.style.position === 'absolute') {
            container.style.zIndex = '1';
        }
    });
    
    // Touch events for mobile
    container.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        if (e.target === resizeHandle) {
            isResizing = true;
            startX = touch.clientX;
            startY = touch.clientY;
            startWidth = parseInt(window.getComputedStyle(container).width, 10);
            startHeight = parseInt(window.getComputedStyle(container).height, 10);
        } else {
            isDragging = true;
            startX = touch.clientX - container.offsetLeft;
            startY = touch.clientY - container.offsetTop;
        }
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        
        if (isResizing) {
            const width = startWidth + (touch.clientX - startX);
            const height = startHeight + (touch.clientY - startY);
            
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const newWidth = Math.max(50, width);
            const newHeight = newWidth / aspectRatio;
            
            container.style.width = newWidth + 'px';
            container.style.height = newHeight + 'px';
            img.style.width = '100%';
            img.style.height = '100%';
        } else if (isDragging) {
            container.style.position = 'absolute';
            container.style.left = (touch.clientX - startX) + 'px';
            container.style.top = (touch.clientY - startY) + 'px';
            container.style.zIndex = '1000';
        }
        e.preventDefault();
    });
    
    document.addEventListener('touchend', function() {
        isDragging = false;
        isResizing = false;
        if (container.style.position === 'absolute') {
            container.style.zIndex = '1';
        }
    });
}

// Drawing canvas functions
let isDrawing = false;
let currentColor = '#000000';
let brushSize = 5;
let canvas, ctx;

function toggleDrawingCanvas() {
    const modal = document.getElementById('drawingModal');
    modal.classList.toggle('hidden');
    
    if (!modal.classList.contains('hidden')) {
        initCanvas();
    }
}

function initCanvas() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas background to white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing properties
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Drawing event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        ctx.beginPath();
    }
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                      e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function selectColor(color) {
    currentColor = color;
    ctx.strokeStyle = color;
    
    // Update selected color indicator
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.classList.remove('selected');
        if (swatch.dataset.color === color) {
            swatch.classList.add('selected');
        }
    });
}

function updateBrushSize() {
    brushSize = document.getElementById('brushSize').value;
    document.getElementById('brushSizeValue').textContent = brushSize;
    ctx.lineWidth = brushSize;
}

function clearCanvas() {
    if (confirm('Clear the entire drawing?')) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = currentColor;
    }
}

function insertDrawing() {
    const dataURL = canvas.toDataURL('image/png');
    const img = document.createElement('img');
    img.src = dataURL;
    img.draggable = false;
    
    // Create resizable and draggable image container
    const imageContainer = createResizableImageContainer(img);
    
    const editor = document.getElementById('diaryEntry');
    editor.focus();
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(imageContainer);
        range.setStartAfter(imageContainer);
        range.setEndAfter(imageContainer);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        editor.appendChild(imageContainer);
        const br = document.createElement('br');
        editor.appendChild(br);
    }
    
    // Initialize drag and resize functionality
    makeImageResizableAndDraggable(imageContainer);
    
    // Close drawing modal
    toggleDrawingCanvas();
    showNotification('Drawing inserted!');
}

// Text element functions
function insertTextElement() {
    const editor = document.getElementById('diaryEntry');
    editor.focus();
    
    const textElement = createTextElement('Double-click to edit');
    textElementIdCounter++;
    textElement.dataset.textId = 'text-' + textElementIdCounter;
    
    // Insert at cursor position or at the end
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(textElement);
        range.setStartAfter(textElement);
        range.setEndAfter(textElement);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        editor.appendChild(textElement);
    }
    
    // Make it draggable
    makeTextElementDraggable(textElement);
    
    // Position it slightly offset from insertion point
    const rect = editor.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    textElement.style.left = '20px';
    textElement.style.top = '20px';
    
    showNotification('Text element added! Double-click to edit.');
}

function createTextElement(text) {
    const container = document.createElement('div');
    container.className = 'text-element';
    container.contentEditable = 'false';
    container.style.position = 'absolute';
    container.style.display = 'inline-block';
    container.style.padding = '8px 12px';
    container.style.background = 'rgba(255, 255, 255, 0.9)';
    container.style.border = '2px solid #667eea';
    container.style.borderRadius = '6px';
    container.style.cursor = 'move';
    container.style.minWidth = '100px';
    container.style.minHeight = '30px';
    container.style.zIndex = '100';
    container.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    container.style.userSelect = 'none';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'text-element-content';
    textSpan.textContent = text || 'Double-click to edit';
    textSpan.style.display = 'block';
    textSpan.style.fontSize = '16px';
    textSpan.style.fontFamily = 'Arial, sans-serif';
    textSpan.style.color = '#000000';
    textSpan.style.whiteSpace = 'nowrap';
    textSpan.style.wordWrap = 'break-word';
    
    container.appendChild(textSpan);
    
    // Add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'text-element-delete';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Delete text';
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        if (confirm('Delete this text element?')) {
            container.remove();
        }
    };
    container.appendChild(deleteBtn);
    
    return container;
}

function makeTextElementDraggable(element) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    // Make text editable on double-click
    element.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        const textSpan = element.querySelector('.text-element-content');
        if (textSpan) {
            currentTextElement = element;
            showTextStylePanel();
            makeTextEditable(textSpan);
        }
    });
    
    // Drag functionality
    element.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('text-element-delete')) {
            return;
        }
        isDragging = true;
        element.style.cursor = 'grabbing';
        startX = e.clientX - element.offsetLeft;
        startY = e.clientY - element.offsetTop;
        element.style.zIndex = '1000';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging && element.parentNode) {
            const editor = document.getElementById('diaryEntry');
            const editorRect = editor.getBoundingClientRect();
            
            // Calculate position relative to editor
            const left = e.clientX - editorRect.left - startX;
            const top = e.clientY - editorRect.top - startY;
            
            // Constrain to editor bounds
            const maxLeft = editorRect.width - element.offsetWidth;
            const maxTop = editorRect.height - element.offsetHeight;
            
            element.style.left = Math.max(0, Math.min(left, maxLeft)) + 'px';
            element.style.top = Math.max(0, Math.min(top, maxTop)) + 'px';
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'move';
            element.style.zIndex = '100';
        }
    });
    
    // Touch events for mobile
    element.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('text-element-delete')) {
            return;
        }
        const touch = e.touches[0];
        isDragging = true;
        startX = touch.clientX - element.offsetLeft;
        startY = touch.clientY - element.offsetTop;
        element.style.zIndex = '1000';
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', function(e) {
        if (isDragging && element.parentNode && e.touches.length === 1) {
            const touch = e.touches[0];
            const editor = document.getElementById('diaryEntry');
            const editorRect = editor.getBoundingClientRect();
            
            const left = touch.clientX - editorRect.left - startX;
            const top = touch.clientY - editorRect.top - startY;
            
            const maxLeft = editorRect.width - element.offsetWidth;
            const maxTop = editorRect.height - element.offsetHeight;
            
            element.style.left = Math.max(0, Math.min(left, maxLeft)) + 'px';
            element.style.top = Math.max(0, Math.min(top, maxTop)) + 'px';
        }
        e.preventDefault();
    });
    
    document.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            element.style.zIndex = '100';
        }
    });
}

function makeTextEditable(textSpan) {
    const container = textSpan.parentElement;
    const currentText = textSpan.textContent;
    
    // Create input field
    const input = document.createElement('textarea');
    input.value = currentText;
    input.style.width = '100%';
    input.style.minHeight = '60px';
    input.style.padding = '8px';
    input.style.border = '2px solid #667eea';
    input.style.borderRadius = '4px';
    input.style.fontSize = textSpan.style.fontSize || '16px';
    input.style.fontFamily = textSpan.style.fontFamily || 'Arial, sans-serif';
    input.style.color = textSpan.style.color || '#000000';
    input.style.background = 'white';
    input.style.resize = 'vertical';
    input.style.fontWeight = textSpan.style.fontWeight || 'normal';
    input.style.fontStyle = textSpan.style.fontStyle || 'normal';
    
    // Replace text span with input
    textSpan.style.display = 'none';
    container.insertBefore(input, textSpan);
    input.focus();
    input.select();
    
    // Update text when input loses focus or Enter is pressed
    function updateText() {
        const newText = input.value.trim() || 'Double-click to edit';
        textSpan.textContent = newText;
        textSpan.style.display = 'block';
        input.remove();
        // Keep style panel open
        if (currentTextElement === container) {
            showTextStylePanel();
        }
    }
    
    input.addEventListener('blur', updateText);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            updateText();
        } else if (e.key === 'Escape') {
            textSpan.style.display = 'block';
            input.remove();
            if (currentTextElement === container) {
                showTextStylePanel();
            }
        }
    });
    
    // Prevent clicks on input from closing style panel
    input.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

function showTextStylePanel() {
    const panel = document.getElementById('textStylePanel');
    panel.classList.remove('hidden');
    
    if (currentTextElement) {
        const textSpan = currentTextElement.querySelector('.text-element-content');
        if (textSpan) {
            // Set current values
            const computedStyle = window.getComputedStyle(textSpan);
            document.getElementById('textElementFont').value = computedStyle.fontFamily.split(',')[0].replace(/['"]/g, '') || 'Arial';
            document.getElementById('textElementSize').value = parseInt(computedStyle.fontSize) || 16;
            document.getElementById('textElementColor').value = rgbToHex(computedStyle.color) || '#000000';
            document.getElementById('textElementBold').checked = computedStyle.fontWeight === 'bold' || computedStyle.fontWeight >= '600';
            document.getElementById('textElementItalic').checked = computedStyle.fontStyle === 'italic';
        }
    }
}

function hideTextStylePanel() {
    const panel = document.getElementById('textStylePanel');
    panel.classList.add('hidden');
    currentTextElement = null;
}

function applyTextStyle() {
    if (!currentTextElement) return;
    
    const textSpan = currentTextElement.querySelector('.text-element-content');
    if (!textSpan) return;
    
    const font = document.getElementById('textElementFont').value;
    const size = document.getElementById('textElementSize').value + 'px';
    const color = document.getElementById('textElementColor').value;
    const bold = document.getElementById('textElementBold').checked;
    const italic = document.getElementById('textElementItalic').checked;
    
    textSpan.style.fontFamily = font;
    textSpan.style.fontSize = size;
    textSpan.style.color = color;
    textSpan.style.fontWeight = bold ? 'bold' : 'normal';
    textSpan.style.fontStyle = italic ? 'italic' : 'normal';
    
    showNotification('Text style applied!');
}

function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return '#000000';
    return '#' + result.map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Save entry to localStorage
function saveEntry() {
    const editor = document.getElementById('diaryEntry');
    const entryHTML = editor.innerHTML.trim();
    const entryText = editor.textContent.trim();
    
    if (!entryText) {
        alert('Please write something before saving!');
        return;
    }
    
    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        content: entryHTML, // Save HTML to preserve formatting, images, etc.
        textContent: entryText // Keep text version for search
    };
    
    // Get existing entries
    let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    
    // Add new entry at the beginning
    entries.unshift(entry);
    
    // Save to localStorage
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
    
    // Clear editor
    editor.innerHTML = '';
    editor.style.fontFamily = currentFont;
    editor.style.fontSize = currentFontSize;
    
    // Refresh entries list
    displayEntries();
    
    // Show success message
    showNotification('Entry saved successfully!');
}

// Clear current entry
function clearEntry() {
    if (confirm('Are you sure you want to clear this entry?')) {
        const editor = document.getElementById('diaryEntry');
        editor.innerHTML = '';
        editor.style.fontFamily = currentFont;
        editor.style.fontSize = currentFontSize;
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
        
        // Use HTML content if available, otherwise use text
        const content = entry.content || escapeHtml(entry.textContent || entry.content || '').replace(/\n/g, '<br>');
        
        return `
            <div class="entry-item">
                <div class="entry-item-header">
                    <span class="entry-item-date">${formattedDate}</span>
                    <button class="delete-btn" onclick="deleteEntry(${entry.id})" title="Delete entry">×</button>
                </div>
                <div class="entry-item-content">${content}</div>
            </div>
        `;
    }).join('');
    
    // Reinitialize image containers and text elements for displayed entries
    setTimeout(() => {
        const entryContents = entriesList.querySelectorAll('.entry-item-content');
        entryContents.forEach(contentDiv => {
            // Find all images that are not in containers
            const standaloneImages = contentDiv.querySelectorAll('img:not(.image-container img)');
            standaloneImages.forEach(img => {
                const container = createResizableImageContainer(img.cloneNode(true));
                // Preserve any existing styles
                if (img.style.width) container.style.width = img.style.width;
                if (img.style.height) container.style.height = img.style.height;
                img.parentNode.replaceChild(container, img);
                makeImageResizableAndDraggable(container);
            });
            
            // Reinitialize existing containers
            const containers = contentDiv.querySelectorAll('.image-container');
            containers.forEach(container => {
                // Ensure resize handle exists
                if (!container.querySelector('.resize-handle')) {
                    const img = container.querySelector('img');
                    if (img) {
                        const resizeHandle = document.createElement('div');
                        resizeHandle.className = 'resize-handle';
                        resizeHandle.innerHTML = '↘';
                        container.appendChild(resizeHandle);
                    }
                }
                makeImageResizableAndDraggable(container);
            });
            
            // Reinitialize text elements
            const textElements = contentDiv.querySelectorAll('.text-element');
            textElements.forEach(element => {
                makeTextElementDraggable(element);
            });
        });
    }, 100);
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

// Escape HTML to prevent XSS (for text-only content)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize page
setTodayDate();
displayEntries();

// Set initial font and size
const editor = document.getElementById('diaryEntry');
editor.style.fontFamily = currentFont;
editor.style.fontSize = currentFontSize;

// Auto-save draft every 30 seconds
let autoSaveTimer;
editor.addEventListener('input', function() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        const draft = editor.innerHTML;
        if (editor.textContent.trim()) {
            localStorage.setItem('diaryDraft', draft);
        }
    }, 30000);
});

// Load draft on page load
window.addEventListener('load', function() {
    const draft = localStorage.getItem('diaryDraft');
    if (draft) {
        if (confirm('You have an unsaved draft. Would you like to restore it?')) {
            editor.innerHTML = draft;
            editor.style.fontFamily = currentFont;
            editor.style.fontSize = currentFontSize;
            
            // Reinitialize images and text elements in draft
            setTimeout(() => {
                const standaloneImages = editor.querySelectorAll('img:not(.image-container img)');
                standaloneImages.forEach(img => {
                    const container = createResizableImageContainer(img.cloneNode(true));
                    if (img.style.width) container.style.width = img.style.width;
                    if (img.style.height) container.style.height = img.style.height;
                    img.parentNode.replaceChild(container, img);
                    makeImageResizableAndDraggable(container);
                });
                
                const containers = editor.querySelectorAll('.image-container');
                containers.forEach(container => {
                    if (!container.querySelector('.resize-handle')) {
                        const img = container.querySelector('img');
                        if (img) {
                            const resizeHandle = document.createElement('div');
                            resizeHandle.className = 'resize-handle';
                            resizeHandle.innerHTML = '↘';
                            container.appendChild(resizeHandle);
                        }
                    }
                    makeImageResizableAndDraggable(container);
                });
                
                // Reinitialize text elements
                const textElements = editor.querySelectorAll('.text-element');
                textElements.forEach(element => {
                    makeTextElementDraggable(element);
                });
            }, 100);
        } else {
            localStorage.removeItem('diaryDraft');
        }
    }
});

// Close emoji picker when clicking outside
document.addEventListener('click', function(e) {
    const picker = document.getElementById('emojiPicker');
    const emojiBtn = e.target.closest('[onclick="toggleEmojiPicker()"]');
    if (!picker.contains(e.target) && !emojiBtn && !picker.classList.contains('hidden')) {
        picker.classList.add('hidden');
    }
    
    // Close text style panel when clicking outside
    const stylePanel = document.getElementById('textStylePanel');
    const textElement = e.target.closest('.text-element');
    if (!stylePanel.contains(e.target) && !textElement && !stylePanel.classList.contains('hidden')) {
        hideTextStylePanel();
    }
});
