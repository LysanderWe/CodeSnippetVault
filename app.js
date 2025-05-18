class CodeSnippetVault {
    constructor() {
        this.snippets = JSON.parse(localStorage.getItem('snippets')) || [];
        this.init();
    }

    init() {
        this.renderSnippets();
        this.bindEvents();
    }

    bindEvents() {
        const form = document.getElementById('snippet-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
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
        this.renderSnippets();
    }

    deleteSnippet(id) {
        if (confirm('Are you sure you want to delete this snippet?')) {
            this.snippets = this.snippets.filter(snippet => snippet.id !== id);
            this.saveSnippets();
            this.renderSnippets();
        }
    }

    saveSnippets() {
        localStorage.setItem('snippets', JSON.stringify(this.snippets));
    }

    clearForm() {
        document.getElementById('snippet-form').reset();
    }

    renderSnippets() {
        const container = document.getElementById('snippets-container');

        if (this.snippets.length === 0) {
            container.innerHTML = '<p>No snippets yet. Add your first snippet above!</p>';
            return;
        }

        container.innerHTML = this.snippets.map(snippet => this.createSnippetHTML(snippet)).join('');

        // Bind delete events
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.deleteSnippet(id);
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
                <div class="snippet-code">${this.escapeHTML(snippet.code)}</div>
                <div class="snippet-tags">${tagsHTML}</div>
                <div class="snippet-actions">
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
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new CodeSnippetVault();
});