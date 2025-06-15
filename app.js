class CodeSnippetVault {
    constructor() {
        this.snippets = JSON.parse(localStorage.getItem('snippets')) || [];
        this.filteredSnippets = [...this.snippets];
        this.editingId = null;
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
        const tagFilter = document.getElementById('tag-filter');

        searchInput.addEventListener('input', () => this.applyFilters());
        languageFilter.addEventListener('change', () => this.applyFilters());
        tagFilter.addEventListener('input', () => this.applyFilters());

        // Data management events
        const exportBtn = document.getElementById('export-btn');
        const importFile = document.getElementById('import-file');

        exportBtn.addEventListener('click', () => this.exportData());
        importFile.addEventListener('change', (e) => this.importData(e));
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

        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        if (this.editingId) {
            // Update existing snippet
            const snippet = {
                id: this.editingId,
                title,
                language,
                code,
                tags,
                updatedAt: new Date().toISOString()
            };
            this.updateSnippet(snippet);
        } else {
            // Add new snippet
            const snippet = {
                id: Date.now(),
                title,
                language,
                code,
                tags,
                createdAt: new Date().toISOString()
            };
            this.addSnippet(snippet);
        }

        this.clearForm();
    }

    addSnippet(snippet) {
        this.snippets.unshift(snippet);
        this.saveSnippets();
        this.applyFilters();
    }

    updateSnippet(updatedSnippet) {
        const index = this.snippets.findIndex(snippet => snippet.id === updatedSnippet.id);
        if (index !== -1) {
            updatedSnippet.createdAt = this.snippets[index].createdAt;
            this.snippets[index] = updatedSnippet;
            this.saveSnippets();
            this.applyFilters();
        }
    }

    editSnippet(id) {
        const snippet = this.snippets.find(s => s.id === id);
        if (!snippet) return;

        document.getElementById('title').value = snippet.title;
        document.getElementById('language').value = snippet.language;
        document.getElementById('code').value = snippet.code;
        document.getElementById('tags').value = snippet.tags.join(', ');

        this.editingId = id;
        const submitBtn = document.querySelector('#snippet-form button[type="submit"]');
        submitBtn.textContent = 'Update Snippet';
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
        this.editingId = null;
        const submitBtn = document.querySelector('#snippet-form button[type="submit"]');
        submitBtn.textContent = 'Save Snippet';
    }

    applyFilters() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const languageFilter = document.getElementById('language-filter').value;
        const tagFilter = document.getElementById('tag-filter').value.toLowerCase();

        this.filteredSnippets = this.snippets.filter(snippet => {
            const matchesSearch = searchTerm === '' ||
                snippet.title.toLowerCase().includes(searchTerm) ||
                snippet.code.toLowerCase().includes(searchTerm);

            const matchesLanguage = languageFilter === '' || snippet.language === languageFilter;

            const matchesTag = tagFilter === '' ||
                snippet.tags.some(tag => tag.toLowerCase().includes(tagFilter));

            return matchesSearch && matchesLanguage && matchesTag;
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

        // Bind edit events
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.editSnippet(id);
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
                    <button class="edit-btn" data-id="${snippet.id}">Edit</button>
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

    exportData() {
        const dataStr = JSON.stringify(this.snippets, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `snippets-${new Date().toISOString().split('T')[0]}.json`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('Snippets exported successfully!');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                if (!Array.isArray(importedData)) {
                    throw new Error('Invalid format');
                }

                // Simple validation
                const isValid = importedData.every(snippet =>
                    snippet.hasOwnProperty('title') &&
                    snippet.hasOwnProperty('code') &&
                    snippet.hasOwnProperty('language')
                );

                if (!isValid) {
                    throw new Error('Invalid snippet structure');
                }

                if (confirm(`Import ${importedData.length} snippets? This will replace existing data.`)) {
                    this.snippets = importedData;
                    this.saveSnippets();
                    this.applyFilters();
                    this.showNotification('Snippets imported successfully!');
                }

            } catch (error) {
                console.error('Import error:', error);
                this.showNotification('Failed to import: Invalid file format');
            }
        };

        reader.readAsText(file);
        event.target.value = '';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new CodeSnippetVault();
});