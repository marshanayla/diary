const CORRECT_PASSWORD = 'marsha';

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const enteredPassword = passwordInput.value;
    
    // Clear previous error
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
    
    // Check password
    if (enteredPassword === CORRECT_PASSWORD) {
        // Password is correct - set login flag and redirect to diary page
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'diary.html';
    } else {
        // Show error message
        errorMessage.textContent = 'Incorrect password. Please try again.';
        errorMessage.classList.add('show');
        passwordInput.value = '';
        passwordInput.focus();
    }
});

