// panel.js - Unified panel functionality with responsive improvements
document.addEventListener('DOMContentLoaded', function() {

    // Initialize all panel scrolling indicators
    const panelsWithScroll = document.querySelectorAll('.panel--list, .panel--scroll, .panel--preview');
    
    panelsWithScroll.forEach(panel => {
        const content = panel.querySelector('.panel__content');
        let scrollIndicator = panel.querySelector('.js-scroll-indicator');
        
        // Create scroll indicator if missing
        if (!scrollIndicator && content) {
            scrollIndicator = document.createElement('div');
            scrollIndicator.className = 'js-scroll-indicator';
            panel.appendChild(scrollIndicator);
        }
        
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
    
    // Initialize input panels
    const inputPanels = document.querySelectorAll('.panel--input');
    inputPanels.forEach(panel => {
        const inputs = panel.querySelectorAll('input, textarea');
        
        if (inputs.length === 0) return;
        
        // Add click handler to panel to focus the first input
        panel.addEventListener('click', function(e) {
            // Don't capture clicks on the inputs themselves
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Focus the first input/textarea
            const firstInput = panel.querySelector('input, textarea');
            if (firstInput) {
                firstInput.focus();
                
                // Set cursor position to the end
                if (firstInput.tagName === 'INPUT') {
                    firstInput.selectionStart = firstInput.selectionEnd = firstInput.value.length;
                }
            }
        });
        
        inputs.forEach(input => {
            // Auto-resize for textareas
            if (input.tagName === 'TEXTAREA') {
                // Initial adjustment
                autoResizeTextarea(input);
                
                // Add scroll indicator for scrollable input panels
                if (panel.classList.contains('panel--scroll')) {
                    const scrollIndicator = panel.querySelector('.js-scroll-indicator');
                    
                    if (scrollIndicator) {
                        // Initial setup
                        updateScrollIndicator(input, scrollIndicator);
                        
                        // Update on scroll
                        input.addEventListener('scroll', () => {
                            updateScrollIndicator(input, scrollIndicator);
                        });
                    }
                }
                
                // Auto-resize on input
                input.addEventListener('input', function() {
                    autoResizeTextarea(this);
                    
                    // Update scroll indicator if panel is scrollable
                    if (panel.classList.contains('panel--scroll')) {
                        const scrollIndicator = panel.querySelector('.js-scroll-indicator');
                        if (scrollIndicator) {
                            updateScrollIndicator(this, scrollIndicator);
                        }
                    }
                });
            }
            
            // Handle focus event
            input.addEventListener('focus', function() {
                // Remove active class from all input panels
                document.querySelectorAll('.panel--input--active').forEach(p => {
                    p.classList.remove('panel--input--active');
                });
                
                // Add active class to parent panel
                panel.classList.add('panel--input--active');
            });
            
            // Handle blur event
            input.addEventListener('blur', function() {
                // Only remove active class if no other inputs in this panel are focused
                const stillFocused = Array.from(panel.querySelectorAll('input, textarea'))
                    .some(el => el === document.activeElement);
                
                if (!stillFocused) {
                    panel.classList.remove('panel--input--active');
                }
            });
        });
    });
    
    // Function to auto-resize textarea
    function autoResizeTextarea(textarea) {
        // Reset height to auto to calculate actual content height
        textarea.style.height = 'auto';
        
        // Check if in a scrollable panel
        const isScrollable = textarea.closest('.panel--scroll') !== null;
        
        if (isScrollable) {
            // In scrollable mode, just make sure we're within our max-height
            const maxHeight = parseInt(getComputedStyle(textarea).maxHeight);
            if (textarea.scrollHeight > maxHeight) {
                textarea.style.height = maxHeight + 'px';
                textarea.style.overflow = 'auto';
            } else {
                textarea.style.height = textarea.scrollHeight + 'px';
                textarea.style.overflow = 'hidden';
            }
        } else {
            // For auto-growing, set height to scrollHeight
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    }
    
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
                console.log(previewUrl);
                if (!previewUrl) return;
                
                // Find the item title
                const titleElement = this.querySelector('.panel__list-title') || 
                                     this.querySelector('h4');
                
                let titleText = '';
                if (titleElement) {
                    titleText = titleElement.textContent.trim();
                } else {
                    // Fallback to using the link's text content (ignoring child elements)
                    titleText = this.childNodes[0].nodeValue || this.textContent.trim();
                }
                
                // Find the closest preview panel (first look in the same grid/container as this link)
                const container = this.closest('.grid-2col') || this.closest('.grid-master-stack') || document;
                let previewPanel = container.querySelector('.panel--preview');
                
                // If not found in the same container, try finding anywhere in the document
                if (!previewPanel) {
                    previewPanel = document.querySelector('.panel--preview');
                }
                
                if (previewPanel && titleText) {
                    const previewTitle = previewPanel.querySelector('.panel__title');
                    if (previewTitle) {
                        // console.log('Updating preview title to:', titleText);
                        previewTitle.textContent = titleText;
                    }
                }
                
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
            // Delay slightly to ensure any other initialization is complete
            setTimeout(() => {
                // Trigger a click on the first preview link to set initial active state and update title
                previewLinks[0].click();
            }, 50);
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
        
        // Handle tab clicks - adding direct click handlers to each tab
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
                
                // Remove any existing tab-generated headings from all content
                panel.querySelectorAll('.tab-generated-heading').forEach(heading => {
                    heading.remove();
                });
                
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
                    
                    // Add tab title as heading if in small screen mode
                    if (window.innerWidth < 768) {
                        const tabTitle = this.getAttribute('data-tab-title') || 
                                      this.textContent.trim();
                        
                        // Create a new heading element for the tab title
                        const tabHeading = document.createElement('h3');
                        tabHeading.className = 'tab-generated-heading';
                        tabHeading.textContent = tabTitle;
                        
                        // Insert at the beginning of the content
                        tabContent.insertBefore(tabHeading, tabContent.firstChild);
                    }
                }
            });
        });
    });
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
    // Force layout recalculation to ensure accurate measurements after icon changes
    panel.offsetHeight; // Trigger reflow
    
    // Get number of tabs
    const tabCount = panel.querySelectorAll('.panel__tab').length;
    if (tabCount <= 1) return;
    
    // Calculate required width (350px per tab to account for icon spacing)
    const requiredWidth = tabCount * 350;
    const panelWidth = panel.offsetWidth;
    const isSmallScreen = window.innerWidth < 768;
    
    // Remove any previously generated headings to start fresh
    panel.querySelectorAll('.tab-generated-heading').forEach(heading => {
        heading.remove();
    });
    
    if (panelWidth >= requiredWidth) {
        // WIDE MODE - Show as columns
        panel.classList.add('panel--wide-enough');
        
        // Hide the separator when in wide mode
        const separator = panel.querySelector('.panel__separator');
        if (separator) {
            separator.style.display = 'none';
        }
        
        // When switching to column mode, make sure all tab content is visible
        panel.querySelectorAll('.panel__tab-content').forEach(content => {
            content.classList.remove('panel__tab-content--active');
            content.style.display = 'block';
            
            // Get the corresponding tab title
            const tabId = content.id;
            const correspondingTab = panel.querySelector(`[data-tab-id="${tabId}"]`);
            
            if (correspondingTab) {
                const tabTitle = correspondingTab.getAttribute('data-tab-title') || 
                                correspondingTab.textContent.trim();
                
                // Create a new heading element for the tab title
                const tabHeading = document.createElement('h3');
                tabHeading.className = 'tab-generated-heading';
                tabHeading.textContent = tabTitle;
                
                // Insert at the beginning of the content
                content.insertBefore(tabHeading, content.firstChild);
            }
        });
    } else {
        // NARROW MODE - Show as tabs
        panel.classList.remove('panel--wide-enough');
        
        // Show the separator when in tab mode
        const separator = panel.querySelector('.panel__separator');
        if (separator) {
            separator.style.display = '';
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
                
                // If small screen, add the heading to the active content
                if (isSmallScreen) {
                    const tabTitle = activeTab.getAttribute('data-tab-title') || 
                                    activeTab.textContent.trim();
                    
                    // Create a new heading element for the tab title
                    const tabHeading = document.createElement('h3');
                    tabHeading.className = 'tab-generated-heading';
                    tabHeading.textContent = tabTitle;
                    
                    // Insert at the beginning of the content
                    activeContent.insertBefore(tabHeading, activeContent.firstChild);
                }
            }
        } else {
            // If no active tab, activate the first one
            const firstTab = panel.querySelector('.panel__tab');
            const firstContent = panel.querySelector('.panel__tab-content');
            if (firstTab && firstContent) {
                firstTab.classList.add('panel__tab--active');
                firstContent.classList.add('panel__tab-content--active');
                firstContent.style.display = 'block';
                
                // If small screen, add the heading to the first content
                if (isSmallScreen) {
                    const tabTitle = firstTab.getAttribute('data-tab-title') || 
                                    firstTab.textContent.trim();
                    
                    // Create a new heading element for the tab title
                    const tabHeading = document.createElement('h3');
                    tabHeading.className = 'tab-generated-heading';
                    tabHeading.textContent = tabTitle;
                    
                    // Insert at the beginning of the content
                    firstContent.insertBefore(tabHeading, firstContent.firstChild);
                }
            }
        }
        
        // Handle responsive tab display (numbers vs text)
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
            
            // Remove any existing tab-generated headings
            panelElement.querySelectorAll('.tab-generated-heading').forEach(heading => {
                heading.remove();
            });
            
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
                
                // If small screen, add the heading to the active content
                if (window.innerWidth < 768) {
                    const tabTitle = this.getAttribute('data-tab-title') || 
                                   this.textContent.trim();
                    
                    // Create a new heading element for the tab title
                    const tabHeading = document.createElement('h3');
                    tabHeading.className = 'tab-generated-heading';
                    tabHeading.textContent = tabTitle;
                    
                    // Insert at the beginning of the content
                    tabContent.insertBefore(tabHeading, tabContent.firstChild);
                }
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
    // Force layout recalculation to ensure accurate measurements after icon changes
    content.offsetHeight; // Trigger reflow
    
    const contentHeight = content.scrollHeight;
    const visibleHeight = content.clientHeight;
    const scrollTop = content.scrollTop;
    
    // Get the panel's border radius from CSS
    const borderRadius = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--panel-border-radius')) || 6; // Default to 6px if not set
    
    // Use the border radius as a guide for the top/bottom padding
    const edgePadding = borderRadius;
    
    // Adjust the visible height to account for the padding
    const adjustedVisibleHeight = visibleHeight - (edgePadding * 2);
    
    // Calculate indicator height and position
    const scrollRatio = visibleHeight / contentHeight;
    const indicatorHeight = Math.max(30, adjustedVisibleHeight * scrollRatio); // Min height of 30px
    
    // Calculate position with padding taken into account
    let indicatorPosition = (scrollTop / (contentHeight - visibleHeight)) * 
                          (adjustedVisibleHeight - indicatorHeight);
    
    // Add the edge padding to the position
    indicatorPosition += edgePadding;
    
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
