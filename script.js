// Toggle tree items
function toggleTree(button) {
    const icon = button.querySelector('i');
    const nested = button.closest('.doc-tree-item').querySelector('.doc-tree-nested');

    if (nested) {
        nested.classList.toggle('collapsed');
        if (nested.classList.contains('collapsed')) {
            icon.className = 'ti ti-chevron-right';
        } else {
            icon.className = 'ti ti-chevron-down';
        }
    }
}

// Toggle edit mode
function toggleEditMode() {
    const doc = document.querySelector('.kb-document');
    const btn = event.target.closest('button');
    const icon = btn.querySelector('i');

    doc.classList.toggle('editor-mode');

    if (doc.classList.contains('editor-mode')) {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-success');
        icon.className = 'ti ti-check';
        btn.innerHTML = '<i class="ti ti-check"></i> Save';
    } else {
        btn.classList.remove('btn-success');
        btn.classList.add('btn-primary');
        icon.className = 'ti ti-edit';
        btn.innerHTML = '<i class="ti ti-edit"></i> Modify';
    }
}

// Toggle comments panel
function toggleCommentsPanel(commentId = null) {
    const panel = document.querySelector('.kb-comments-panel');
    const historyPanel = document.querySelector('.kb-history-panel');
    const isOpen = panel.classList.contains('open');

    // Close history panel if open
    if (historyPanel.classList.contains('open')) {
        historyPanel.classList.remove('open');
    }

    if (isOpen && !commentId) {
        panel.classList.remove('open');
    } else {
        panel.classList.add('open');
        if (commentId) {
            scrollToComment(commentId);
        }
    }
}

// Toggle history panel
function toggleHistoryPanel() {
    const panel = document.querySelector('.kb-history-panel');
    const commentsPanel = document.querySelector('.kb-comments-panel');
    const isOpen = panel.classList.contains('open');

    // Close comments panel if open
    if (commentsPanel.classList.contains('open')) {
        commentsPanel.classList.remove('open');
    }

    if (isOpen) {
        panel.classList.remove('open');
    } else {
        panel.classList.add('open');
    }
}

// Scroll to specific comment and highlight it
function scrollToComment(commentId) {
    const panel = document.querySelector('.kb-comments-panel');
    const comment = panel.querySelector(`[data-comment="${commentId}"]`);

    // Remove previous highlight
    panel.querySelectorAll('.kb-comment').forEach(c => c.classList.remove('highlighted'));

    if (comment) {
        comment.classList.add('highlighted');
        comment.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Scrollspy functionality
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            document.querySelectorAll('.scrollspy-nav a').forEach(link => {
                link.classList.remove('active');
            });
            const activeLink = document.querySelector(`.scrollspy-nav a[href="#${id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}, {
    rootMargin: '-20% 0px -35% 0px'
});

// Observe all section headings
document.querySelectorAll('[id^="section-"]').forEach((section) => {
    observer.observe(section);
});

// Smooth scroll for scrollspy links
document.querySelectorAll('.scrollspy-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Click handlers for highlights
document.querySelectorAll('.kb-highlight').forEach(highlight => {
    highlight.addEventListener('click', (e) => {
        e.preventDefault();
        const commentId = highlight.getAttribute('data-comment');
        toggleCommentsPanel(commentId);
    });
});

// Active state for tree links
document.querySelectorAll('.doc-tree-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.doc-tree-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Show/hide document title in breadcrumb on scroll
const contentArea = document.querySelector('.kb-content');
const breadcrumbTitle = document.querySelector('.kb-breadcrumb-title');

if (contentArea && breadcrumbTitle) {
    contentArea.addEventListener('scroll', () => {
        if (contentArea.scrollTop > 50) {
            breadcrumbTitle.style.display = 'inline';
        } else {
            breadcrumbTitle.style.display = 'none';
        }
    });
}

// Copy heading anchor to URL and clipboard on click
document.querySelectorAll('.kb-document h2, .kb-document h3').forEach(heading => {
    heading.style.cursor = 'pointer';
    heading.addEventListener('click', () => {
        const id = heading.getAttribute('id');
        if (id) {
            const url = `${window.location.origin}${window.location.pathname}#${id}`;
            window.history.pushState(null, null, `#${id}`);
            navigator.clipboard.writeText(url);
        }
    });
});

// Close comments panel on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const commentsPanel = document.querySelector('.kb-comments-panel');
        const historyPanel = document.querySelector('.kb-history-panel');
        if (commentsPanel.classList.contains('open')) {
            commentsPanel.classList.remove('open');
        }
        if (historyPanel.classList.contains('open')) {
            historyPanel.classList.remove('open');
        }
    }
});

// Add action menus and add-child buttons via templates
document.addEventListener('DOMContentLoaded', () => {
    const actionTemplate = document.getElementById('doc-action-menu-template');
    const addTemplate = document.getElementById('doc-add-child-template');
    if (!actionTemplate) return;

    const rowTargets = document.querySelectorAll('.doc-tree-row');
    const headerTargets = document.querySelectorAll('.action-menu-host');

    // For tree rows: add plus button (if template exists) then action menu
    rowTargets.forEach(target => {
        if (addTemplate) {
            const addClone = addTemplate.content.cloneNode(true);
            target.appendChild(addClone);
        }
        const actionClone = actionTemplate.content.cloneNode(true);
        target.appendChild(actionClone);
    });

    // For header host: only action menu
    headerTargets.forEach(target => {
        const actionClone = actionTemplate.content.cloneNode(true);
        target.appendChild(actionClone);
    });

    // Inline add-child behavior (demo only)
    document.body.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.doc-add-child button');
        if (!addBtn) return;
        e.preventDefault();

        const row = addBtn.closest('.doc-tree-row');
        if (!row) return;

        const listItem = row.closest('.doc-tree-item');
        if (!listItem) return;

        // Ensure nested UL exists
        let nested = listItem.querySelector(':scope > .doc-tree-nested');
        if (!nested) {
            nested = document.createElement('ul');
            nested.className = 'doc-tree-nested list-unstyled ps-4';
            listItem.appendChild(nested);
        }

        // Remove any existing inline editor under this item
        const existingEditor = nested.querySelector('.doc-inline-editor');
        if (existingEditor) {
            existingEditor.remove();
        }

        // Create inline editor row
        const newItem = document.createElement('li');
        newItem.className = 'doc-tree-item doc-inline-editor';

        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex align-items-center';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'New document name';
        input.className = 'form-control form-control-sm';

        wrapper.appendChild(input);
        newItem.appendChild(wrapper);

        nested.prepend(newItem);

        input.focus();
    });
});

// Revert to a specific version
function revertToVersion(versionId) {
    const allSteps = document.querySelectorAll('.step-item');
    const targetStep = document.querySelector(`.step-item[data-version="${versionId}"]`);

    // Remove active class from all steps
    allSteps.forEach(step => {
        step.classList.remove('active');
    });

    // Add active class to the target step
    if (targetStep) {
        targetStep.classList.add('active');
    }

    // Move the current version label
    const currentLabel = document.querySelector('.step-item:not([data-version])');
    if (currentLabel && targetStep) {
        // Update the current version content
        currentLabel.innerHTML = targetStep.innerHTML;
        currentLabel.innerHTML = `
            <div class="small fw-semibold text-dark">Reverted to ${targetStep.querySelector('.small.fw-semibold').textContent}</div>
            ${targetStep.querySelector('.text-secondary').innerHTML}
        `;
        currentLabel.classList.add('active');
        targetStep.classList.remove('active');
    }

    console.log(`Reverted to version ${versionId}`);
}

// Toggle article in/out of FAQ
function toggleFAQ(event) {
    event.preventDefault();
    const link = event.target.closest('.faq-toggle-link');
    const checkbox = link.querySelector('.faq-toggle-checkbox');
    
    if (!checkbox) return;
    
    // Toggle checkbox state
    checkbox.checked = !checkbox.checked;
    
    // Update link active state
    if (checkbox.checked) {
        link.classList.add('active');
        console.log('Article added to FAQ');
    } else {
        link.classList.remove('active');
        console.log('Article removed from FAQ');
    }
}

// Toggle article in/out of favorites
function toggleFavorites(event) {
    event.preventDefault();
    const link = event.target.closest('.favorites-toggle-link');
    const checkbox = link.querySelector('.favorites-toggle-checkbox');
    
    if (!checkbox) return;
    
    // Toggle checkbox state
    checkbox.checked = !checkbox.checked;
    
    // Update link active state
    if (checkbox.checked) {
        link.classList.add('active');
        console.log('Article added to favorites');
    } else {
        link.classList.remove('active');
        console.log('Article removed from favorites');
    }
}

// Scroll to documents section
function scrollToDocuments(event) {
    event.preventDefault();
    const documentsSection = document.getElementById('kb-documents');
    if (documentsSection) {
        documentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Document upload functionality
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('documentDropZone');
    const fileInput = document.getElementById('documentFileInput');
    const fileList = document.getElementById('documentFileList');
    const fileListContainer = document.getElementById('fileListContainer');
    const uploadBtn = document.getElementById('uploadDocumentBtn');
    let selectedFiles = [];

    if (!dropZone || !fileInput) return;

    // Click to open file browser
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        }, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    // Handle selected files from file input
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        selectedFiles = Array.from(files);
        displayFiles();
        uploadBtn.disabled = selectedFiles.length === 0;
    }

    function displayFiles() {
        if (selectedFiles.length === 0) {
            fileList.style.display = 'none';
            return;
        }

        fileList.style.display = 'block';
        fileListContainer.innerHTML = '';

        selectedFiles.forEach((file, index) => {
            const fileItem = createFileItem(file, index);
            fileListContainer.appendChild(fileItem);
        });
    }

    function createFileItem(file, index) {
        const div = document.createElement('div');
        div.className = 'document-file-item';

        const icon = getFileIcon(file.name);
        const size = formatFileSize(file.size);

        div.innerHTML = `
            <i class="file-icon ti ${icon.class}" style="color: ${icon.color};"></i>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${size}</div>
            </div>
            <button type="button" class="btn btn-sm btn-link text-danger remove-file" data-index="${index}">
                <i class="ti ti-x"></i>
            </button>
        `;

        div.querySelector('.remove-file').addEventListener('click', () => {
            removeFile(index);
        });

        return div;
    }

    function removeFile(index) {
        selectedFiles.splice(index, 1);
        displayFiles();
        uploadBtn.disabled = selectedFiles.length === 0;
    }

    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            pdf: { class: 'ti-file-type-pdf', color: '#dc2626' },
            doc: { class: 'ti-file-type-doc', color: '#2563eb' },
            docx: { class: 'ti-file-type-doc', color: '#2563eb' },
            xls: { class: 'ti-file-spreadsheet', color: '#16a34a' },
            xlsx: { class: 'ti-file-spreadsheet', color: '#16a34a' },
            zip: { class: 'ti-file-zip', color: '#f59e0b' },
            txt: { class: 'ti-file-text', color: '#0891b2' }
        };
        return icons[ext] || { class: 'ti-file', color: '#6b7280' };
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Upload button handler
    uploadBtn.addEventListener('click', () => {
        if (selectedFiles.length === 0) return;
        
        const description = document.getElementById('documentDescription').value;
        console.log('Uploading files:', selectedFiles);
        console.log('Description:', description);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDocumentModal'));
        if (modal) modal.hide();
        
        // Reset form
        selectedFiles = [];
        fileInput.value = '';
        document.getElementById('documentDescription').value = '';
        displayFiles();
    });

    // Reset when modal is closed
    document.getElementById('addDocumentModal').addEventListener('hidden.bs.modal', () => {
        selectedFiles = [];
        fileInput.value = '';
        document.getElementById('documentDescription').value = '';
        displayFiles();
        uploadBtn.disabled = true;
    });
});

// Search Modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchFuzzyInput');
    const searchResults = document.getElementById('searchResults');
    const recentSearches = document.getElementById('recentSearches');

    if (!searchInput) return;

    // Simple fuzzy search handler (demo only)
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length === 0) {
            // Show recent searches
            searchResults.style.display = 'none';
            recentSearches.style.display = 'block';
        } else {
            // Show search results (demo with static results)
            searchResults.style.display = 'block';
            recentSearches.style.display = 'none';

            // Update results based on query (demo only)
            const resultsList = searchResults.querySelector('.list-group');
            resultsList.innerHTML = `
                <a href="#" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">Installation Guide</h6>
                        <small class="text-muted">85% match</small>
                    </div>
                    <p class="mb-1 small text-muted">GLPI > Tutorials > Getting Started</p>
                </a>
                <a href="#" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">Installation Requirements</h6>
                        <small class="text-muted">72% match</small>
                    </div>
                    <p class="mb-1 small text-muted">GLPI > Tutorials > Getting Started</p>
                </a>
                <a href="#" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">Quick Start Tutorial</h6>
                        <small class="text-muted">65% match</small>
                    </div>
                    <p class="mb-1 small text-muted">GLPI > Tutorials > Getting Started</p>
                </a>
            `;
        }
    });

    // Recent search buttons (demo only)
    document.querySelectorAll('#recentSearches .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const query = btn.textContent.trim().replace(/^[^\w]*/, '').trim(); // Remove icon and extra spaces
            searchInput.value = query;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
    });

    // Result item clicks (demo only)
    document.addEventListener('click', (e) => {
        const resultItem = e.target.closest('#searchResults .list-group-item');
        if (resultItem) {
            e.preventDefault();
            const title = resultItem.querySelector('h6').textContent;
            // Close modal and navigate
            const modal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
            if (modal) modal.hide();
            console.log(`Navigating to: ${title}`);
        }
    });
});

