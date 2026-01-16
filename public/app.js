// DOM Elements
const schemaToggle = document.getElementById('schemaToggle');
const schemaContent = document.getElementById('schemaContent');
const naturalLanguageInput = document.getElementById('naturalLanguageInput');
const generateBtn = document.getElementById('generateBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const outputSection = document.getElementById('outputSection');
const sqlOutput = document.getElementById('sqlOutput');
const copyBtn = document.getElementById('copyBtn');
const exampleBtns = document.querySelectorAll('.example-btn');

// Schema Toggle Functionality
schemaToggle.addEventListener('click', () => {
    schemaContent.classList.toggle('show');
    schemaToggle.classList.toggle('active');
});

// Generate SQL Button Click Handler
generateBtn.addEventListener('click', () => {
    const query = naturalLanguageInput.value.trim();
    if (query) {
        generateSQL(query);
    } else {
        showError('Please enter a natural language query');
    }
});

// Allow Enter key to trigger generation (Ctrl/Cmd + Enter)
naturalLanguageInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const query = naturalLanguageInput.value.trim();
        if (query) {
            generateSQL(query);
        }
    }
});

// Generate SQL Function
async function generateSQL(naturalLanguage) {
    // Hide previous results and errors
    hideError();
    outputSection.classList.remove('show');

    // Show loading state
    loading.classList.add('show');
    generateBtn.disabled = true;

    try {
        const response = await fetch('/api/generate-sql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ naturalLanguage }),
        });

        const data = await response.json();

        if (data.success) {
            // Display the generated SQL
            displaySQL(data.sql, data.cached);
        } else {
            // Show error message
            showError(data.error || 'Failed to generate SQL');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please check your connection and try again.');
    } finally {
        // Hide loading state
        loading.classList.remove('show');
        generateBtn.disabled = false;
    }
}

// Display SQL Output
function displaySQL(sql, cached = false) {
    sqlOutput.textContent = sql;
    outputSection.classList.add('show');

    // Show info message if cached
    if (cached) {
        showInfo('Using cached result (previously generated)');
    }

    // Scroll to output
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show Info Message (for cached results)
function showInfo(message) {
    // Reuse error message element but with different styling
    errorMessage.textContent = '✓ ' + message;
    errorMessage.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    errorMessage.classList.add('show');

    // Auto-hide after 3 seconds
    setTimeout(() => {
        errorMessage.classList.remove('show');
        // Reset background color
        setTimeout(() => {
            errorMessage.style.background = '';
        }, 300);
    }, 3000);
}

// Show Error Message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide Error Message
function hideError() {
    errorMessage.classList.remove('show');
}

// Copy to Clipboard Functionality
copyBtn.addEventListener('click', async () => {
    const sql = sqlOutput.textContent;

    try {
        await navigator.clipboard.writeText(sql);

        // Change button text temporarily
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="copy-icon">✓</span> Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (error) {
        console.error('Failed to copy:', error);
        showError('Failed to copy to clipboard');
    }
});

// Example Query Click Handlers
exampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        naturalLanguageInput.value = query;

        // Optionally auto-generate
        naturalLanguageInput.focus();

        // Scroll to input
        naturalLanguageInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

// Check API health on page load
async function checkAPIHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();

        if (!data.apiKeyConfigured) {
            showError('API key not configured. Please set ANTHROPIC_API_KEY in your .env file.');
        }
    } catch (error) {
        console.error('Health check failed:', error);
    }
}

// Run health check when page loads
checkAPIHealth();
