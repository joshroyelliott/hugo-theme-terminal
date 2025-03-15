// panel.js - Unified panel functionality with responsive improvements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all panel scrolling indicators
    const panelsWithScroll = document.querySelectorAll('.panel--list, .panel--scroll');
    
    panelsWithScroll.forEach(panel => {
        const content = panel.querySelector('.panel__content');
        const scrollIndicator = panel.querySelector('.js-scroll-indicator');
        
        if (!content || !scrollIndicator) return;
        
        // Initial setup
        updateScrollIndicator(content, scrollIndicator);
        
        // Update on scroll
        content.addEventListener('scroll', () => {
            updateScrollIndicator(content, scrollIndicator);
        });
        
        // Add resize listener
        window.addEventListener('resize', () => {
            updateScrollIndicator(content, scrollIndicator);
        });
    });
    
    // Initialize all grid layouts
    setupGridLayouts();
    
    // Initialize list panel counters
    initializeListPanelCounters();
    
    // Handle list panel item selection
    const listItems = document.querySelectorAll('.panel__list-link');
    
    if (listItems.length > 0) {
        listItems.forEach((item, index) => {
            // Add data-item-index attribute to each list item for counter tracking
            item.setAttribute('data-item-index', index + 1);
            
            item.addEventListener('click', function(e) {
                // If this is a regular link that should navigate, don't prevent default
                if (!this.classList.contains('js-preview-link')) {
                    return;
                }
                
                e.preventDefault();
                
                // Remove active class from all items
                listItems.forEach(i => i.classList.remove('panel__list-link--active'));
                
                // Add active class to clicked item
                this.classList.add('panel__list-link--active');
                
                // Update the list panel counter with current selection
                const listPanel = this.closest('.panel--list');
                if (listPanel) {
                    const itemNumber = parseInt(this.getAttribute('data-item-index')) || 1;
                    const totalItems = listPanel.querySelectorAll('.panel__list-item').length;
                    listPanel.setAttribute('data-count', `${itemNumber} of ${totalItems}`);
                }
                
                // Handle preview content if it's a preview link
                const previewUrl = this.getAttribute('data-preview-url');
                if (!previewUrl) return;
                
                // For in-page previews
                if (previewUrl.startsWith('#')) {
                    const previewId = previewUrl.substring(1);
                    const previewElement = document.getElementById(previewId);
                    const previewContent = document.querySelector('.js-preview-content');
                    
                    if (previewContent) {
                        // Hide all preview content first
                        document.querySelectorAll('.js-preview-content > div[id^="preview-"]').forEach(el => {
                            el.style.display = 'none';
                        });
                        
                        // Show selected preview
                        if (previewElement) {
                            previewElement.style.display = 'block';
                        }
                    }
                }
            });
        });
        
        // Set the first item as active by default if there are preview links
        const previewLinks = document.querySelectorAll('.js-preview-link');
        if (previewLinks.length > 0) {
            previewLinks[0].click();
        }
    }

    // Add numerical indices to tabs for responsive design
    document.querySelectorAll('.panel__tab').forEach(function(tab, index) {
        // Set data attribute if not already set in HTML
        if (!tab.hasAttribute('data-tab-num')) {
            tab.setAttribute('data-tab-num', index + 1);
        }
    });

    // Process all tab panels for headings and responsive layouts
    const tabPanels = document.querySelectorAll('.panel--tab');
    
    tabPanels.forEach(panel => {
        // Set up tab content headings
        setupTabContentHeadings(panel);
        
        const tabs = panel.querySelectorAll('.panel__tab');
        
        if (tabs.length === 0) return;
        
        // Check if panel is wide enough for side-by-side layout
        if (panel.classList.contains('js-check-width')) {
            checkPanelWidth(panel);
            window.addEventListener('resize', () => {
                checkPanelWidth(panel);
            });
        }
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Skip if wide layout is active
                if (panel.classList.contains('panel--wide-enough')) {
                    return;
                }
                
                // Get the tab ID
                const tabId = this.getAttribute('data-tab-id');
                if (!tabId) return;
                
                // Remove active class from all tabs in this panel
                panel.querySelectorAll('.panel__tab').forEach(t => {
                    t.classList.remove('panel__tab--active');
                });
                
                // Add active class to clicked tab
                this.classList.add('panel__tab--active');
                
                // Hide all tab content in this panel
                panel.querySelectorAll('.panel__tab-content').forEach(content => {
                    content.classList.remove('panel__tab-content--active');
                    content.style.display = 'none';
                });
                
                // Show the selected tab content
                const tabContent = panel.querySelector(`#${tabId}`);
                if (tabContent) {
                    tabContent.classList.add('panel__tab-content--active');
                    tabContent.style.display = 'block';
                }
            });
        });
    });
    
    // Check if we need to apply responsive layout to the showcase grid
    setupInteractivePanels();
});

// Function to handle tab content headings
function setupTabContentHeadings(panel) {
    // Process all tab content sections to detect headings and set up generated ones
    panel.querySelectorAll('.panel__tab-content').forEach(content => {
        // Make sure each content area has the tab title stored as data attribute
        if (!content.hasAttribute('data-tab-title')) {
            const tabId = content.id;
            const correspondingTab = panel.querySelector(`[data-tab-id="${tabId}"]`);
            if (correspondingTab) {
                content.setAttribute('data-tab-title', correspondingTab.textContent.trim());
            }
        }
        
        // Check if there's an h3 first child
        const firstHeading = content.querySelector('h3:first-child');
        if (firstHeading) {
            // Add a class to indicate this content has a heading
            content.classList.add('has-heading');
            // Apply special styling to the existing heading if needed
            firstHeading.classList.add('replace-generated-heading');
        }
    });
}

// Function to check if panel is wide enough for side-by-side layout
function checkPanelWidth(panel) {
    // Get number of tabs
    const tabCount = panel.querySelectorAll('.panel__tab').length;
    if (tabCount <= 1) return;
    
    // Calculate required width (300px per tab is a good estimate)
    const requiredWidth = tabCount * 300;
    const panelWidth = panel.offsetWidth;
    
    if (panelWidth >= requiredWidth) {
        panel.classList.add('panel--wide-enough');
        
        // When switching to column mode, make sure all tab content is visible
        panel.querySelectorAll('.panel__tab-content').forEach(content => {
            content.classList.remove('panel__tab-content--active');
            content.style.display = 'block';
        });
        
        // Hide the separator when in column mode - no need for it
        const mainSeparator = panel.querySelector('.panel__separator:nth-child(4)'); // The separator after panel title
        if (mainSeparator) {
            mainSeparator.style.display = 'none';
        }
    } else {
        panel.classList.remove('panel--wide-enough');
        
        // Show the separator when in tab mode
        const mainSeparator = panel.querySelector('.panel__separator:nth-child(4)');
        if (mainSeparator) {
            mainSeparator.style.display = '';
        }
        
        // When switching back to tab mode, only show the active tab
        const activeTab = panel.querySelector('.panel__tab--active');
        panel.querySelectorAll('.panel__tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        if (activeTab) {
            const activeTabId = activeTab.getAttribute('data-tab-id');
            const activeContent = panel.querySelector(`#${activeTabId}`);
            if (activeContent) {
                activeContent.classList.add('panel__tab-content--active');
                activeContent.style.display = 'block';
            }
        } else {
            // If no active tab, activate the first one
            const firstTab = panel.querySelector('.panel__tab');
            const firstContent = panel.querySelector('.panel__tab-content');
            if (firstTab && firstContent) {
                firstTab.classList.add('panel__tab--active');
                firstContent.classList.add('panel__tab-content--active');
                firstContent.style.display = 'block';
            }
        }
        
        // Handle responsive tab display (numbers vs text)
        const isSmallScreen = window.innerWidth < 768;
        const tabs = panel.querySelectorAll('.panel__tab');
        
        if (isSmallScreen) {
            tabs.forEach(tab => {
                // Hide the text content by setting font-size to 0
                tab.style.fontSize = '0';
                // Ensure all tabs have appropriate background
                tab.style.background = getComputedStyle(document.documentElement)
                    .getPropertyValue('--base00');
            });
        } else {
            tabs.forEach(tab => {
                // Restore normal font size
                tab.style.fontSize = '';
                // Ensure all tabs have appropriate background
                tab.style.background = getComputedStyle(document.documentElement)
                    .getPropertyValue('--base00');
            });
        }
    }
}

// Setup function for interactive panels layout
function setupInteractivePanels() {
    // No need to add the interactive-panels class anymore as we're using dedicated grid classes
    // But we'll keep this function to maintain backward compatibility
    const showcaseGrids = document.querySelectorAll('.panels-showcase-grid:not(.interactive-panels)');
    showcaseGrids.forEach(grid => {
        const tabPanel = grid.querySelector('.panel--tab');
        const scrollPanel = grid.querySelector('.panel--scroll:not(.panel--list)');
        const listPanel = grid.querySelector('.panel--list');
        const previewPanel = grid.querySelector('.panel--preview');
        
        // If we have the interactive panel layout components, apply the interactive-panels class
        if (tabPanel && (scrollPanel || (listPanel && previewPanel))) {
            grid.classList.add('interactive-panels');
        }
    });
    
    // Setup all grid layouts for responsive behavior
    setupGridLayouts();
}

// Function to initialize tab panels based on markdown headings
// This can be called after markdown content is loaded
window.initMarkdownTabPanels = function(panelElement, mainTitle = null) {
    if (!panelElement) return;
    
    // Get all h2 or h3 headings within the panel
    const headings = panelElement.querySelectorAll('h2, h3');
    if (headings.length === 0) return;
    
    // Add panel--tab class to the panel
    panelElement.classList.add('panel--tab');
    panelElement.classList.add('js-tab-panel');
    panelElement.classList.add('js-check-width');
    
    // Create header element
    const headerElement = document.createElement('div');
    headerElement.className = 'panel__header';
    
    // Add main title if provided
    if (mainTitle) {
        const titleElement = document.createElement('span');
        titleElement.className = 'panel__main-title';
        titleElement.textContent = mainTitle;
        headerElement.appendChild(titleElement);
        
        // Use standard separator instead of main-separator
        const separatorElement = document.createElement('span');
        separatorElement.className = 'panel__separator';
        headerElement.appendChild(separatorElement);
    }
    
    // Create tabs container within the header
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'panel__tabs';
    
    // Create tab contents container
    const contentsContainer = document.createElement('div');
    contentsContainer.className = 'panel__tab-contents';
    
    // Process each heading to create tabs
    headings.forEach((heading, index) => {
        // Add separator between tabs (except for first tab)
        if (index > 0) {
            const separatorElement = document.createElement('span');
            separatorElement.className = 'panel__tab-separator';
            separatorElement.textContent = '-';
            tabsContainer.appendChild(separatorElement);
        }
        
        // Create tab element
        const tab = document.createElement('span');
        tab.className = index === 0 ? 'panel__tab panel__tab--active' : 'panel__tab';
        tab.setAttribute('data-tab-id', `markdown-tab-${index}`);
        tab.setAttribute('data-tab-num', index + 1);
        tab.setAttribute('data-tab-title', heading.textContent.trim());
        tab.textContent = heading.textContent;
        tabsContainer.appendChild(tab);
        
        // Get content for this tab (everything until next heading or end)
        let content = document.createElement('div');
        content.className = index === 0 ? 'panel__tab-content panel__tab-content--active' : 'panel__tab-content';
        content.id = `markdown-tab-${index}`;
        content.setAttribute('data-tab-title', heading.textContent.trim());
        
        // If this content has a heading, mark it
        content.classList.add('has-heading');
        
        // Collect all elements after this heading until the next heading
        let currentNode = heading.nextElementSibling;
        while (currentNode && !['H2', 'H3'].includes(currentNode.tagName)) {
            const cloneNode = currentNode.cloneNode(true);
            content.appendChild(cloneNode);
            
            // Store reference to the next node before potentially removing this one
            const nextNode = currentNode.nextElementSibling;
            currentNode.remove(); // Remove from original location
            currentNode = nextNode;
        }
        
        // Add the heading to the content
        const headingClone = heading.cloneNode(true);
        headingClone.classList.add('replace-generated-heading');
        content.insertBefore(headingClone, content.firstChild);
        heading.remove(); // Remove original heading
        
        // Add content to contents container
        contentsContainer.appendChild(content);
        
        // Add click handler for the tab
        tab.addEventListener('click', function() {
            // Skip if wide layout is active
            if (panelElement.classList.contains('panel--wide-enough')) {
                return;
            }
            
            // Remove active class from all tabs
            tabsContainer.querySelectorAll('.panel__tab').forEach(t => {
                t.classList.remove('panel__tab--active');
            });
            
            // Add active class to clicked tab
            this.classList.add('panel__tab--active');
            
            // Hide all tab content
            contentsContainer.querySelectorAll('.panel__tab-content').forEach(c => {
                c.classList.remove('panel__tab-content--active');
                c.style.display = 'none';
            });
            
            // Show the selected tab content
            const tabContent = document.getElementById(this.getAttribute('data-tab-id'));
            if (tabContent) {
                tabContent.classList.add('panel__tab-content--active');
                tabContent.style.display = 'block';
            }
        });
    });
    
    // Add tabs to header
    headerElement.appendChild(tabsContainer);
    
    // Insert panel structure
    panelElement.innerHTML = ''; // Clear existing content
    panelElement.appendChild(headerElement);
    panelElement.appendChild(contentsContainer);
    
    // Check if panel is wide enough for side-by-side layout
    checkPanelWidth(panelElement);
    window.addEventListener('resize', () => {
        checkPanelWidth(panelElement);
    });
};

// Function to update scroll indicator position and size
function updateScrollIndicator(content, indicator) {
    const contentHeight = content.scrollHeight;
    const visibleHeight = content.clientHeight;
    const scrollTop = content.scrollTop;
    
    // Calculate indicator height and position
    const scrollRatio = visibleHeight / contentHeight;
    const indicatorHeight = Math.max(30, visibleHeight * scrollRatio); // Min height of 30px
    const indicatorPosition = (scrollTop / (contentHeight - visibleHeight)) * 
                             (visibleHeight - indicatorHeight);
    
    // Only show indicator if content is scrollable
    if (contentHeight > visibleHeight) {
        indicator.style.display = 'block';
        indicator.style.height = `${indicatorHeight}px`;
        indicator.style.top = `${indicatorPosition}px`;
    } else {
        indicator.style.display = 'none';
    }
}

// Setup all grid layouts - provides additional functionality for special grid layouts
function setupGridLayouts() {
    // Master-stack layout - allow collapsing of stack items
    const masterStackGrids = document.querySelectorAll('.grid-master-stack');
    masterStackGrids.forEach(grid => {
        // Setup master panel to be able to expand to full width on click
        const masterPanel = grid.querySelector('.panel:first-child');
        if (masterPanel) {
            masterPanel.addEventListener('dblclick', function(e) {
                // Prevent if clicking on interactive elements
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || 
                    e.target.closest('a') || e.target.closest('button')) {
                    return;
                }
                
                // Toggle full-width class
                grid.classList.toggle('master-expanded');
                
                if (grid.classList.contains('master-expanded')) {
                    // Expand master panel
                    masterPanel.style.gridColumn = 'span 2';
                    // Hide stack temporarily
                    const stack = grid.querySelector('.stack');
                    if (stack) stack.style.display = 'none';
                } else {
                    // Restore original layout
                    masterPanel.style.gridColumn = '';
                    const stack = grid.querySelector('.stack');
                    if (stack) stack.style.display = '';
                }
            });
        }
    });
    
    // Grid-thirds layout - add ability to expand panels to full width temporarily
    const gridThirds = document.querySelectorAll('.grid-thirds .panel');
    gridThirds.forEach(panel => {
        panel.addEventListener('dblclick', function(e) {
            // Prevent if clicking on interactive elements
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || 
                e.target.closest('a') || e.target.closest('button')) {
                return;
            }
            
            // Store original span
            const originalSpan = panel.getAttribute('data-original-span') || 
                                (panel.classList.contains('span-2') ? 'span-2' : 
                                 panel.classList.contains('span-3') ? 'span-3' : '');
            
            if (panel.classList.contains('panel-expanded')) {
                // Restore original size
                panel.classList.remove('panel-expanded');
                panel.classList.remove('span-3');
                
                // Restore original span class if it had one
                if (originalSpan) {
                    panel.classList.add(originalSpan);
                }
                
                // Show other panels
                const grid = panel.closest('.grid-thirds');
                if (grid) {
                    const otherPanels = grid.querySelectorAll('.panel:not(.panel-expanded)');
                    otherPanels.forEach(p => p.style.display = '');
                }
            } else {
                // Store original span for later restoration
                panel.setAttribute('data-original-span', originalSpan);
                
                // Make this panel full width
                panel.classList.add('panel-expanded');
                panel.classList.remove('span-2');
                panel.classList.remove('span-3');
                panel.classList.add('span-3'); // Span all columns
                
                // Hide other panels
                const grid = panel.closest('.grid-thirds');
                if (grid) {
                    const otherPanels = grid.querySelectorAll('.panel:not(.panel-expanded)');
                    otherPanels.forEach(p => p.style.display = 'none');
                }
            }
        });
    });
}

// Initialize dynamic counters for all list panels
function initializeListPanelCounters() {
    // Get all list panels
    const listPanels = document.querySelectorAll('.panel--list');
    
    listPanels.forEach(panel => {
        // Count the total number of items in this list
        const totalItems = panel.querySelectorAll('.panel__list-item').length;
        
        if (totalItems === 0) return; // Skip empty lists
        
        // Set the initial counter to show "1 of X" (or keep existing if set)
        if (!panel.hasAttribute('data-count')) {
            panel.setAttribute('data-count', `1 of ${totalItems}`);
        } else {
            // If it has a data-count attribute already but it's static (like "1 of 10"),
            // update it with the actual count
            const currentCount = panel.getAttribute('data-count');
            if (currentCount.match(/\d+ of \d+/)) {
                // Extract the current selected item number
                const currentItemMatch = currentCount.match(/(\d+) of \d+/);
                const currentItem = currentItemMatch ? parseInt(currentItemMatch[1]) : 1;
                
                // Make sure currentItem is valid (not greater than totalItems)
                const validItem = Math.min(currentItem, totalItems);
                
                // Update with actual total
                panel.setAttribute('data-count', `${validItem} of ${totalItems}`);
            }
        }
        
        // Set initial active state on first item if a js-preview-link and none is active
        const listItems = panel.querySelectorAll('.panel__list-link');
        const activeItem = panel.querySelector('.panel__list-link--active');
        
        if (!activeItem && listItems.length > 0) {
            // Find the first preview link if available
            const firstPreviewLink = panel.querySelector('.js-preview-link');
            if (firstPreviewLink) {
                firstPreviewLink.classList.add('panel__list-link--active');
            } else {
                // Otherwise just activate the first list item
                listItems[0].classList.add('panel__list-link--active');
            }
        }
    });
}
