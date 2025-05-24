class CodeSnippetVault {
    constructor() {
        this.snippets = JSON.parse(localStorage.getItem('snippets')) || [];
        this.filteredSnippets = [...this.snippets];
        this.init();
    }

    init() {
        this.renderSnippets();
        this.bindEvents();
    }

    bindEvents() {
        const form = document.getElementById('snippet-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Search and filter events
        const searchInput = document.getElementById('search-input');
        const languageFilter = document.getElementById('language-filter');

        searchInput.addEventListener('input', () => this.applyFilters());
        languageFilter.addEventListener('change', () => this.applyFilters());
    }

    handleSubmit(e) {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const language = document.getElementById('language').value;
        const code = document.getElementById('code').value.trim();
        const tagsInput = document.getElementById('tags').value.trim();

        if (!title || !code) {
            alert('Please fill in all required fields');
            return;
        }

        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];

        const snippet = {
            id: Date.now(),
            title,
            language,
            code,
            tags,
            createdAt: new Date().toISOString()
        };

        this.addSnippet(snippet);
        this.clearForm();
    }

    addSnippet(snippet) {
        this.snippets.unshift(snippet);
        this.saveSnippets();
        this.applyFilters();
    }

    deleteSnippet(id) {
        if (confirm('Are you sure you want to delete this snippet?')) {
            this.snippets = this.snippets.filter(snippet => snippet.id !== id);
            this.saveSnippets();
            this.applyFilters();
        }
    }

    saveSnippets() {
        localStorage.setItem('snippets', JSON.stringify(this.snippets));
    }

    clearForm() {
        document.getElementById('snippet-form').reset();
    }

    applyFilters() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const languageFilter = document.getElementById('language-filter').value;

        this.filteredSnippets = this.snippets.filter(snippet => {
            const matchesSearch = searchTerm === '' ||
                snippet.title.toLowerCase().includes(searchTerm) ||
                snippet.code.toLowerCase().includes(searchTerm);

            const matchesLanguage = languageFilter === '' || snippet.language === languageFilter;

            return matchesSearch && matchesLanguage;
        });

        this.renderSnippets();
    }

    renderSnippets() {
        const container = document.getElementById('snippets-container');

        if (this.snippets.length === 0) {
            container.innerHTML = '<p>No snippets yet. Add your first snippet above!</p>';
            return;
        }

        if (this.filteredSnippets.length === 0) {
            container.innerHTML = '<p>No snippets match your search criteria.</p>';
            return;
        }

        container.innerHTML = this.filteredSnippets.map(snippet => this.createSnippetHTML(snippet)).join('');

        // Apply syntax highlighting
        if (window.Prism) {
            Prism.highlightAllUnder(container);
        }

        // Bind delete events
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.deleteSnippet(id);
            });
        });

        // Bind copy events
        container.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const code = e.target.dataset.code;
                this.copyToClipboard(code);
            });
        });
    }

    createSnippetHTML(snippet) {
        const tagsHTML = snippet.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        return `
            <div class="snippet-card">
                <div class="snippet-header">
                    <span class="snippet-title">${snippet.title}</span>
                    <span class="snippet-language">${snippet.language}</span>
                </div>
                <div class="snippet-code">
                    <pre><code class="language-${snippet.language}">${this.escapeHTML(snippet.code)}</code></pre>
                </div>
                <div class="snippet-tags">${tagsHTML}</div>
                <div class="snippet-actions">
                    <button class="copy-btn" data-code="${this.escapeHTML(snippet.code)}">Copy</button>
                    <button class="delete-btn" data-id="${snippet.id}">Delete</button>
                </div>
            </div>
        `;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Code copied!');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new CodeSnippetVault();
});