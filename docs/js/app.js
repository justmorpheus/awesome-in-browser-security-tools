/**
 * Awesome In-Browser Security Tools
 * Client-side search, filter, and sort functionality
 * Categories and tools are loaded from tools-data.js (generated from tools.json)
 */

(function() {
    'use strict';

    // State - loaded from window.TOOLS_DATA (generated from tools.json)
    let tools = [];
    let categories = {};
    let filteredTools = [];
    let activeKeyword = null;

    // DOM Elements
    const searchInput = document.getElementById('search');
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    const toolsBody = document.getElementById('tools-body');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');
    const themeToggle = document.getElementById('theme-toggle');
    const activeFilterContainer = document.getElementById('active-filter');

    // Initialize
    function init() {
        initTheme();
        loadTools();
        populateCategoryFilter();
        bindEvents();
        renderTools();
    }

    // Theme management
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // Load tools from embedded data (window.TOOLS_DATA)
    function loadTools() {
        if (window.TOOLS_DATA) {
            tools = window.TOOLS_DATA.tools || [];
            categories = window.TOOLS_DATA.categories || {};
            // Sort by name by default
            tools.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
            filteredTools = [...tools];
        } else {
            console.error('TOOLS_DATA not found. Ensure tools-data.js is loaded.');
            resultsCount.textContent = 'Error: Tools data not loaded';
        }
    }

    // Populate category filter dropdown from data
    function populateCategoryFilter() {
        // Get categories sorted by order
        const sortedCategories = Object.entries(categories)
            .sort((a, b) => (a[1].order || 999) - (b[1].order || 999));
        
        // Add options to select
        sortedCategories.forEach(([catId, catData]) => {
            const option = document.createElement('option');
            option.value = catId;
            option.textContent = catData.name;
            categoryFilter.appendChild(option);
        });
    }

    // Bind event listeners
    function bindEvents() {
        searchInput.addEventListener('input', debounce(handleSearch, 200));
        categoryFilter.addEventListener('change', handleFilter);
        sortBy.addEventListener('change', handleSort);
        themeToggle.addEventListener('click', toggleTheme);
        
        // Event delegation for keyword clicks
        toolsBody.addEventListener('click', handleKeywordClick);
        
        // Clear filter button
        if (activeFilterContainer) {
            activeFilterContainer.addEventListener('click', handleClearFilter);
        }
    }

    // Handle keyword click
    function handleKeywordClick(e) {
        const keywordTag = e.target.closest('.keyword-tag');
        if (keywordTag) {
            const keyword = keywordTag.dataset.keyword;
            if (keyword) {
                activeKeyword = keyword;
                applyFilters();
                updateActiveFilterDisplay();
            }
        }
    }

    // Handle clear filter
    function handleClearFilter(e) {
        if (e.target.closest('.clear-filter-btn')) {
            activeKeyword = null;
            applyFilters();
            updateActiveFilterDisplay();
        }
    }

    // Update active filter display
    function updateActiveFilterDisplay() {
        if (!activeFilterContainer) return;
        
        if (activeKeyword) {
            activeFilterContainer.innerHTML = `
                <span class="active-filter-label">Filtered by keyword:</span>
                <span class="active-filter-value">${escapeHtml(activeKeyword)}</span>
                <button class="clear-filter-btn" title="Clear filter">✕</button>
            `;
            activeFilterContainer.hidden = false;
        } else {
            activeFilterContainer.innerHTML = '';
            activeFilterContainer.hidden = true;
        }
    }

    // Debounce utility
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Handle search
    function handleSearch() {
        applyFilters();
    }

    // Handle category filter
    function handleFilter() {
        applyFilters();
    }

    // Handle sort
    function handleSort() {
        applyFilters();
    }

    // Apply all filters and sort
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const category = categoryFilter.value;
        const sortField = sortBy.value;

        // Filter
        filteredTools = tools.filter(tool => {
            // Category filter
            if (category && tool.category !== category) {
                return false;
            }

            // Keyword filter
            if (activeKeyword) {
                const hasKeyword = tool.keywords.some(
                    kw => kw.toLowerCase() === activeKeyword.toLowerCase()
                );
                if (!hasKeyword) {
                    return false;
                }
            }

            // Search filter
            if (searchTerm) {
                const searchableText = [
                    tool.name,
                    tool.author,
                    tool.description,
                    ...tool.keywords
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });

        // Sort
        filteredTools.sort((a, b) => {
            let valueA, valueB;
            
            switch (sortField) {
                case 'name':
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                case 'author':
                    valueA = a.author.toLowerCase();
                    valueB = b.author.toLowerCase();
                    break;
                case 'category':
                    // Sort by category order, then by name
                    const orderA = categories[a.category]?.order || 999;
                    const orderB = categories[b.category]?.order || 999;
                    if (orderA !== orderB) return orderA - orderB;
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                default:
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
            }

            if (valueA < valueB) return -1;
            if (valueA > valueB) return 1;
            return 0;
        });

        renderTools();
    }

    // Render tools table
    function renderTools() {
        // Update results count
        const total = tools.length;
        const showing = filteredTools.length;
        resultsCount.textContent = showing === total 
            ? `Showing ${total} tools`
            : `Showing ${showing} of ${total} tools`;

        // Show/hide no results message
        if (filteredTools.length === 0) {
            noResults.hidden = false;
            toolsBody.innerHTML = '';
            return;
        }
        
        noResults.hidden = true;

        // Render table rows
        toolsBody.innerHTML = filteredTools.map(tool => createToolRow(tool)).join('');
    }

    // Create table row for a tool
    function createToolRow(tool) {
        const keywordTags = tool.keywords
            .map(kw => {
                const isActive = activeKeyword && kw.toLowerCase() === activeKeyword.toLowerCase();
                const activeClass = isActive ? ' keyword-tag-active' : '';
                return `<span class="keyword-tag${activeClass}" data-keyword="${escapeHtml(kw)}" title="Click to filter by this keyword">${escapeHtml(kw)}</span>`;
            })
            .join('');

        // Extract repo path for badgen (e.g., "cyfinoid/sbomplay" from full URL)
        const repoPath = tool.repo.replace('https://github.com/', '');
        const lastUpdateBadge = `<img src="https://badgen.net/github/last-commit/${repoPath}" alt="Last commit" class="badge-img" loading="lazy">`;

        // Extract author's GitHub profile from repo URL
        const repoOwner = repoPath.split('/')[0];
        const authorProfileUrl = `https://github.com/${repoOwner}`;

        // Donations links (if available)
        let donationsLink = '';
        if (tool.donations) {
            const links = [];
            if (typeof tool.donations === 'string') {
                // Legacy: single URL string
                links.push(`<a href="${escapeHtml(tool.donations)}" target="_blank" rel="noopener" class="author-sponsor-btn author-sponsor-gh"><svg height="12" viewBox="0 0 16 16" width="12" aria-hidden="true"><path fill="#db61a2" d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z"></path></svg> Sponsor</a>`);
            } else {
                // New format: object with github_sponsors and/or buy_me_a_coffee
                if (tool.donations.github_sponsors) {
                    links.push(`<a href="${escapeHtml(tool.donations.github_sponsors)}" target="_blank" rel="noopener" title="Sponsor on GitHub" class="author-sponsor-btn author-sponsor-gh"><svg height="12" viewBox="0 0 16 16" width="12" aria-hidden="true"><path fill="#db61a2" d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z"></path></svg> Sponsor</a>`);
                }
                if (tool.donations.buy_me_a_coffee) {
                    links.push(`<a href="${escapeHtml(tool.donations.buy_me_a_coffee)}" target="_blank" rel="noopener" title="Buy Me a Coffee" class="author-sponsor-btn author-sponsor-bmc"><svg height="12" viewBox="0 0 24 24" width="12" fill="currentColor" aria-hidden="true"><path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364z"></path></svg> Buy me a coffee</a>`);
                }
            }
            if (links.length > 0) {
                donationsLink = `<div class="author-sponsor">${links.join('')}</div>`;
            }
        }

        return `
            <tr>
                <td data-label="Name" class="tool-name-cell">
                    <div class="tool-name"><a href="${escapeHtml(tool.repo)}" target="_blank" rel="noopener">${escapeHtml(tool.name)}</a></div>
                    <div class="tool-description">${escapeHtml(tool.description)}</div>
                    <div class="tool-demo"><a href="${escapeHtml(tool.demo)}" target="_blank" rel="noopener">Live Demo</a></div>
                </td>
                <td data-label="Author">
                    <a href="${authorProfileUrl}" target="_blank" rel="noopener">${escapeHtml(tool.author)}</a>
                    ${donationsLink}
                </td>
                <td data-label="Keywords">
                    <div class="keywords">${keywordTags}</div>
                </td>
                <td data-label="License">${escapeHtml(tool.license || 'Unknown')}</td>
                <td data-label="Last Update">${lastUpdateBadge}</td>
            </tr>
        `;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Start the app
    document.addEventListener('DOMContentLoaded', init);
})();
