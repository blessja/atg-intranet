// All possible table columns configuration
const allColumns = [
  { key: 'checkbox', label: '', visible: true, sortable: false, required: true },
  { key: 'client_name', label: 'Lead/Client Name', visible: true, sortable: false },
  { key: 'origin', label: 'Origin', visible: true, sortable: false },
  { key: 'workflow_status', label: 'Work flow status', visible: true, sortable: false },
  { key: 'lead_notes_count', label: 'Lead note count', visible: true, sortable: false },
  { key: 'company_name', label: 'Company name', visible: true, sortable: false },
  { key: 'email', label: 'Email', visible: true, sortable: false },
  { key: 'phone', label: 'Phone No\'s', visible: true, sortable: false },
  { key: 'assigned_to', label: 'Assigned To', visible: true, sortable: false },
  { key: 'created_at', label: 'Created At', visible: true, sortable: true, sortKey: 'created_at' },
  { key: 'last_updated_note', label: 'Last Update note', visible: true, sortable: true, sortKey: 'last_updated_note' },
  { key: 'next_follow_up', label: 'Next Follow-update', visible: true, sortable: true, sortKey: 'next_follow_up_date' }
];

// Date headers and their corresponding sorting keys
const dateHeaders = [
  {id: 'created-at-header', sortKey: 'created_at'},
  {id: 'last-updated-note-header', sortKey: 'last_updated_note'},
  {id: 'next-follow-up-header', sortKey: 'next_follow_up_date'}
];
let isLoading = false;
let currentSortBy = '-created_at';
let currentSortHeader = 'created-at-header';
let allFetchedLeads = []; // Store all fetched data for client-side sorting
// Add these with your existing global variables (around line where you have globalAssigneeUserOption)
let globalTagsOption = [];
let isTagsFilterPopulated = false;
let filterCache = {
    assignees: null,
    tags: null,
    lastUpdated: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function isCacheValid() {
    return filterCache.lastUpdated && 
           (Date.now() - filterCache.lastUpdated < CACHE_DURATION);
}

// Column management functions
function getColumnConfig() {
  const saved = localStorage.getItem('lmsTableColumns');
  let config;
  
  if (saved) {
    try {
      config = JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing saved column config, using defaults:', e);
      config = allColumns.slice();
      saveColumnConfig(config); // Save the defaults
    }
  } else {
    config = allColumns.slice(); // Return a copy
    saveColumnConfig(config); // Save the defaults to localStorage
  }
  
  return config;
}

function saveColumnConfig(config) {
  localStorage.setItem('lmsTableColumns', JSON.stringify(config));
}

function getVisibleColumns() {
  return getColumnConfig().filter(col => col.visible);
}

// Client-side sorting function
function clientSideSort(data, sortField, descending = true) {
    return [...data].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        
        // Handle null/undefined values
        if (!valA && !valB) return 0;
        if (!valA) return descending ? 1 : -1;
        if (!valB) return descending ? -1 : 1;
        
        // Convert to Date if it looks like a date field
        if (sortField.includes('_at') || sortField.includes('date') || sortField.includes('follow_up')) {
            valA = new Date(valA);
            valB = new Date(valB);
            
            // Handle invalid dates
            if (isNaN(valA)) valA = new Date(0);
            if (isNaN(valB)) valB = new Date(0);
        }
        
        // Sort comparison
        if (valA < valB) return descending ? 1 : -1;
        if (valA > valB) return descending ? -1 : 1;
        return 0;
    });
}

// Inline error banner helpers for lead fetch failures
function showLeadsError(msg) {
    let el = document.getElementById('lms-error-banner');
    if (!el) {
        el = document.createElement('div');
        el.id = 'lms-error-banner';
        el.style.cssText = 'background:#fdecea;color:#611a15;padding:8px;border:1px solid #f5c6cb;margin:10px;border-radius:4px;';
        const container = document.querySelector('.lms-main-dashboard') || document.body;
        container.insertBefore(el, container.firstChild);
    }
    el.textContent = 'Error loading leads: ' + msg;
}

function clearLeadsError() {
    const el = document.getElementById('lms-error-banner');
    if (el) el.remove();
}

// Update the URL with sort parameter
function updateUrlSortParam(sortBy) {
    const url = new URL(window.location);
    url.searchParams.set('sort_by', sortBy);
    window.history.replaceState({}, '', url);
}

// Set active arrow state
function setArrowActive(headerId, direction) {
    const header = document.getElementById(headerId);
    if (!header) return;
    
    const downArrow = header.querySelector('.down-arrow');
    const upArrow = header.querySelector('.up-arrow');
    
    // Clear both arrows first
    if (downArrow) downArrow.classList.remove('active');
    if (upArrow) upArrow.classList.remove('active');
    
    // Set the correct one
    if (direction === 'desc' && downArrow) {
        downArrow.classList.add('active');
    } else if (direction === 'asc' && upArrow) {
        upArrow.classList.add('active');
    }
}

// Clear all active arrows
function clearAllArrowActive() {
    dateHeaders.forEach(({id}) => {
        const header = document.getElementById(id);
        if (!header) return;
        
        const downArrow = header.querySelector('.down-arrow');
        const upArrow = header.querySelector('.up-arrow');
        
        if (downArrow) downArrow.classList.remove('active');
        if (upArrow) upArrow.classList.remove('active');
    });
}

// Handle header click to toggle sort
function onHeaderClick(sortKey, headerId) {
    let direction = 'desc'; // default to descending
    
    // If clicking on the same header, toggle direction
    if (currentSortHeader === headerId) {
        const isCurrentlyDesc = currentSortBy.startsWith('-');
        direction = isCurrentlyDesc ? 'asc' : 'desc';
    } else {
        // If clicking on a different header, start with descending
        direction = 'desc';
    }
    
    currentSortBy = (direction === 'desc' ? '-' : '') + sortKey;
    currentSortHeader = headerId;
    filters.sort_by = currentSortBy;
    //  const mapSortKey = {
    //             'created-at-header':'created_at' ,
    //             'updated-at-header':'updated_at', 
    //             'last-updated-note-header':'last_updated_note',
    //             'next-follow-up-header':'next_follow_up',
    //         };
    // Update URL parameter
    updateUrlSortParam(currentSortBy);
    
    // Update arrow visual state
        setTimeout(() => {
        clearAllArrowActive();
        setArrowActive(headerId, direction);
    }, 50);
    
    // Fetch new data from backend with sorting
    fetchTableData(currentPage);
}

// Modified fetchTableData to store data for client-side sorting
function fetchTableData(page = 1) {
    // ADD: Prevent multiple simultaneous requests
    if (isLoading) {
        console.log('Already loading, skipping duplicate request');
        return;
    }
    
    isLoading = true;
    currentPage = page;
    clearLeadsError();
    showLoader();
    
    let queryParams = new URLSearchParams({ page });
    
    Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            queryParams.set(key, value.join(','));
        } else if (value) {
            queryParams.set(key, value);
        }
    });

    const filterString = queryParams.toString();
    let currentPath = window.location.pathname;
    let newUrl = currentPath.includes("track-performance") ? 
        `/lms/track-performance/?${filterString}` : 
        `/lms/?${filterString}`;
    
    // CHANGE: Use replaceState to avoid triggering unnecessary events
    window.history.replaceState(null, '', newUrl);

    const fetchUrl = `/api/leads/?${filterString}`;
    
    fetch(fetchUrl, { 
        credentials: 'same-origin',
        // ADD: Request optimizations
        cache: 'no-cache',
        priority: 'high'
    })
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok: ' + res.status);
            const ctype = res.headers.get('content-type') || '';
            if (ctype.indexOf('application/json') === -1) throw new Error('Expected JSON response');
            return res.json();
        })
        .then(data => {
            globalAssigneeUserOption = data.results?.bussiness_analyst_users || [];
            
            // OPTIMIZE: Only populate filters once
            if (!isAssigneeFilterPopulated && globalAssigneeUserOption.length > 0) {
                populateAssignedToFilter();
                populateTagsFilter();
                isAssigneeFilterPopulated = true;
            }

            const originCounts = data.results.origin_counts || {};
            originSourceMap.forEach(key => {
                const count = originCounts[key] || "-";
                const el = document.getElementById(`count-${key}`);
                if (el) el.textContent = count;
            });

            allFetchedLeads = data.results.results || [];
            
            // OPTIMIZE: Use requestAnimationFrame for smoother rendering
            requestAnimationFrame(() => {
                renderTable(allFetchedLeads);
                renderPagination(data.current_page, data.total_pages);
                initializeSorting();
                
                // ADD: Reset loading flag after rendering
                isLoading = false;
            });
        })
        .catch(err => {
            console.error("Failed to fetch leads:", err);
            showLeadsError(err.message || String(err));
            hideLoader();
            isLoading = false; // ADD: Reset on error
        });
}

// Attach click handlers and arrows to date headers
function attachArrows() {
    dateHeaders.forEach(({id, sortKey}) => {
        const header = document.getElementById(id);
        if (!header) return;

        header.classList.add('date-header');
        header.style.cursor = 'pointer';
        header.style.userSelect = 'none';

        if (header.querySelector('.down-arrow')) return;

        const oldHandler = header.clickHandler;
        if (oldHandler) {
            header.removeEventListener('click', oldHandler);
        }

        header.clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onHeaderClick(sortKey, id);
        };

        header.addEventListener('click', header.clickHandler);

        const downArrow = document.createElement('span');
        downArrow.classList.add('sort-arrow', 'down-arrow');
        downArrow.innerHTML = '▼';
        downArrow.style.pointerEvents = 'none';
        downArrow.title = 'Descending';

        const upArrow = document.createElement('span');
        upArrow.classList.add('sort-arrow', 'up-arrow');
        upArrow.innerHTML = '▲';
        upArrow.style.pointerEvents = 'none';
        upArrow.title = 'Ascending';

        header.appendChild(downArrow);
        header.appendChild(upArrow);
    });

    // Set default active state
    // setTimeout(() => {
    //     clearAllArrowActive();
    //     setArrowActive('created-at-header', 'desc');
    // }, 50);
    initializeSortFromURL();
}

// Initialize sorting from URL parameters on page load
function initializeSortFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const sortBy = urlParams.get('sort_by') || '-created_at';
    
    currentSortBy = sortBy;
    filters.sort_by = sortBy;
    
    const isDesc = sortBy.startsWith('-');
    const sortKey = isDesc ? sortBy.substring(1) : sortBy;
    const direction = isDesc ? 'desc' : 'asc';
    
    const headerConfig = dateHeaders.find(h => h.sortKey === sortKey);
    if (headerConfig) {
        currentSortHeader = headerConfig.id;
        setTimeout(() => {
            clearAllArrowActive();
            setArrowActive(headerConfig.id, direction);
        }, 100);
    } else {
        currentSortBy = '-created_at';
        currentSortHeader = 'created-at-header';
        setTimeout(() => {
            clearAllArrowActive();
            setArrowActive('created-at-header', 'desc');
        }, 100);
    }
}

function clearAllFilterUI() {
    // Clear all UI elements
    document.querySelectorAll("#workflow-list input[type='checkbox'], #mobile-workflow-list input[type='checkbox']").forEach(cb => cb.checked = false);
    const workflowLabelDesktop = document.querySelector("#workflow-status-filter .workflow-dropdown-selected");
    const workflowLabelMobile = document.querySelector("#mobile-workflow-status-filter .mobile-workflow-dropdown-selected");
    if (workflowLabelDesktop) workflowLabelDesktop.textContent = "By Workflow Status";
    if (workflowLabelMobile) workflowLabelMobile.textContent = "By Workflow Status";

    document.querySelectorAll("#assigned-list input[type='checkbox'], #mobile-assigned-list input[type='checkbox']").forEach(cb => cb.checked = false);
    const assignedLabelDesktop = document.querySelector("#assigned-to-filter .assigned-dropdown-selected");
    const assignedLabelMobile = document.querySelector("#mobile-assigned-to-filter .mobile-assigned-dropdown-selected");
    if (assignedLabelDesktop) assignedLabelDesktop.textContent = "By Assigned To";
    if (assignedLabelMobile) assignedLabelMobile.textContent = "By Assigned To";

    document.querySelectorAll("#tags-list input[type='checkbox'], #mobile-tags-list input[type='checkbox']").forEach(cb => cb.checked = false);
    const tagsLabelDesktop = document.querySelector("#tags-filter .tags-dropdown-selected");
    const tagsLabelMobile = document.querySelector("#mobile-tags-filter .mobile-tags-dropdown-selected");
    if (tagsLabelDesktop) tagsLabelDesktop.textContent = "By Tags";
    if (tagsLabelMobile) tagsLabelMobile.textContent = "By Tags";

    document.querySelectorAll("#lead-origin-list input[type='checkbox'], #mobile-origin-list input[type='checkbox']").forEach(cb => cb.checked = false);
    const originLabelDesktop = document.querySelector("#lead-origin-filter .lead-origin-dropdown-selected");
    const originLabelMobile = document.querySelector("#mobile-lead-origin-filter .mobile-origin-dropdown-selected");
    if (originLabelDesktop) originLabelDesktop.textContent = "By Lead Origin";
    if (originLabelMobile) originLabelMobile.textContent = "By Lead Origin";

    document.querySelectorAll(".mark-imp-filter").forEach(select => select.value = "");
    document.querySelectorAll(".search-input-main-dashboard").forEach(input => input.value = "");
}

// Initialize arrows when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting initialization...'); // Debug log
    
    initializeSortFromURL();
    
    // Read page from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = parseInt(urlParams.get('page')) || 1;
    
    // Initialize table columns first - with a small delay to ensure DOM is ready
    setTimeout(() => {

        initializeTableColumns();
        
        // Then proceed with other initialization
        setTimeout(() => {
            attachArrows();
            // Always start with clear filters on page load
            filters = {};
            clearAllFilterUI();
            fetchTableData(initialPage);
        }, 100);
    }, 50);
});

// Call after table is rendered dynamically
function initializeSorting() {
    setTimeout(() => {
        attachArrows();
        // Arrows are set based on current sort state, no need to re-sort
    }, 50);
}


const originSourceMap = ["i", "w", "cw", "l"];
        let currentPage = 1;
        let filters = {};

        let allLeads = [];
        let globalAssigneeUserOption = [];

        const originMap = {
                'w': `<img src="/static/images/banao.png" alt="Website" width="20" />`,
                'l': `<img src="/static/images/linkedin.png" alt="Website" width="20" />`,
                'i': `<img src="/static/images/insta.png" alt="Website" width="20" />`,
                'cw': `<img src="/static/images/website.png" alt="Website" width="20" />`,
                'ig': `<img src="/static/images/interviewgod.png" alt="Website" width="30" />`,
                't': 'Twitter',
                'g': 'GitHub',
                };

        const workflowStatusMap = {
            0: "New Lead",
            1: "Contact Attempted",
            2: "Engaged",
            3: "Discovery / Demo Scheduled",
            4: "Discovery / Demo Completed",
            5: "Proposal Sent",
            6: "Closed - Won",
            7: "Closed - Lost",
            8: "Nurture / Recycle",
            // 12: "Priority Audit Pending",
            // 13: "New Call To Be Made",
            // 14: "InterviewGod",
            // 15: "1st email mesage sent after intial call",
            // 16: "2nd Follow-up",
            // 17: "3rd Follow-up",
            // 18: "Call Unresponsive",
            // 19: "Demo Booked",
            // 20: "Demo completed",
            // 21: "Whatsapp group onboarding",
            // 22: "JD request sent",
            // 23: "Pilot started",
            // 24: "Account setup & interview creation",
            // 25: "Swap confirmed / POC successful",
            // 26: "Email Sent"
        };

        // const callStatusMap = {
        //     'call_didnot_pickup': `Call Didn't Pickup`,
        //     'call_connected': 'Call Connected',
        //     'call_failed': 'Call Failed',
        // };

        function getStatusStyle(status) {
            switch (status) {
                case "Discovery / Demo Scheduled": return { bg: "#FEF3F2", color: "#D94C20" };
                case "Closed - Won": return { bg: "#D1E7DD", color: "#079455" };
                case "Engaged": return { bg: "#FEF8F2", color: "#FF5C00" };
                case "Closed - Lost": return { bg: "#FFFAEB", color: "#DC6803B2" };
                case "Contact Attempted": return { bg: "#FFFAEB", color: "#DC6803B2" };
                // case "New Call To Be Made": return { bg: "#FFFAEB", color: "#DC6803B2" };
                case "Nurture / Recycle": return { bg: "#FFFAEB", color: "#FF4E03E5" };
                // case "InterviewGod": return { bg: "#FFFAEB", color: "#FF4E03E5" };
                case "New Lead": return { bg: "#FEF3F2", color: "#D92D20" };
                case "Discovery / Demo Completed": return { bg: "#ECFDF3", color: "#17B26AE5" };
                // case "Confirmed": return { bg: "#ECFDF3", color: "#079455" };
                case "Proposal Sent": return { bg: "#FFFAEB", color: "#DC6803B2" };

                // case "2nd Follow-up": return { bg: "#FFFAEB", color: "#DC6803B2" };
                // case "3rd Follow-up": return { bg: "#FFFAEB", color: "#DC6803B2" };
                // case "Call Unresponsive": return { bg: "#FFFAEB", color: "#FF4E03E5" };
                // case "Demo Booked": return { bg: "#ECFDF3", color: "#17B26AE5" };
                // case "Demo completed": return { bg: "#ECFDF3", color: "#17B26AE5" };
                // case "Whatsapp group onboarding": return { bg: "#ECFDF3", color: "#17B26AE5" };
                // case "JD request sent": return { bg: "#ECFDF3", color: "#17B26AE5" };
                // case "Pilot started": return { bg: "#ECFDF3", color: "#079455" };
                // case "Account setup & interview creation": return { bg: "#ECFDF3", color: "#079455" };
                // case "Swap confirmed / POC successful": return { bg: "#ECFDF3", color: "#079455" };
                // case "Email Sent": return { bg: "#ECFDF3", color: "#079455" };

                default: return { bg: "#FFFFFF", color: "#000000" };
            }
        }


        // function getCallStatusStyle(status) {
        //     switch (status) {
        //         case "Call Didn't Pickup": return { bg: "#FFFAEB", color: "#DC6803B2" };
        //         case "Call Connected": return { bg: "#ECFDF3", color: "#17B26AE5" };
        //         case "Call Failed": return { bg: "#FEF8F2", color: "#FF5C00" };
        //         default: return { bg: "#FFFFFF", color: "#000000" };
        //     }
        // }

        function showLoader() {
            document.getElementById("lead-table-body").innerHTML = `<tr><td colspan="15"><div class="loading-spinner"></td></tr>`;
        }


        function toggleMobileMenuDash() {
            const modal = document.getElementById('mobile-menu-modal-lms-dash');
            modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
        }

        function toggleMobileFiltersLMS() {
            const modal = document.getElementById('mobile-filter-modal-lms-dash');
            modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
        }

function populateAssignedToFilter() {
    const desktopContainer = document.getElementById("assigned-list");
    const mobileContainer = document.getElementById("mobile-assigned-list");
    
    // Early return if containers don't exist
    if (!desktopContainer && !mobileContainer) return;

    const users = globalAssigneeUserOption || [];
    
    // ADD: Use cache if valid and data hasn't changed
    if (isCacheValid() && 
        filterCache.assignees && 
        filterCache.assignees.length === users.length) {
        console.log('Using cached assignee filter data');
        return; // Data already populated and still valid
    }

    // ADD: Update cache
    filterCache.assignees = users;
    filterCache.lastUpdated = Date.now();

    // OPTIMIZE: Use DocumentFragment for better performance
    [desktopContainer, mobileContainer].forEach(container => {
        if (!container) return;
        
        // OPTIMIZE: Use fragment to build DOM elements
        const fragment = document.createDocumentFragment();
        
        // Create "no assignee" option
        const noAssigneeLabel = document.createElement("label");
        noAssigneeLabel.style.display = "block";
        
        const noAssigneeInput = document.createElement("input");
        noAssigneeInput.type = "checkbox";
        noAssigneeInput.value = "none";
        noAssigneeInput.onchange = updateAssignedFilter;
        
        noAssigneeLabel.appendChild(noAssigneeInput);
        noAssigneeLabel.appendChild(document.createTextNode(" no assignee")); // FIX: Use createTextNode
        fragment.appendChild(noAssigneeLabel);
        
        // Create user options
        users.forEach(user => {
            const label = document.createElement("label");
            label.style.display = "block";
            
            const input = document.createElement("input");
            input.type = "checkbox";
            input.value = user.id;
            input.onchange = updateAssignedFilter;
            
            label.appendChild(input);
            label.appendChild(document.createTextNode(` ${user.first_name}`)); // FIX: Use createTextNode
            fragment.appendChild(label);
        });
        
        // OPTIMIZE: Single DOM manipulation
        container.innerHTML = ""; // Clear existing content
        container.appendChild(fragment);
    });
}

       async function populateTagsFilter() {
    if (isTagsFilterPopulated) return; // avoid re-fetching

    try {
        const res = await fetch("/api/tags/");
        const tags = await res.json();
        globalTagsOption = tags || [];

        const desktopContainer = document.getElementById("tags-list");
        const mobileContainer = document.getElementById("mobile-tags-list");

        [desktopContainer, mobileContainer].forEach(container => {
            if (!container) return;
            container.innerHTML = "";
            globalTagsOption.forEach(tag => {
                const label = document.createElement("label");
                label.style.display = "block";

                const input = document.createElement("input");
                input.type = "checkbox";
                input.value = tag.id;
                input.onchange = updateTagsFilter;

                label.appendChild(input);
                label.append(` ${tag.name}`);
                container.appendChild(label);
            });
        });

        isTagsFilterPopulated = true;
    } catch (err) {
        console.error("Failed to load tags:", err);
    }
}

function updateTagsFilter() {
    const desktopCheckboxes = document.querySelectorAll("#tags-list input[type='checkbox']");
    const mobileCheckboxes = document.querySelectorAll("#mobile-tags-list input[type='checkbox']");

    const selectedValues = [...desktopCheckboxes, ...mobileCheckboxes]
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    if (selectedValues.length > 0) {
        filters.tags = Array.from(new Set(selectedValues));
    } else {
        delete filters.tags;
    }

    fetchTableData(1);

    // Update labels
    const desktopLabel = document.querySelector("#tags-filter .tags-dropdown-selected");
    const mobileLabel = document.querySelector("#mobile-tags-filter .mobile-tags-dropdown-selected");

    if (desktopLabel) desktopLabel.textContent = selectedValues.length > 0 ? `${selectedValues.length} selected` : "By Tags";
    if (mobileLabel) mobileLabel.textContent = selectedValues.length > 0 ? `${selectedValues.length} selected` : "By Tags";
}

// Helper function to safely escape text for HTML attributes
function escapeForAttribute(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/'/g, '&#39;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        .replace(/\[/g, '&#91;')
        .replace(/\]/g, '&#93;')
        .replace(/{/g, '&#123;')
        .replace(/}/g, '&#125;');
}


        let isAssigneeFilterPopulated = false;

   


function renderTable(leads) {
    // ADD: Early validation
    if (!leads || leads.length === 0) {
        const tbody = document.getElementById("lead-table-body");
        tbody.innerHTML = '<tr><td colspan="15" style="text-align: center; padding: 20px;">No leads found</td></tr>';
        updateSelectionCount();
        return;
    }

    // Debug logging (keep existing)
    leads.forEach((lead, i) => {
        if (lead.action_item) {
            console.log(`Lead ${i} action_item:`, lead.action_item);
            const escaped = escapeForAttribute(lead.action_item);
            console.log(`Escaped:`, escaped);
        }
    });

    const tbody = document.getElementById("lead-table-body");
    allLeads = leads;
    const visibleColumns = getVisibleColumns();
    
    // ADD: Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    // ADD: Pre-calculate date conversion outside loop if possible
    function convertToDDMMYYYY(dateStr) {
        if (!dateStr || dateStr === "-") return null;
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
    }
    
    // OPTIMIZE: Build all rows first, then append once
    leads.forEach(lead => {
        const statusText = workflowStatusMap[lead.workflow_status] || "-";
        const originValue = originMap[lead.origin] || "-";
        const style = getStatusStyle(statusText);

        const row = document.createElement("tr");
        // OPTIMIZE: Use cssText for better performance
        row.style.cssText = `border-bottom: 1px solid #00000033; height: 40px; background-color: ${lead.Mark_Imp ? "#EBEBEB" : ""}`;
        
        const last_updated_note = lead.last_updated_note
            ? new Date(lead.last_updated_note).toISOString().split("T")[0]
            : "-";
        
        // Generate cells based on visible columns
        visibleColumns.forEach(column => {
            const td = document.createElement('td');
            
            switch(column.key) {
                case 'checkbox':
                    td.innerHTML = `<input type="checkbox" class="lead-checkbox" data-id="${lead.id}" data-imp="${lead.Mark_Imp}"/>`;
                    break;
                    
                case 'client_name':
                    const safeActionItem = escapeForAttribute(lead.action_item || '');
                    const hasActionItem = window.hasActiveActionItems ? 
                        window.hasActiveActionItems(lead.action_item) : 
                        (lead.action_item && lead.action_item.trim() !== '' && lead.action_item !== '[]');
                    
                    const actionIndicatorHtml = hasActionItem ? 
                        `<div class="action-indicator" 
                             data-action="${safeActionItem}"
                             style="cursor: pointer; display: flex;">
                            <div class="action-circle red"></div>
                        </div>` : '<div class="action-indicator" style="width: 12px; height: 12px; display: none;"></div>';
                    
                    td.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${actionIndicatorHtml}
                            <span class="lead-name-span" 
                                  data-lead-id="${lead.id}" 
                                  ${hasActionItem ? `data-action="${safeActionItem}"` : ''}
                                  style="cursor: pointer; white-space: nowrap;">
                                ${lead.full_name || ""}
                            </span>
                        </div>`;
                    
                    td.style.cursor = 'pointer';
                    td.onclick = (e) => {
                        if (!e.target.closest('.action-indicator')) {
                            window.location.href = `/lms/lead/${lead.id}`;
                        }
                    };
                    break;
                    
                case 'origin':
                    td.innerHTML = originValue;
                    break;
                    
                case 'workflow_status':
                    td.dataset.status = statusText;
                    td.innerHTML = `<div style="
                        background-color: ${style.bg};
                        color: ${style.color};
                        border-radius: 3px;
                        padding: 1px 4px;
                        width: fit-content;">${statusText}</div>`;
                    break;
                    
                case 'lead_notes_count':
                    td.innerHTML = `<span 
                        class="lead-notes-hover" 
                        data-notes="${encodeURIComponent(JSON.stringify(lead.lead_notes || []))}"
                        style="cursor: pointer;">
                        ${lead.lead_notes_count || "N/A"}
                    </span>`;
                    break;
                    
                case 'company_name':
                    td.textContent = lead.company_name || "-";
                    break;
                    
                case 'email':
                    td.style.padding = '0px 8px';
                    td.textContent = lead.emails?.join(", ") || "-";
                    break;
                    
                case 'phone':
                    td.textContent = lead.phones?.join(", ") || "-";
                    break;
                    
                case 'assigned_to':
                    td.textContent = lead.assigned_to?.join(", ") || "-";
                    break;
                    
                case "created_at":
                    td.textContent = convertToDDMMYYYY(lead.created_at) || "-";
                    break;
                    
                case "last_updated_note":
                    td.textContent = convertToDDMMYYYY(last_updated_note) || "-";
                    break;
                    
                case "next_follow_up":
                    td.textContent = convertToDDMMYYYY(lead.next_follow_up_date) || "-";
                    break;
                    
                default:
                    td.textContent = "-";
            }
            
            row.appendChild(td);
        });

        // ADD: Append to fragment instead of tbody
        fragment.appendChild(row);
    });

    // OPTIMIZE: Clear and append once (single reflow)
    tbody.innerHTML = "";
    tbody.appendChild(fragment);

    // OPTIMIZE: Batch listener additions using requestAnimationFrame
    requestAnimationFrame(() => {
        updateSelectionCount();
        addCheckboxListeners();
        attachNoteHoverListeners();
    });
}










        function attachNoteHoverListeners() {
    const noteEls = document.querySelectorAll(".lead-notes-hover");
    // console.log("Attaching hover listeners to:", noteEls.length, "elements");  // 👈 debug

    noteEls.forEach(el => {
        el.addEventListener("mouseenter", (e) => {
            // console.log("Hovering notes element:", el);  // 👈 debug
            const notes = JSON.parse(decodeURIComponent(el.dataset.notes || "[]"));
            const tooltip = document.getElementById("lead-notes-tooltip");

            if (notes.length > 0) {
                tooltip.innerHTML = notes.reverse().map(n => `
                    <div style="margin-bottom:6px; border-bottom:1px solid #eee; padding-bottom:4px;">
                        <div style="white-space: pre-wrap;word-break: break-word;">${n.note || "-"}</div>
                        <div style="color:#666; font-size:12px;">
                            By: ${n.added_by_name || "-"} on ${n.created_at || "-"}
                        </div>
                    </div>
                `).join("");
            } else {
                tooltip.innerHTML = "<i>No notes available</i>";
            }

            tooltip.style.display = "block";
            tooltip.style.left = (e.pageX + 10) + "px";
            tooltip.style.top = (e.pageY + 10) + "px";
        });

        el.addEventListener("mousemove", (e) => {
            const tooltip = document.getElementById("lead-notes-tooltip");
            tooltip.style.left = (e.pageX + 10) + "px";
            tooltip.style.top = (e.pageY + 10) + "px";
        });

        el.addEventListener("mouseleave", () => {
            document.getElementById("lead-notes-tooltip").style.display = "none";
        });
    });
}

   


        // function renderPagination(current, total) {
        //     const container = document.getElementById("pagination-container");
        //     container.innerHTML = "";

        //     const maxVisible = 5;
        //     let start = Math.max(1, current - Math.floor(maxVisible / 2));
        //     let end = start + maxVisible - 1;

        //     if (end > total) {
        //         end = total;
        //         start = Math.max(1, end - maxVisible + 1);
        //     }


        //     if (current > 1) {
        //         const prevBtn = document.createElement("button");
        //         prevBtn.textContent = "Prev";
        //         prevBtn.classList.add("pagination-button");
        //         prevBtn.addEventListener("click", () => fetchTableData(current - 1));
        //         container.appendChild(prevBtn);

        //         // displaying first page button 
        //         const btn = document.createElement("button");
        //         btn.textContent = 1;
        //         btn.classList.add("pagination-button");
        //         if (1 === current) btn.classList.add("active-page");
        //         btn.addEventListener("click", () => fetchTableData(1));
        //         //ellipsis
        //         container.appendChild(btn);
        //         const dots =document.createElement("span");
        //         dots.textContent="...";
        //         container.appendChild(dots);
        //     }


        //     for (let i = start; i <= end; i++) {
        //         const btn = document.createElement("button");
        //         btn.textContent = i;
        //         btn.classList.add("pagination-button");
        //         if (i === current) btn.classList.add("active-page");

        //         btn.addEventListener("click", () => fetchTableData(i));
        //         container.appendChild(btn);
        //     }


        //     if (current < total) {
        //         //ellipsis
        //         const dots =document.createElement("span");
        //         dots.textContent="...";
        //         container.appendChild(dots);
        //          // displaying last page button 
        //         const btn = document.createElement("button");
        //         btn.textContent = total;
        //         btn.classList.add("pagination-button");
        //         if (total === current) btn.classList.add("active-page");
        //         btn.addEventListener("click", () => fetchTableData(total));
        //         container.appendChild(btn);

        //         //next button
        //         const nextBtn = document.createElement("button");
        //         nextBtn.textContent = "Next";
        //         nextBtn.classList.add("pagination-button");
        //         nextBtn.addEventListener("click", () => fetchTableData(current + 1));
        //         container.appendChild(nextBtn);

               
                
        //     }
        //     const total_pages = document.createElement("div");
        //     total_pages.innerHTML = `page ${current} of ${total}`;
        //     container.appendChild(total_pages);
        // }

//         new pagination logic 

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

  function renderPagination(current, total) {
    const container = document.getElementById("pagination-container");
    container.innerHTML = "";

    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > total) {
        end = total;
        start = Math.max(1, end - maxVisible + 1);
    }

    // CHANGE: Add debounced click handler
    const debouncedFetch = debounce((page) => fetchTableData(page), 150);

    // Prev button
    if (current > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Prev";
        prevBtn.classList.add("pagination-button");
        prevBtn.addEventListener("click", () => debouncedFetch(current - 1)); // CHANGED
        container.appendChild(prevBtn);
    }

    // First page (1)
    if (start > 1) {
        const firstBtn = document.createElement("button");
        firstBtn.textContent = "1";
        firstBtn.classList.add("pagination-button");
        firstBtn.addEventListener("click", () => debouncedFetch(1)); // CHANGED
        container.appendChild(firstBtn);

        if (start > 2) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            dots.classList.add("pagination-ellipsis");
            container.appendChild(dots);
        }
    }

    // Visible page range
    for (let i = start; i <= end; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.add("pagination-button");
        if (i === current) btn.classList.add("active-page");
        btn.addEventListener("click", () => debouncedFetch(i)); // CHANGED
        container.appendChild(btn);
    }

    // Last page with ellipsis
    if (end < total) {
        if (end < total - 1) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            dots.classList.add("pagination-ellipsis");
            container.appendChild(dots);
        }

        const lastBtn = document.createElement("button");
        lastBtn.textContent = total;
        lastBtn.classList.add("pagination-button");
        lastBtn.addEventListener("click", () => debouncedFetch(total)); // CHANGED
        container.appendChild(lastBtn);
    }

    // Next button
    if (current < total) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next";
        nextBtn.classList.add("pagination-button");
        nextBtn.addEventListener("click", () => debouncedFetch(current + 1)); // CHANGED
        container.appendChild(nextBtn);
    }

    // Page summary
    const total_pages = document.createElement("div");
    total_pages.innerHTML = `page ${current} of ${total}`;
    total_pages.classList.add("pagination-summary");
    container.appendChild(total_pages);
}


        function toggleMoreDropdown() {
            const dropdown = document.getElementById("more-dropdown");
            dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
        }


        document.addEventListener("click", function (event) {
            const dropdown = document.getElementById("more-dropdown");
            const moreBtn = document.querySelector(".more-option");
            if (!dropdown.contains(event.target) && !moreBtn.contains(event.target)) {
                dropdown.style.display = "none";
            }
        });

        function getSelectedLeadIds() {
            const checkboxes = document.querySelectorAll(".lead-checkbox:checked");
            return Array.from(checkboxes).map(cb =>( {id:parseInt(cb.dataset.id), mark_imp:cb.dataset.imp === "false" ? false : true}));
        }


        function bulkMarkImportant() {
            const ids = getSelectedLeadIds();
            if (!ids.length) return alert("Select at least one lead first.");

            const confirmed = confirm("Do you want to mark selected leads as important/not important?");
            if (!confirmed) return;

            const leads = ids.map(lead => ({ lead_id: lead.id, Mark_Imp: !lead.mark_imp }));
            console.log(leads,ids);
            
            sendBulkUpdate(leads);
        }

        function bulkDelete() {
            const ids = getSelectedLeadIds();
            if (!ids.length) return alert("Select at least one lead first.");

            const confirmed = confirm("Do you want to delete selected leads?");
            if (!confirmed) return;

            const leads = ids.map(id => ({ lead_id: id, delete: true }));
            sendBulkUpdate(leads);
        }


        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }

        const csrftoken = getCookie('csrftoken');

        if (!csrftoken) {
            console.error('CSRF token not found!');
        }


        function sendBulkUpdate(leads) {
            fetch("/api/leads/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({ leads }),
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => {
                    alert("Update successful!");
                    fetchTableData(currentPage);
                })
                .catch(err => {
                    console.error("Bulk update failed:", err);
                    alert("Update failed. Check console for details.");
                });
        }


        const normalWorkflowOptions = [
            { value: 7, label: "Closed - Lost" },
            { value: 8, label: "Nurture / Recycle" },
            { value: 1, label: "Contact Attempted" },
            // { value: 11, label: "Confirmed" },
            // { value: 14, label: "InterviewGod" },
            { value: 5, label: "Proposal Sent" },
            { value: 0, label: "New Lead" },
            { value: 6, label: "Closed - Won" },
            // { value: 13, label: "New Call To Be Made" },
            // { value: 12, label: "Priority Audit Pending" },
            { value: 3, label: "Discovery / Demo Scheduled" },
            { value: 4, label: "Discovery / Demo Completed" },
            { value: 2, label: "Engaged" },
        ];

        const linkedinWorkflowOptions = [
            { value: 7, label: "Closed - Lost" },
            { value: 8, label: "Nurture / Recycle" },
            { value: 1, label: "Contact Attempted" },
            // { value: 11, label: "Confirmed" },
            // { value: 14, label: "InterviewGod" },
            { value: 5, label: "Proposal Sent" },
            { value: 0, label: "New Lead" },
            { value: 6, label: "Closed - Won" },
            // { value: 13, label: "New Call To Be Made" },
            // { value: 12, label: "Priority Audit Pending" },
            { value: 3, label: "Discovery / Demo Scheduled" },
            { value: 4, label: "Discovery / Demo Completed" },
            { value: 2, label: "Engaged" },
        ];

        function renderWorkflowOptions(options) {
            const select = document.getElementById("lead-workflow-change-dash");
            if (!select) return;

            select.innerHTML = `<option value="">Change Workflow Status</option>`;

            options.forEach(opt => {
                const optionElement = document.createElement("option");
                optionElement.value = opt.value;
                optionElement.textContent = opt.label;
                select.appendChild(optionElement);
            });
        }
        document.getElementById("lead-workflow-change-dash").addEventListener("click", () => {
            const leadIds = getSelectedLeadIds();
            if (!leadIds.length) {
                renderWorkflowOptions([...normalWorkflowOptions]);
                return;
            }

            const selectedLeads = allLeads.filter(lead => leadIds.includes(lead.id));
            const uniqueOrigins = [...new Set(selectedLeads.map(lead => lead.origin.toLowerCase()))];

            if (uniqueOrigins.length > 1) {
                alert("Cannot change workflow status when different origins are selected.");
                renderWorkflowOptions([]);
                return;
            }

            const origin = uniqueOrigins[0];

            if (origin === "l") {
                renderWorkflowOptions([...linkedinWorkflowOptions]);
            } else {
                renderWorkflowOptions([...normalWorkflowOptions]);
            }
        });
        function handleWorkflowChange(status) {
            if (!status) return;

            const leadIds = getSelectedLeadIds();
            if (!leadIds.length) {
                alert("Select at least one lead first.");
                return;
            }

            const selectedLeads = allLeads.filter(lead => leadIds.includes(lead.id));
            const uniqueOrigins = [...new Set(selectedLeads.map(lead => lead.origin.toLowerCase()))];

            if (uniqueOrigins.length > 1) {
                alert("Cannot change workflow status for leads with different origins selected.");
                return;
            }

            const origin = uniqueOrigins[0];
            const isLinkedInLead = origin === "l";


            const allowedStatuses = isLinkedInLead
                ? [0 , 1, 2, 3, 4, 5, 6, 7, 8]
                : [0 , 1, 2, 3, 4, 5, 6, 7, 8];

            if (!allowedStatuses.includes(Number(status))) {
                alert("Selected workflow status is not allowed for this origin.");
                return;
            }

            const statusLabel = workflowStatusMap[status] || "selected status";

            const confirmChange = confirm(`Change workflow status to "${statusLabel}" for selected leads?`);
            if (!confirmChange) return;

            const payload = leadIds.map(id => ({
                lead_id: id,
                workflow_status: Number(status),
            }));

            sendBulkUpdate(payload);

            const select = document.getElementById("lead-workflow-change-dash");
            if (select) select.value = "";
        }

        function handleCallStatusChange(status) {
            if (!status) return;

            const leadIds = getSelectedLeadIds();
            if (!leadIds.length) {
                alert("Select at least one lead first.");
                return;
            }

            // const statusLabel = callStatusMap[status] || "selected status";
            const statusLabel = "selected status";

            const confirmChange = confirm(`Change call status to "${statusLabel}" for selected leads?`);
            if (!confirmChange) return;

            const payload = leadIds.map(id => ({
                lead_id: id,
                call_status: status,
            }));

            sendBulkUpdate(payload);


            const select = document.getElementById("lead-callStatus-change-dash");
            if (select) select.value = "";
        }

        function openFollowUpDatePicker() {
            const dateInput = document.getElementById('followup-date-picker');
            if (dateInput) {
                dateInput.style.display = 'block';
                dateInput.click();
            }
        }

        function handleFollowUpUpdate(date) {
            if (!date) return;

            const leadIds = getSelectedLeadIds();
            if (!leadIds.length) {
                alert("Select at least one lead first.");
                resetFollowUpDateInput();
                return;
            }

            const confirmChange = confirm(`Change follow-up date to "${date}" for selected leads?`);
            if (!confirmChange) {
                resetFollowUpDateInput();
                return;
            }

            const payload = leadIds.map(id => ({
                lead_id: id,
                next_follow_up_date: date,
            }));

            sendBulkUpdate(payload);

            resetFollowUpDateInput();
        }

        function resetFollowUpDateInput() {
            const dateInput = document.getElementById('followup-date-picker');
            if (dateInput) {
                dateInput.value = "";
                dateInput.style.display = "none";
            }
        }



        document.getElementById("change-assignee-btn").addEventListener("click", () => {
            const dropdown = document.getElementById("assignee-dropdown");
            const isHidden = window.getComputedStyle(dropdown).display === "none";
            dropdown.style.display = isHidden ? "block" : "none";

            populateAssigneeDropdown();
        });

        function populateAssigneeDropdown() {

            const users = globalAssigneeUserOption;
            const select = document.getElementById("assignee-select");
            select.innerHTML = `<option value="">Select user</option>`;

            users.forEach(user => {
                const option = document.createElement("option");
                option.value = user.id;
                option.textContent = user.first_name;
                select.appendChild(option);
            });


        }


        document.getElementById("assign-btn").addEventListener("click", () => {
            const select = document.getElementById("assignee-select");
            const selectedUserIds = Array.from(select.selectedOptions).map(option => parseInt(option.value));
            const ids = getSelectedLeadIds();

            if (!ids.length) return alert("Select at least one lead first.");
            if (!selectedUserIds.length) return alert("Please select at least one user to assign");

            const confirmed = confirm("Do you want to assign the selected leads to the chosen users?");
            if (!confirmed) return;

            const leads = ids.map(id => ({
                lead_id: id,
                assigned_to: selectedUserIds
            }));

            sendBulkUpdate(leads);

            document.getElementById("assignee-dropdown").style.display = "none";
        });


        document.addEventListener("click", function (e) {
            const dropdown = document.getElementById("assignee-dropdown");
            const button = document.getElementById("change-assignee-btn");


            if (!dropdown.contains(e.target) && !button.contains(e.target)) {
                dropdown.style.display = "none";
            }
        });


        document.querySelectorAll(".mark-imp-filter").forEach(select => {
            select.addEventListener("change", e => {
                filters.mark_imp = e.target.value;
                fetchTableData(1);
            });
        });

        document.querySelector(".search-icon-main-dashboard").addEventListener("click", () => {
            const input = document.querySelector(".search-input-main-dashboard");
            const query = input.value.trim();


            filters.search_query = query;
            fetchTableData(1);
        });


        // document.querySelectorAll(".by-assigned-filter").forEach(select => {
        //     select.addEventListener("change", e => {
        //         filters.assigned_to = e.target.value;
        //         fetchTableData(1);
        //     });
        // });

        function toggleTagsDropdown() {
            document.getElementById("tags-list").classList.toggle("hidden");
        }

        function toggleAssignedDropdown() {
            document.getElementById("assigned-list").classList.toggle("hidden");
        }

        function updateAssignedFilter() {
            const desktopCheckboxes = document.querySelectorAll("#assigned-list input[type='checkbox']");
            const mobileCheckboxes = document.querySelectorAll("#mobile-assigned-list input[type='checkbox']");

            const selectedValues = [...desktopCheckboxes, ...mobileCheckboxes]
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (selectedValues.length > 0) {
                filters.assigned_to = Array.from(new Set(selectedValues));
            } else {
                delete filters.assigned_to;
            }

            fetchTableData(1);

            const desktopLabel = document.querySelector("#assigned-to-filter .assigned-dropdown-selected");
            const mobileLabel = document.querySelector("#mobile-assigned-to-filter .mobile-assigned-dropdown-selected");

            if (desktopLabel) desktopLabel.textContent = selectedValues.length > 0 ? `${selectedValues.length} selected` : "By Assigned To";
            if (mobileLabel) mobileLabel.textContent = selectedValues.length > 0 ? `${selectedValues.length} selected` : "By Assigned To";
        }


        // document.addEventListener("click", function (event) {
        //     const dropdown = document.getElementById("assigned-to-filter");
        //     if (!dropdown.contains(event.target)) {
        //         document.getElementById("assigned-list").classList.add("hidden");
        //     }
        // });

        function toggleMobileAssignedDropdown() {
            document.getElementById("mobile-assigned-list").classList.toggle("hidden");
        }

         function toggleMobileTagsDropdown() {
            document.getElementById("mobile-tags-list").classList.toggle("hidden");
        }

        document.addEventListener("click", function (event) {
            const mobileDropdown = document.getElementById("mobile-assigned-to-filter");
            if (!mobileDropdown.contains(event.target)) {
                document.getElementById("mobile-assigned-list").classList.add("hidden");
            }

            const desktopDropdown = document.getElementById("assigned-to-filter");
            if (!desktopDropdown.contains(event.target)) {
                document.getElementById("assigned-list").classList.add("hidden");
            }

             const tagsmobileDropdown = document.getElementById("mobile-tags-filter");
            if (!tagsmobileDropdown.contains(event.target)) {
                document.getElementById("mobile-tags-list").classList.add("hidden");
            }

            const tagsdesktopDropdown = document.getElementById("tags-filter");
            if (!tagsdesktopDropdown.contains(event.target)) {
                document.getElementById("tags-list").classList.add("hidden");
            }
        });



        document.querySelectorAll(".workflow-status-filter-mobile").forEach(select => {
            select.addEventListener("change", e => {
                filters.workflow_status = e.target.value;
                fetchTableData(1);
            });
        });

        let selectedWorkflowStatuses = [];

        function toggleWorkflowDropdown() {
            document.getElementById("workflow-list").classList.toggle("hidden");
        }

        function updateWorkflowFilter() {
            const desktopCheckboxes = document.querySelectorAll("#workflow-list input[type='checkbox']");
            const mobileCheckboxes = document.querySelectorAll("#mobile-workflow-list input[type='checkbox']");

            const selectedValues = [...desktopCheckboxes, ...mobileCheckboxes]
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (selectedValues.length > 0) {
                filters.workflow_status = Array.from(new Set(selectedValues));
            } else {
                delete filters.workflow_status;
            }

            fetchTableData(1);

            const desktopLabel = document.querySelector("#workflow-status-filter .workflow-dropdown-selected");
            const mobileLabel = document.querySelector("#mobile-workflow-status-filter .mobile-workflow-dropdown-selected");

            if (desktopLabel) desktopLabel.textContent = selectedValues.length > 0 ? `${selectedValues.length} selected` : "By Workflow Status";
            if (mobileLabel) mobileLabel.textContent = selectedValues.length > 0 ? `${selectedValues.length} selected` : "By Workflow Status";
        }


        // document.addEventListener("click", function (event) {
        //     const dropdown = document.getElementById("workflow-status-filter");
        //     if (!dropdown.contains(event.target)) {
        //         document.getElementById("workflow-list").classList.add("hidden");
        //     }
        // });
        document.addEventListener("click", function (event) {

            const wfDesktop = document.getElementById("workflow-status-filter");
            const wfMobile = document.getElementById("mobile-workflow-status-filter");
            if (!wfDesktop.contains(event.target)) document.getElementById("workflow-list").classList.add("hidden");
            if (!wfMobile.contains(event.target)) document.getElementById("mobile-workflow-list").classList.add("hidden");


            const originDesktop = document.getElementById("lead-origin-filter");
            const originMobile = document.getElementById("mobile-lead-origin-filter");
            if (!originDesktop.contains(event.target)) document.getElementById("lead-origin-list").classList.add("hidden");
            if (!originMobile.contains(event.target)) document.getElementById("mobile-origin-list").classList.add("hidden");
        });


        function toggleMobileWorkflowDropdown() {
            document.getElementById("mobile-workflow-list").classList.toggle("hidden");
        }


        // document.querySelectorAll(".call-status-filter").forEach(select => {
        //     select.addEventListener("change", e => {
        //         filters.call_status = e.target.value;
        //         fetchTableData(1);
        //     });
        // });

        // document.querySelectorAll(".lead-origin-filter").forEach(select => {
        //     select.addEventListener("change", e => {
        //         filters.origin = e.target.value;
        //         fetchTableData(1);
        //     });
        // });


        function toggleMobileOriginDropdown() {
            document.getElementById("mobile-origin-list").classList.toggle("hidden");
        }

        function toggleOriginDropdown() {
            document.getElementById("lead-origin-list").classList.toggle("hidden");
        }

        function updateOriginFilter() {
            const desktopCheckboxes = document.querySelectorAll("#lead-origin-list input[type='checkbox']");
            const mobileCheckboxes = document.querySelectorAll("#mobile-origin-list input[type='checkbox']");

            const selectedValues = [...desktopCheckboxes, ...mobileCheckboxes]
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (selectedValues.length > 0) {
                filters.origin = Array.from(new Set(selectedValues));
            } else {
                delete filters.origin;
            }

            fetchTableData(1);

            const desktopLabel = document.querySelector("#lead-origin-filter .lead-origin-dropdown-selected");
            const mobileLabel = document.querySelector("#mobile-lead-origin-filter .mobile-origin-dropdown-selected");

            if (desktopLabel) desktopLabel.textContent = selectedValues.length > 0 ? `${selectedValues.length} selected` : "By Lead Origin";
            if (mobileLabel) mobileLabel.textContent = selectedValues.length > 0 ? `${selectedValues.length} selected` : "By Lead Origin";
        }


        document.addEventListener("click", function (event) {
            const dropdown = document.getElementById("lead-origin-filter");
            if (!dropdown.contains(event.target)) {
                document.getElementById("lead-origin-list").classList.add("hidden");
            }
        });


        document.addEventListener("click", function (event) {
            const workflowDropdown = document.getElementById("workflow-status-filter");
            if (!workflowDropdown.contains(event.target)) {
                document.getElementById("workflow-list").classList.add("hidden");
            }

            const originDropdown = document.getElementById("lead-origin-filter");
            if (!originDropdown.contains(event.target)) {
                document.getElementById("lead-origin-list").classList.add("hidden");
            }
        });



        document.getElementById("reset-filters").addEventListener("click", () => {
            filters = {};


            document.querySelectorAll("#lead-origin-list input[type='checkbox'], #mobile-origin-list input[type='checkbox']")
                .forEach(cb => cb.checked = false);
            const originLabelDesktop = document.querySelector("#lead-origin-filter .lead-origin-dropdown-selected");
            const originLabelMobile = document.querySelector("#mobile-lead-origin-filter .mobile-origin-dropdown-selected");
            if (originLabelDesktop) originLabelDesktop.textContent = "By Lead Origin";
            if (originLabelMobile) originLabelMobile.textContent = "By Lead Origin";


            document.querySelectorAll("#workflow-list input[type='checkbox'], #mobile-workflow-list input[type='checkbox']")
                .forEach(cb => cb.checked = false);
            const workflowLabelDesktop = document.querySelector("#workflow-status-filter .workflow-dropdown-selected");
            const workflowLabelMobile = document.querySelector("#mobile-workflow-status-filter .mobile-workflow-dropdown-selected");
            if (workflowLabelDesktop) workflowLabelDesktop.textContent = "By Workflow Status";
            if (workflowLabelMobile) workflowLabelMobile.textContent = "By Workflow Status";


            document.querySelectorAll("#assigned-list input[type='checkbox'], #mobile-assigned-list input[type='checkbox']")
                .forEach(cb => cb.checked = false);
            const assignedLabelDesktop = document.querySelector("#assigned-to-filter .assigned-dropdown-selected");
            const assignedLabelMobile = document.querySelector("#mobile-assigned-to-filter .mobile-assigned-dropdown-selected");
            if (assignedLabelDesktop) assignedLabelDesktop.textContent = "By Assigned To";
            if (assignedLabelMobile) assignedLabelMobile.textContent = "By Assigned To";


            document.querySelectorAll("#tags-list input[type='checkbox'], #mobile-tags-list input[type='checkbox']")
                .forEach(cb => cb.checked = false);
            const tagsLabelDesktop = document.querySelector("#tags-filter .tags-dropdown-selected");
            const tagsLabelMobile = document.querySelector("#mobile-tags-filter .mobile-tags-dropdown-selected");
            if (tagsLabelDesktop) tagsLabelDesktop.textContent = "By Tags";
            if (tagsLabelMobile) tagsLabelMobile.textContent = "By Tags";


            // document.querySelectorAll(".call-status-filter").forEach(el => el.value = "");
            document.querySelectorAll(".mark-imp-filter").forEach(el => el.value = "");


            document.querySelectorAll(".search-input-main-dashboard").forEach(el => el.value = "");

            fetchTableData(1);
        });

        function initFiltersFromURL() {
            // Clear all filters first
            filters = {};

            // Clear all UI elements first
            document.querySelectorAll("#workflow-list input[type='checkbox'], #mobile-workflow-list input[type='checkbox']").forEach(cb => cb.checked = false);
            const workflowLabelDesktop = document.querySelector("#workflow-status-filter .workflow-dropdown-selected");
            const workflowLabelMobile = document.querySelector("#mobile-workflow-status-filter .mobile-workflow-dropdown-selected");
            if (workflowLabelDesktop) workflowLabelDesktop.textContent = "By Workflow Status";
            if (workflowLabelMobile) workflowLabelMobile.textContent = "By Workflow Status";

            document.querySelectorAll("#assigned-list input[type='checkbox'], #mobile-assigned-list input[type='checkbox']").forEach(cb => cb.checked = false);
            const assignedLabelDesktop = document.querySelector("#assigned-to-filter .assigned-dropdown-selected");
            const assignedLabelMobile = document.querySelector("#mobile-assigned-to-filter .mobile-assigned-dropdown-selected");
            if (assignedLabelDesktop) assignedLabelDesktop.textContent = "By Assigned To";
            if (assignedLabelMobile) assignedLabelMobile.textContent = "By Assigned To";

            document.querySelectorAll("#tags-list input[type='checkbox'], #mobile-tags-list input[type='checkbox']").forEach(cb => cb.checked = false);
            const tagsLabelDesktop = document.querySelector("#tags-filter .tags-dropdown-selected");
            const tagsLabelMobile = document.querySelector("#mobile-tags-filter .mobile-tags-dropdown-selected");
            if (tagsLabelDesktop) tagsLabelDesktop.textContent = "By Tags";
            if (tagsLabelMobile) tagsLabelMobile.textContent = "By Tags";

            document.querySelectorAll("#lead-origin-list input[type='checkbox'], #mobile-origin-list input[type='checkbox']").forEach(cb => cb.checked = false);
            const originLabelDesktop = document.querySelector("#lead-origin-filter .lead-origin-dropdown-selected");
            const originLabelMobile = document.querySelector("#mobile-lead-origin-filter .mobile-origin-dropdown-selected");
            if (originLabelDesktop) originLabelDesktop.textContent = "By Lead Origin";
            if (originLabelMobile) originLabelMobile.textContent = "By Lead Origin";

            document.querySelectorAll(".mark-imp-filter").forEach(select => select.value = "");
            document.querySelectorAll(".search-input-main-dashboard").forEach(input => input.value = "");

            const params = new URLSearchParams(window.location.search);

            
            if (params.has('call_status')) {
                const val = params.get('call_status');
                filters.call_status = val;

                // document.querySelectorAll(".call-status-filter").forEach(select => {
                //     select.value = val;
                // });
            }

            
            if (params.has('workflow_status')) {
                const values = params.get('workflow_status').split(',');
                filters.workflow_status = values;

                const allCheckboxes = document.querySelectorAll("#workflow-list input[type='checkbox'], #mobile-workflow-list input[type='checkbox']");
                allCheckboxes.forEach(cb => {
                    cb.checked = values.includes(cb.value);
                });

              
                const labelDesktop = document.querySelector("#workflow-status-filter .workflow-dropdown-selected");
                const labelMobile = document.querySelector("#mobile-workflow-status-filter .mobile-workflow-dropdown-selected");
                if (labelDesktop) labelDesktop.textContent = `${values.length} selected`;
                if (labelMobile) labelMobile.textContent = `${values.length} selected`;
            }

            
            if (params.has('assigned_to')) {
                const values = params.get('assigned_to').split(',');
                filters.assigned_to = values;

                const allCheckboxes = document.querySelectorAll("#assigned-list input[type='checkbox'], #mobile-assigned-list input[type='checkbox']");
                allCheckboxes.forEach(cb => {
                    cb.checked = values.includes(cb.value);
                });

                const labelDesktop = document.querySelector("#assigned-to-filter .assigned-dropdown-selected");
                const labelMobile = document.querySelector("#mobile-assigned-to-filter .mobile-assigned-dropdown-selected");
                if (labelDesktop) labelDesktop.textContent = `${values.length} selected`;
                if (labelMobile) labelMobile.textContent = `${values.length} selected`;
            }

              if (params.has('tags')) {
                const values = params.get('tags').split(',');
                filters.tags = values;

                const allCheckboxes = document.querySelectorAll("#tags-list input[type='checkbox'], #mobile-tags-list input[type='checkbox']");
                allCheckboxes.forEach(cb => {
                    cb.checked = values.includes(cb.value);
                });

                const labelDesktop = document.querySelector("#tags-filter .tags-dropdown-selected");
                const labelMobile = document.querySelector("#mobile-tags-filter .mobile-tags-dropdown-selected");
                if (labelDesktop) labelDesktop.textContent = `${values.length} selected`;
                if (labelMobile) labelMobile.textContent = `${values.length} selected`;
            }
            
            if (params.has('origin')) {
                const values = params.get('origin').split(',');
                filters.origin = values;

                const allCheckboxes = document.querySelectorAll("#lead-origin-list input[type='checkbox'], #mobile-origin-list input[type='checkbox']");
                allCheckboxes.forEach(cb => {
                    cb.checked = values.includes(cb.value);
                });

                const labelDesktop = document.querySelector("#lead-origin-filter .lead-origin-dropdown-selected");
                const labelMobile = document.querySelector("#mobile-lead-origin-filter .mobile-origin-dropdown-selected");
                if (labelDesktop) labelDesktop.textContent = `${values.length} selected`;
                if (labelMobile) labelMobile.textContent = `${values.length} selected`;
            }

           
            if (params.has('mark_imp')) {
                const val = params.get('mark_imp');
                filters.mark_imp = val;
                document.querySelectorAll(".mark-imp-filter").forEach(select => {
                    select.value = val;
                });
            }

           
            if (params.has('search_query')) {
                const val = params.get('search_query');
                filters.search_query = val;
                const input = document.querySelector(".search-input-main-dashboard");
                if (input) input.value = val;
            }
        }

function closeLeadDetails() {
    document.querySelector('.lead-details-dashboard').style.display = 'none';

    if (previousDashboard === "lms") {
        document.querySelector('.lms-main-dashboard').style.display = 'block';
        // Refresh the table data to reflect any changes
        if (typeof fetchTableData === 'function') {
            fetchTableData(currentPage);
        }
    } else if (previousDashboard === "check") {
        document.querySelector('.checks-main-dashboard').style.display = 'block';
    } else if (previousDashboard === "jrba") {
        document.querySelector('.jr-ba-dashboard').style.display = 'block';
    }
}


        let previousAssignedIds = [];
        let usernameToIdMap = {};
        let currentEditingLeadId = null;


        let previousDashboard = "lms";

        function showLoaderLeadDetail() {
            document.getElementById("lead-details-loader").style.display = "flex";
            document.getElementById("lead-details-content").style.display = "none";
        }
        function hideLoaderLeadDetail() {
            document.getElementById("lead-details-loader").style.display = "none";
            document.getElementById("lead-details-content").style.display = "flex";
        }



        async function toggleLeadDetails(leadId) {
            currentEditingLeadId = leadId;

            

            showLoaderLeadDetail()
            try {
                const response = await fetch(`/api/lead-dashboard/${leadId}/`);
                const lead = await response.json();
                console.log(lead)

                const button = document.getElementById("take-over-lead");

                if (lead?.user_group === "Business analyst") {
                    button.style.display = "block";

                    const isTaken = !!lead?.lead_data?.takeover_from;
                    button.disabled = isTaken;
                    button.style.cursor = isTaken ? "not-allowed" : "pointer";
                } else {
                    button.style.display = "none";
                }
                document.getElementById("lead-details-form-client-name").innerText = lead?.lead_data?.full_name || "";
                document.getElementById("lead-details-form-updatedAt").innerText = lead?.lead_data?.updated_at || "";
                document.getElementById("lead-details-form-createdAt").innerText = lead?.lead_data?.created_at || "";
                document.getElementById("lead-details-form-call-icon").href = lead?.lead_data?.phones?.[0]
                    ? `tel:${lead.lead_data.phones[0]}`
                    : "#";
                document.getElementById("star2").checked = lead?.lead_data?.Mark_Imp || false;

                document.getElementById("lead-details-form-company-name").value = lead?.lead_data?.company_name || "";
                document.getElementById("lead-details-form-contact-name").value = lead?.lead_data?.contact_name || "";
                document.getElementById("lead-details-form-email").value = (lead?.lead_data?.emails && lead?.lead_data?.emails[0]) || "";
                document.getElementById("lead-details-form-phone").value = (lead?.lead_data?.phones && lead?.lead_data?.phones[0]) || "";
                document.getElementById("lead-details-form-message").value = lead?.lead_data?.message || "";

                const followUpDate = lead?.lead_data?.next_follow_up_date;

                if (followUpDate) {
                    const dateObj = new Date(followUpDate);
                    const ddmmyyyy = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
                    const yyyymmdd = dateObj.toISOString().split("T")[0];

                    document.getElementById("lead-details-form-next-followup-display").value = ddmmyyyy;
                    document.getElementById("lead-details-form-next-followup").value = yyyymmdd;
                } else {
                    document.getElementById("lead-details-form-next-followup-display").value = "";
                    document.getElementById("lead-details-form-next-followup").value = "";
                }


                const notesContainer = document.getElementById("lead-notes-body");
                notesContainer.innerHTML = "";
                (lead?.lead_data?.lead_notes || []).forEach(note => {
                    const item = document.createElement("div");
                    item.className = "lead-note-item";
                    item.innerHTML = `
                                        <div class="lead-note-text">
                                            <div style="color:black;">${note.note}</div>
                                            <div>Created by: ${note.added_by_name}</div>
                                            <div>On: ${note.created_at}</div>
                                        </div>
                                        <input type="checkbox" class="delete-icon" id="${note.id}">🗑️</span>
                                    `;
                    notesContainer.appendChild(item);
                });

                const proposalContainer = document.getElementById("lead-proposal-body");
                proposalContainer.innerHTML = "";
                (lead?.lead_data?.proposal_links || []).forEach(link => {
                    const item = document.createElement("div");
                    item.className = "lead-proposal-item";
                    item.innerHTML = `
                                        <div class="lead-note-text">
                                            <a href="${link.url}" target="_blank">${link.url_type || "Link"}</a>
                                            <div>Feedback: ${link.audit_feedback}</div>
                                        </div>
                                        <input type="checkbox" class="delete-icon" id="${link.id}">🗑️
                                    `;
                    proposalContainer.appendChild(item);
                });


                const auditContainer = document.getElementById("lead-audit-body");
                auditContainer.innerHTML = "";
                (lead?.lead_data?.audit_links || []).forEach(link => {
                    const item = document.createElement("div");
                    item.className = "lead-audit-item";
                    item.innerHTML = `
                                        <div class="lead-audit-text">
                                            <a href="${link.url}" target="_blank">${link.audit_type || "Link"}</a>
                                            <div>Feedback: ${link.audit_feedback}</div>
                                        </div>
                                        <input type="checkbox" class="delete-icon" id="${link.id}">🗑️
                                    `;
                    auditContainer.appendChild(item);
                });

                const selects = document.querySelectorAll(".lead-details-select");

                selects.forEach(select => {
                    const label = select.previousElementSibling?.innerText?.toLowerCase();
                    if (label.includes("type")) select.value = lead?.lead_data?.type || "";
                    if (label.includes("origin")) select.value = lead?.lead_data?.origin || "";
                    if (label.includes("workflow status")) {
                        const value = lead?.lead_data?.workflow_status;
                        select.value = (value !== undefined && value !== null) ? value : "";
                    }

                    if (label.includes("call status")) select.value = lead?.lead_data?.call_status || "";
                    if (label.includes("industry")) select.value = lead?.lead_data?.industry || "";
                });

                await populateAssigneeDropdownLead();


                previousAssignedIds = (lead?.lead_data?.assigned_to || [])
                    .map(username => usernameToIdMap[username])
                    .filter(id => id !== undefined);


                const select = document.getElementById("lead-details-form-assignee");
                select.innerHTML = "";
                previousAssignedIds.forEach(id => {
                    const user = Object.entries(usernameToIdMap).find(([k, v]) => v === id);
                    const display = user ? user[0] : `User ${id}`;
                    const option = document.createElement("option");
                    option.value = id;
                    option.textContent = display;
                    option.selected = true;
                    select.appendChild(option);
                });
                hideLoaderLeadDetail();
            } catch (error) {
                console.error("Error fetching lead details:", error);
                alert("Failed to load lead details!");
            }
        }

        // let globalAssigneeUserOption = []

        function populateAssigneeDropdownLead() {



            const users = globalAssigneeUserOption;
            const select = document.getElementById("lead-details-form-assignee");
            const currentSelected = Array.from(select.selectedOptions).map(opt => opt.value);
            select.innerHTML = "";

            usernameToIdMap = {};

            users.forEach(user => {
                usernameToIdMap[user.username] = user.id;

                const option = document.createElement("option");
                option.value = user.id;
                option.textContent = `${user.first_name} ${user.last_name}`;

                if (currentSelected.includes(String(user.id))) {
                    option.selected = true;
                }

                select.appendChild(option);
            });


        }

        function enableLeadEdit(event) {
            event.preventDefault();
            const form = document.getElementById("lead-details-form");
            const inputs = form.querySelectorAll("input, select, textarea");
            document.getElementById("star2").disabled = false;

            inputs.forEach(input => {
                input.disabled = false;
            });

            document.getElementById("lead-details-form-next-followup-display").style.display = "none";
            const editableDate = document.getElementById("lead-details-form-next-followup");
            editableDate.style.display = "block";
            editableDate.disabled = false;

            populateAssigneeDropdownLead();
            const origin = document.getElementById("lead-details-form-origin")?.value;
            const currentWorkflowStatus = document.getElementById("lead-details-form-workflow")?.value;
            populateWorkflowStatusOptions(origin, currentWorkflowStatus);

            document.getElementById("submit-lead-edit").style.display = "inline-block";
            document.getElementById("cancel-lead-edit").style.display = "inline-block";
            document.getElementById("edit-lead-btn").style.display = "none";
        }

        function populateWorkflowStatusOptions(origin, selectedStatus) {
            const workflowSelect = document.getElementById("lead-details-form-workflow");
            const isLinkedInLead = origin === "l";

            const allowedStatuses = isLinkedInLead
                ? [0 , 1, 2, 3, 4, 5, 6, 7, 8]
                : [0 , 1, 2, 3, 4, 5, 6, 7, 8];

            const workflowStatusMap = {
                0: "New Lead",
                1: "Contact Attempted",
                2: "Engaged",
                3: "Discovery / Demo Scheduled",
                4: "Discovery / Demo Completed",
                5: "Proposal Sent",
                6: "Closed - Won",
                7: "Closed - Lost",
                8: "Nurture / Recycle",
                // 15: "1st email mesage sent after intial call",
                // 16: "2nd Follow-up",
                // 17: "3rd Follow-up",
                // 18: "Call Unresponsive",
                // 19: "Demo Booked",
                // 20: "Demo completed",
                // 21: "Whatsapp group onboarding",
                // 22: "JD request sent",
                // 23: "Pilot started",
                // 24: "Account setup & interview creation",
                // 25: "Swap confirmed / POC successful",
                // 26: "Email Sent"
            };

            workflowSelect.innerHTML = `<option value="">Select workflow</option>`;

            allowedStatuses.forEach(status => {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = workflowStatusMap[status];
                if (String(status) === String(selectedStatus)) {
                    option.selected = true;
                }
                workflowSelect.appendChild(option);
            });
        }

        function disableLeadEdit(event) {
            if (event) event.preventDefault();
            const form = document.getElementById("lead-details-form");
            const inputs = form.querySelectorAll("input, select, textarea");

            document.getElementById("star2").disabled = true;

            inputs.forEach(input => {
                input.disabled = true;
            });

            const editableDate = document.getElementById("lead-details-form-next-followup");
            editableDate.style.display = "none";
            editableDate.disabled = true;

            document.getElementById("lead-details-form-next-followup-display").style.display = "block";


            document.getElementById("submit-lead-edit").style.display = "none";
            document.getElementById("cancel-lead-edit").style.display = "none";
            document.getElementById("edit-lead-btn").style.display = "inline-block";
        }

        // assignee
        document.getElementById("lead-details-form-assignee").addEventListener("click", function () {
            this.dataset.clicked = "true";
        });
        function toggleNotesDropdown() {
            const body = document.getElementById("lead-notes-body");
            const addlead = document.getElementById("add-lead-notes-body")
            body.style.display = body.style.display === "none" ? "block" : "none";
            addlead.style.display = addlead.style.display === "none" ? "block" : "none";
        }

        function toggleProposalDropdown() {
            const body = document.getElementById("lead-proposal-body");
            const addlead = document.getElementById("add-proposal-link-body")
            body.style.display = body.style.display === "none" ? "block" : "none";
            addlead.style.display = addlead.style.display === "none" ? "block" : "none";
        }

        async function submitLeadEdit(event) {
            event.preventDefault();

            const workflowStatus = document.getElementById("lead-details-form-workflow").value;
            const origin = document.getElementById("lead-details-form-origin").value;
            const callStatus = document.getElementById("lead-details-form-call-status").value;
            const isImportant = document.getElementById("star2").checked;

            const assigneeSelect = document.getElementById("lead-details-form-assignee");
            const interactedWithAssignee = assigneeSelect.dataset.clicked === "true";

            const nextFollowUpDate = document.getElementById("lead-details-form-next-followup").value;

            let add_assignees = [];

            if (interactedWithAssignee) {
                add_assignees = Array.from(assigneeSelect.selectedOptions).map(opt => Number(opt.value));
            } else {
                add_assignees = previousAssignedIds;
            }

            const payload = {
                id: currentEditingLeadId,
                origin,
                call_status: callStatus,
                workflow_status: workflowStatus,
                Mark_Imp: isImportant,
                type: document.getElementById("lead-details-form-type").value,
                add_assignees,
                next_follow_up_date: nextFollowUpDate || null
            };

            try {
                const response = await fetch(`/api/lead-dashboard/${currentEditingLeadId}/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrftoken,
                    },
                    body: JSON.stringify(payload),
                    credentials: "include",
                });

                if (response.ok) {
                    alert("Lead updated successfully!");
                    const updatedDate = document.getElementById("lead-details-form-next-followup").value;
                    if (updatedDate) {
                        const [yyyy, mm, dd] = updatedDate.split("-");
                        const formattedDate = `${dd}-${mm}-${yyyy}`;
                        document.getElementById("lead-details-form-next-followup-display").value = formattedDate;
                    } else {
                        document.getElementById("lead-details-form-next-followup-display").value = "";
                    }

                    disableLeadEdit();
                    fetchTableData(currentPage);
                } else {
                    alert("Failed to update lead!");
                }
            } catch (error) {
                console.error("Error submitting lead edit:", error);
                alert("An error occurred while updating the lead!");
            }
        }


        function takeOverLead() {
            const select = document.getElementById("take-over-select");
            const button = document.getElementById("take-over-lead");


            select.innerHTML = '<option value="" disabled selected>Select user</option>';


            previousAssignedIds.forEach(id => {
                const user = Object.entries(usernameToIdMap).find(([k, v]) => v === id);
                const display = user ? user[0] : `User ${id}`;
                const option = document.createElement("option");
                option.value = id;
                option.textContent = display;
                select.appendChild(option);
            });


            select.style.display = "inline-block";
        }

        document.getElementById("take-over-select").addEventListener("change", async function () {
            const selectedId = this.value;

            const selectedName = this.options[this.selectedIndex].text;
            const confirmed = confirm(`Do you want to Take Over this Lead from "${selectedName}"?`);
            const takeOverOptionbtn = document.getElementById("take-over-select")
            if (!confirmed) {
                this.selectedIndex = 0;

                takeOverOptionbtn.style.display = "none";
                return;
            }

            const payload = {
                take_over: true,
                taker_from: selectedId
            };

            const button = document.getElementById("take-over-lead");
            button.disabled = true;
            button.style.cursor = "not-allowed";
            button.textContent = "Processing...";

            try {
                const response = await fetch(`/api/lead-dashboard/${currentEditingLeadId}/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrftoken,
                    },
                    body: JSON.stringify(payload),
                    credentials: "include",
                });

                if (response.ok) {
                    alert("Take Over successful!");
                    disableLeadEdit();
                    fetchTableData(currentPage);

                    button.disabled = true;
                    button.textContent = "Take Over";
                    button.style.cursor = "not-allowed";

                    takeOverOptionbtn.style.display = "none";
                    const assigneeSelect = document.getElementById("lead-details-form-assignee");
                    assigneeSelect.innerHTML = "";
                    const option = document.createElement("option");
                    option.value = selectedId;
                    option.textContent = selectedName;
                    option.selected = true;
                    assigneeSelect.appendChild(option);


                } else {
                    const errorData = await response.json();
                    alert("Failed to taake Over the lead!");
                    button.disabled = false;
                    button.style.cursor = "pointer";
                    button.textContent = "Take Over";
                    takeOverOptionbtn.style.display = "none";
                }
            } catch (error) {
                console.error("Error during take over", error);
                alert("An error occurred while Taking Over!");
                button.disabled = false;
                button.style.cursor = "pointer";
                button.textContent = "Take Over";
                takeOverOptionbtn.style.display = "none";
            }
        });




        const notesContainer = document.getElementById("lead-notes-body");



        function addNote(noteText = "") {
            const noteEntry = document.createElement("div");
            noteEntry.classList.add("note-entry");

            const input = document.createElement("input");
            input.classList.add("lead-details-select");
            input.type = "text";
            input.placeholder = "enter note";
            input.value = noteText;
            input.style.width = "90%";
            input.style.marginTop = "8px"

            const deleteBtn = document.createElement("span");
            deleteBtn.innerText = "🗑️";
            deleteBtn.onclick = () => {
                noteEntry.remove();
            };

            noteEntry.appendChild(input);
            noteEntry.appendChild(deleteBtn);
            notesContainer.appendChild(noteEntry);
        }

        async function submitNotes() {
            const notes = [];


            const newNoteEntries = document.querySelectorAll(".note-entry input");
            newNoteEntries.forEach(input => {
                const value = input.value.trim();
                if (value) {
                    notes.push({ note: value });
                }
            });


            const deleteCheckboxes = document.querySelectorAll(".lead-note-item input[type='checkbox']");
            deleteCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    notes.push({ id: parseInt(checkbox.id), delete: true });
                }
            });


            try {
                const response = await fetch(`/api/lead-dashboard/${currentEditingLeadId}/`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    body: JSON.stringify({ lead_notes: notes })
                });

                if (response.ok) {
                    alert("Notes updated successfully!");
                    toggleLeadDetails(currentEditingLeadId);
                } else {
                    alert("Failed to update notes.");
                }
            } catch (error) {
                console.error("Error submitting notes:", error);
                alert("An error occurred.");
            }
        }


        function addProposal(link = "", url_type = "", audit_feedback = "") {
            const proposalBody = document.getElementById("lead-proposal-body");

            const entry = document.createElement("div");
            entry.classList.add("proposal-entry");

            entry.innerHTML = `
                                    <input type="text" placeholder="Proposal Link" value="${link}" class="proposal-link lead-details-select" style="width: 90%;" />
                                    
                                    <select class="proposal-url-type lead-details-select" style="width: 90%;">
                                        <option value="" ${url_type === '' ? 'selected' : ''}>----</option>
                                        <option value="marketing_audit" ${url_type === 'marketing_audit' ? 'selected' : ''}>Marketing Audit</option>
                                        <option value="development_audit" ${url_type === 'development_audit' ? 'selected' : ''}>Development Audit</option>
                                        <option value="proposal" ${url_type === 'proposal' ? 'selected' : ''}>Proposal</option>
                                    </select>

                                    <input type="text" placeholder="Audit Feedback" value="${audit_feedback}" class="proposal-feedback lead-details-select" style="width: 90%;" />

                                    <span class="delete-proposal" style="cursor:pointer;">🗑️</span>
                                `;

            entry.querySelector(".delete-proposal").onclick = () => {
                entry.remove();
            };

            proposalBody.appendChild(entry);
        }


        async function submitProposal() {
            const proposals = [];


            document.querySelectorAll(".proposal-entry").forEach(entry => {
                const link = entry.querySelector(".proposal-link")?.value.trim();
                const url_type = entry.querySelector(".proposal-url-type")?.value;
                const feedback = entry.querySelector(".proposal-feedback")?.value.trim();

                if (link) {
                    proposals.push({
                        link,
                        url_type,
                        audit_feedback: feedback || ""
                    });
                }
            });


            document.querySelectorAll(".lead-proposal-item input[type='checkbox']").forEach(checkbox => {
                if (checkbox.checked) {
                    proposals.push({ id: parseInt(checkbox.id), delete: true });
                }
            });


            try {
                const response = await fetch(`/api/lead-dashboard/${currentEditingLeadId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    body: JSON.stringify({ proposal_links: proposals })
                });

                if (response.ok) {
                    alert("Proposal links updated!");
                    toggleLeadDetails(currentEditingLeadId);
                } else {
                    alert("Failed to update proposals.");
                }
            } catch (err) {
                console.error("Error:", err);
                alert("An error occurred.");
            }
        }



        function addAudit(link = "", url_type = "", audit_feedback = "") {
            const auditBody = document.getElementById("lead-audit-body");

            const entry = document.createElement("div");
            entry.classList.add("audit-entry");

            entry.innerHTML = `
                                    <input type="text" placeholder="Audit Link" value="${link}" class="audit-link lead-details-select" style="width: 90%; margin-top:6px;" />
                                    <span class="delete-audit" style="cursor:pointer;">🗑️</span>
                                    <select class="audit-url-type lead-details-select" style="width: 90%; margin-top:6px;">
                                        <option value="" ${url_type === '' ? 'selected' : ''}>----</option>
                                        <option value="marketing_audit" ${url_type === 'marketing_audit' ? 'selected' : ''}>Marketing Audit</option>
                                        <option value="development_audit" ${url_type === 'development_audit' ? 'selected' : ''}>Development Audit</option>
                                       
                                    </select>

                                    <input type="text" placeholder="Audit Feedback" value="${audit_feedback}" class="audit-feedback lead-details-select" style="width: 90%; margin-top:6px;" />

                                    
                                `;

            entry.querySelector(".delete-audit").onclick = () => {
                entry.remove();
            };

            auditBody.appendChild(entry);
        }


        async function submitAudit() {
            const audits = [];


            document.querySelectorAll(".audit-entry").forEach(entry => {
                const link = entry.querySelector(".audit-link")?.value.trim();
                const audit_type = entry.querySelector(".audit-url-type")?.value;
                const feedback = entry.querySelector(".audit-feedback")?.value.trim();

                if (link) {
                    audits.push({
                        link,
                        audit_type,
                        audit_feedback: feedback || ""
                    });
                }
            });


            document.querySelectorAll(".lead-audit-item input[type='checkbox']").forEach(checkbox => {
                if (checkbox.checked) {
                    audits.push({ id: parseInt(checkbox.id), delete: true });
                }
            });


            try {
                const response = await fetch(`/api/lead-dashboard/${currentEditingLeadId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    body: JSON.stringify({ audit_links: audits })
                });

                if (response.ok) {
                    alert("Audit links updated!");
                    toggleLeadDetails(currentEditingLeadId);
                } else {
                    alert("Failed to update audits.");
                }
            } catch (err) {
                console.error("Error:", err);
                alert("An error occurred.");
            }
        }


        // document.getElementById("edit-lead-btn").addEventListener("click", enableLeadEdit);
        // document.getElementById("cancel-lead-edit").addEventListener("click", disableLeadEdit);
        // document.getElementById("submit-lead-edit").addEventListener("click", submitLeadEdit);


        

        function fetchTrackPerfTableData() {
            const url = `/api/business-analysts/`;

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    renderTrackPerfTable('jr-ba-table-body', data.junior_ba);
                    renderTrackPerfTable('ba-table-body', data.business_analyst);

                })
                .catch(err => console.error("Failed to fetch analysts:", err));
        }

        function renderTrackPerfTable(tbodyId, dataList) {
            const tbody = document.getElementById(tbodyId);
            tbody.innerHTML = "";

            dataList.forEach(user => {
                const tr = document.createElement('tr');
                tr.style.height = '40px';
                tr.innerHTML = `
            <td style="cursor: pointer;" onClick="showJrBaDashboard(${user.id})" id="${user.id}">${user.first_name} ${user.last_name}</td>
            <td style="text-align:center;">${user.total_calls}</td>
            <td style="text-align:center;">${user.connected_calls}</td>
            <td style="text-align:center;">${user.num_of_meetings_scheduled}</td>
            <td style="text-align:center;">${user.conversion_ratio} %</td>
        `;
                tbody.appendChild(tr);
            });
        }
       
        const baTabs = document.querySelectorAll('.ba-tab');
        const allTbodyIds = ['jr-ba-table-body', 'ba-table-body',];

        baTabs.forEach(tab => {
            tab.addEventListener('click', () => {

                baTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');


                allTbodyIds.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.style.display = 'none';
                });


                const role = tab.getAttribute('data-role');
                const map = {
                    jr: 'jr-ba-table-body',
                    ba: 'ba-table-body',
                };
                const showId = map[role];
                if (showId) document.getElementById(showId).style.display = 'table-row-group';
            });
        });
   
        function showLoaderInJrbaTable() {
            const tbody = document.getElementById("jrba-lead-table-body");
            const upperdashboard = document.querySelector(".jr-ba-upper-dashboard");

            tbody.innerHTML = `
                                    <tr>
                                        <td colspan="15">
                                            <div class="loading-spinner"></div>
                                        </td>
                                    </tr>
                                `;

            upperdashboard.innerHTML = `
                                    <div style="display: flex; justify-content: center; align-items: center; text-align: center; height: 100px;">
                                        
                                            <div class="loading-spinner"></div>
                                       
                                    </div>
                                `;
        }



        function showJrBaDashboard(userId, page = 1, justPaginate = false) {
            const jrBADashboard = document.querySelector('.jr-ba-dashboard');
            const jrBAUpDashboard = document.querySelector('.jr-ba-upper-dashboard');
            const trackDashboard = document.querySelector('.track-performance-dashboard');

            if (!justPaginate) {

                if (trackDashboard.style.display === 'none' || trackDashboard.style.display === '') {
                    jrBADashboard.style.display = 'none';
                    trackDashboard.style.display = 'flex';
                    fetchTrackPerfTableData();
                    return;
                } else {
                    trackDashboard.style.display = 'none';
                    jrBADashboard.style.display = 'block';
                }
            }
            showLoaderInJrbaTable();

            fetch(`/api/Ba-Dashboard/${userId}?page=${page}`)
                .then(res => res.json())
                .then(data => {
                    const user = data.results.result;
                    const leads = data.results.leads;
                    jrBAUpDashboard.innerHTML = createJrBaDashboardHTML(user, leads);
                    renderJrbaLeadTable(leads);
                    renderPaginationForJrBA(data.current_page, data.total_pages, userId);
                })
                .catch(err => console.error("Failed to load Jr. BA Dashboard:", err));
        }



        // function fetchTableData(page = 1) {
        //     currentPage = page;

        //     let url = `/api/leads/?page=${page}`;
        //     Object.entries(filters).forEach(([key, value]) => {
        //         if (value) url += `&${key}=${value}`;
        //     });
        //     showLoader()
        //     fetch(url)
        //         .then(res => res.json())
        //         .then(data => {
        //             const originCounts = data.results.origin_counts || {};
        //             originSourceMap.forEach(key => {
        //                 const count = originCounts[key] || "-";
        //                 const el = document.getElementById(`count-${key}`);
        //                 if (el) el.textContent = count;
        //             });

        //             renderTable(data.results.results);
        //             renderPagination(data.current_page, data.total_pages);
        //         })
        //         .catch(err => console.error("Failed to fetch leads:", err));
        // }

  function renderJrbaLeadTable(leads) {
    const tbody = document.getElementById("jrba-lead-table-body");
    tbody.innerHTML = "";

    leads.forEach(lead => {
        const statusText = workflowStatusMap[lead.workflow_status] || "-";
        const originValue = originMap[lead.origin] || "-";
        const style = getStatusStyle(statusText);
        
        // Use the new hasActiveActionItems helper
        const safeActionItem = escapeForAttribute(lead.action_item || '');
        const hasActionItem = window.hasActiveActionItems ? 
            window.hasActiveActionItems(lead.action_item) : 
            (lead.action_item && lead.action_item.trim() !== '' && lead.action_item !== '[]');

        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #00000033";
        row.style.height = "40px";
        row.style.backgroundColor = `${lead.Mark_Imp ? "#EBEBEB" : ""}`;

        row.innerHTML = `
            <td><input type="checkbox" class="lead-checkbox" data-id="${lead.id}"/></td>
            <td style="cursor: pointer;" onclick="window.location.href='/lms/lead/${lead.id}'">
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${hasActionItem ? 
                        `<div class="action-indicator" 
                             data-action="${safeActionItem}"
                             style="cursor: pointer; display: flex;">
                            <div class="action-circle red"></div>
                        </div>` : 
                        `<div class="action-indicator" style="width: 12px; height: 12px; display: none;"></div>`
                    }
                    <span class="lead-name-span"
                          ${hasActionItem ? `data-action="${safeActionItem}"` : ''}
                          style="cursor: pointer;">
                        ${lead.full_name || ""}
                    </span>
                </div>
            </td>
            <td>${originValue}</td>
            <td data-status="${statusText}">
                <div style="
                    background-color: ${style.bg};
                    color: ${style.color};
                    border-radius: 3px;
                    padding: 1px 4px;
                    width: fit-content;">${statusText}</div>
            </td>
            <td>${lead.lead_notes_count || "-"}</td>
            <td>${lead.company_name || "-"}</td>
            <td>${lead.contact_name || "-"}</td>
            <td style="padding: 0px 8px;">${lead.emails?.join(", ") || "-"}</td>
            <td>${lead.phones?.join(", ") || "-"}</td>
            <td>${lead.assigned_to?.join(", ") || "-"}</td>
            <td>${lead.created_at || "-"}</td>
            <td>${lead.last_updated_note || "-"}</td>
            <td>${lead.next_follow_up_date || "-"}</td>
        `;
        tbody.appendChild(row);
    });

    // Update selection count and add listeners after rendering table
    updateSelectionCount();
    addCheckboxListeners();
}



        function createJrBaDashboardHTML(user, leads) {
            const date = new Date(user.start_date).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            return `
                        
                        <div >
                            <div
                                style="margin-top: 20px; padding-bottom: 10px; border-bottom: 1px solid #0000003D; height: 316px; display: flex; flex-direction: row;">
                                <div
                                    style="display: flex; background-color: #FFFFFF; border-radius: 15px; border:  1px solid #EAEAEA; flex-direction: row; height: 100%; align-items: center; gap: 10px; padding-left: 10px; width: 30%;">
                                    <div style=" border-radius: 12px; width: 90px; height: 90px; background-color: #7c976a;"></div>
                                    <div>
                                        <div style="color: #171A1F; font-weight: 700; font-size: 24px;">${user.first_name} ${user.last_name}</div>
                                        <div style="color: #171A1F; font-weight: 400; font-size: 15px;"> Role :- Jr. BA
                                        </div>
                                        <div style="color: #171A1F; font-weight: 400; font-size: 15px;">Joining Date :- ${date}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    style="width: 70%; display: flex; flex-direction: column; justify-content: space-between;  padding-left: 8px; padding-top: 8px;">
                                    <div style="display: flex; flex-direction: row; justify-content: space-between;">
                                        <div class="call-card">
                                            <div class="call-icon">
                                                <div class="icon-bg">
                                                    <svg width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.76 9.733a6.824 6.824 0 00-.13-2.657A6.74 6.74 0 0018.85 3.94a6.74 6.74 0 00-3.134-1.779 6.823 6.823 0 00-2.657-.13m3.747 7.283a3.12 3.12 0 00-.881-2.673 3.12 3.12 0 00-2.673-.882" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.487 3.58a1.042 1.042 0 01.91.537l1.275 2.295a1.042 1.042 0 01.021.971L7.465 9.838s.356 1.83 1.845 3.318c1.489 1.488 3.312 1.838 3.312 1.838l2.454-1.227a1.042 1.042 0 01.972.021l2.302 1.28a1.042 1.042 0 01.535.91v2.643c0 1.345-1.25 2.318-2.525 1.887-2.619-.883-6.683-2.566-9.26-5.142-2.576-2.577-4.259-6.642-5.142-9.26-.43-1.276.541-2.526 1.887-2.526h2.642z" fill="#000" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>
                                                </div>
                                            </div>
                                            <div class="call-number">${user.todays_calls}</div>
                                            <div class="call-label">Today’s call made</div>
                                        </div>
                                        <div class="call-card">
                                            <div class="call-icon">
                                                <div class="icon-bg">
                                                    <svg width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.76 9.733a6.824 6.824 0 00-.13-2.657A6.74 6.74 0 0018.85 3.94a6.74 6.74 0 00-3.134-1.779 6.823 6.823 0 00-2.657-.13m3.747 7.283a3.12 3.12 0 00-.881-2.673 3.12 3.12 0 00-2.673-.882" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.487 3.58a1.042 1.042 0 01.91.537l1.275 2.295a1.042 1.042 0 01.021.971L7.465 9.838s.356 1.83 1.845 3.318c1.489 1.488 3.312 1.838 3.312 1.838l2.454-1.227a1.042 1.042 0 01.972.021l2.302 1.28a1.042 1.042 0 01.535.91v2.643c0 1.345-1.25 2.318-2.525 1.887-2.619-.883-6.683-2.566-9.26-5.142-2.576-2.577-4.259-6.642-5.142-9.26-.43-1.276.541-2.526 1.887-2.526h2.642z" fill="#000" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>
                                                </div>
                                            </div>
                                            <div class="call-number">${user.todays_followups}</div>
                                            <div class="call-label">Today’s Follow-up</div>
                                        </div>
                                        <div class="call-card">
                                            <div class="call-icon">
                                                <div class="icon-bg">
                                                    <svg width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.76 9.733a6.824 6.824 0 00-.13-2.657A6.74 6.74 0 0018.85 3.94a6.74 6.74 0 00-3.134-1.779 6.823 6.823 0 00-2.657-.13m3.747 7.283a3.12 3.12 0 00-.881-2.673 3.12 3.12 0 00-2.673-.882" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.487 3.58a1.042 1.042 0 01.91.537l1.275 2.295a1.042 1.042 0 01.021.971L7.465 9.838s.356 1.83 1.845 3.318c1.489 1.488 3.312 1.838 3.312 1.838l2.454-1.227a1.042 1.042 0 01.972.021l2.302 1.28a1.042 1.042 0 01.535.91v2.643c0 1.345-1.25 2.318-2.525 1.887-2.619-.883-6.683-2.566-9.26-5.142-2.576-2.577-4.259-6.642-5.142-9.26-.43-1.276.541-2.526 1.887-2.526h2.642z" fill="#000" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>
                                                </div>
                                            </div>
                                            <div class="call-number">-</div>
                                            <div class="call-label">Monthly leaves</div>
                                        </div>
                                    </div>

                                    <div style="display: flex; flex-direction: row; justify-content: space-between;">
                                        <div class="total-call-card">
                                            <div class="call-icon">
                                                <div class="icon-bg">
                                                    <svg width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.76 9.733a6.824 6.824 0 00-.13-2.657A6.74 6.74 0 0018.85 3.94a6.74 6.74 0 00-3.134-1.779 6.823 6.823 0 00-2.657-.13m3.747 7.283a3.12 3.12 0 00-.881-2.673 3.12 3.12 0 00-2.673-.882" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.487 3.58a1.042 1.042 0 01.91.537l1.275 2.295a1.042 1.042 0 01.021.971L7.465 9.838s.356 1.83 1.845 3.318c1.489 1.488 3.312 1.838 3.312 1.838l2.454-1.227a1.042 1.042 0 01.972.021l2.302 1.28a1.042 1.042 0 01.535.91v2.643c0 1.345-1.25 2.318-2.525 1.887-2.619-.883-6.683-2.566-9.26-5.142-2.576-2.577-4.259-6.642-5.142-9.26-.43-1.276.541-2.526 1.887-2.526h2.642z" fill="#000" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>
                                                </div>
                                            </div>
                                            <div class="call-number">${user.total_calls}</div>
                                            <div class="call-label">Total call made</div>
                                        </div>
                                        <div class="total-call-card">
                                            <div class="call-icon">
                                                <div class="icon-bg">
                                                    <svg width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.76 9.733a6.824 6.824 0 00-.13-2.657A6.74 6.74 0 0018.85 3.94a6.74 6.74 0 00-3.134-1.779 6.823 6.823 0 00-2.657-.13m3.747 7.283a3.12 3.12 0 00-.881-2.673 3.12 3.12 0 00-2.673-.882" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.487 3.58a1.042 1.042 0 01.91.537l1.275 2.295a1.042 1.042 0 01.021.971L7.465 9.838s.356 1.83 1.845 3.318c1.489 1.488 3.312 1.838 3.312 1.838l2.454-1.227a1.042 1.042 0 01.972.021l2.302 1.28a1.042 1.042 0 01.535.91v2.643c0 1.345-1.25 2.318-2.525 1.887-2.619-.883-6.683-2.566-9.26-5.142-2.576-2.577-4.259-6.642-5.142-9.26-.43-1.276.541-2.526 1.887-2.526h2.642z" fill="#000" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>
                                                </div>
                                            </div>
                                            <div class="call-number">${user.connected_calls}</div>
                                            <div class="call-label">Total call Connected</div>
                                        </div>
                                        <div class="total-call-card">
                                            <div class="call-icon">
                                                <div class="icon-bg">
                                                    <svg width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.76 9.733a6.824 6.824 0 00-.13-2.657A6.74 6.74 0 0018.85 3.94a6.74 6.74 0 00-3.134-1.779 6.823 6.823 0 00-2.657-.13m3.747 7.283a3.12 3.12 0 00-.881-2.673 3.12 3.12 0 00-2.673-.882" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.487 3.58a1.042 1.042 0 01.91.537l1.275 2.295a1.042 1.042 0 01.021.971L7.465 9.838s.356 1.83 1.845 3.318c1.489 1.488 3.312 1.838 3.312 1.838l2.454-1.227a1.042 1.042 0 01.972.021l2.302 1.28a1.042 1.042 0 01.535.91v2.643c0 1.345-1.25 2.318-2.525 1.887-2.619-.883-6.683-2.566-9.26-5.142-2.576-2.577-4.259-6.642-5.142-9.26-.43-1.276.541-2.526 1.887-2.526h2.642z" fill="#000" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>
                                                </div>
                                            </div>
                                            <div class="call-number">${user.num_of_meetings_scheduled}</div>
                                            <div class="call-label">No. of meeting scheduled</div>
                                        </div>
                                        <div class="total-call-card">
                                            <div class="call-icon">
                                                <div class="icon-bg">
                                                    <svg width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.76 9.733a6.824 6.824 0 00-.13-2.657A6.74 6.74 0 0018.85 3.94a6.74 6.74 0 00-3.134-1.779 6.823 6.823 0 00-2.657-.13m3.747 7.283a3.12 3.12 0 00-.881-2.673 3.12 3.12 0 00-2.673-.882" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.487 3.58a1.042 1.042 0 01.91.537l1.275 2.295a1.042 1.042 0 01.021.971L7.465 9.838s.356 1.83 1.845 3.318c1.489 1.488 3.312 1.838 3.312 1.838l2.454-1.227a1.042 1.042 0 01.972.021l2.302 1.28a1.042 1.042 0 01.535.91v2.643c0 1.345-1.25 2.318-2.525 1.887-2.619-.883-6.683-2.566-9.26-5.142-2.576-2.577-4.259-6.642-5.142-9.26-.43-1.276.541-2.526 1.887-2.526h2.642z" fill="#000" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>
                                                </div>
                                            </div>
                                            <div class="call-number">${user.conversion_ratio} %</div>
                                            <div class="call-label">Conversion Ratio</div>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>

                    `;
        }

        function renderPaginationForJrBA(current, total, userId) {
            const container = document.getElementById("jrba-pagination-container");
            container.innerHTML = "";

            const maxVisible = 5;
            let start = Math.max(1, current - Math.floor(maxVisible / 2));
            let end = start + maxVisible - 1;

            if (end > total) {
                end = total;
                start = Math.max(1, end - maxVisible + 1);
            }

            if (current > 1) {
                const prevBtn = document.createElement("button");
                prevBtn.textContent = "Prev";
                prevBtn.classList.add("pagination-button");
                prevBtn.addEventListener("click", () => showJrBaDashboard(userId, current - 1, true));
                container.appendChild(prevBtn);
            }

            for (let i = start; i <= end; i++) {
                const btn = document.createElement("button");
                btn.textContent = i;
                btn.classList.add("pagination-button");
                if (i === current) btn.classList.add("active-page");

                btn.addEventListener("click", () => showJrBaDashboard(userId, i, true));
                container.appendChild(btn);
            }

            if (current < total) {
                const nextBtn = document.createElement("button");
                nextBtn.textContent = "Next";
                nextBtn.classList.add("pagination-button");
                nextBtn.addEventListener("click", () => showJrBaDashboard(userId, current + 1, true));
                container.appendChild(nextBtn);
            }
        }



        function buildCard(label, value) {
            return `
                        <div class="total-call-card">
                            <div class="call-icon">
                                <div class="icon-bg">
                                    <img src="call-2-icon.svg" class="icon" />
                                </div>
                            </div>
                            <div class="call-number">${value}</div>
                            <div class="call-label">${label}</div>
                        </div>
                    `;
        }


        //Check all code from here

        let currentCheckData = null;

        function toggleChecksDashboard() {
            const mainDashboard = document.querySelector('.lms-main-dashboard');
            const trackDashboard = document.querySelector('.track-performance-dashboard');
            const jrBADashboard = document.querySelector('.jr-ba-dashboard');
            const checkDashboard = document.querySelector('.checks-main-dashboard');

            if (checkDashboard.style.display === 'none' || checkDashboard.style.display === '') {
                mainDashboard.style.display = 'none';
                jrBADashboard.style.display = 'none';
                trackDashboard.style.display = 'none';
                checkDashboard.style.display = 'block';
                fetchCheckData('morning');
            } else {
                checkDashboard.style.display = 'none';
                jrBADashboard.style.display = 'none';
                mainDashboard.style.display = 'block';
            }
        }

        function fetchCheckData(checkType) {
            const tbody = document.getElementById("check-lead-table-body");
            const loaderRow = document.getElementById("loader-row");
            const noDataRow = document.getElementById("no-data-row");


            loaderRow.style.display = "table-row";
            noDataRow.style.display = "none";
            tbody.querySelectorAll("tr:not(#loader-row):not(#no-data-row)").forEach(tr => tr.remove());

            fetch(`/api/ba-checks/?checktype=${checkType}`)
                .then(res => res.json())
                .then(data => {
                    currentCheckData = data;

                    const firstLowerTab = document.querySelector(`.check-tab-bar-group[data-type="${checkType}"] .check-lower-tab`);
                    if (firstLowerTab) firstLowerTab.click();
                })
                .catch(err => {
                    console.error(`Failed to load data for ${checkType}:`, err);
                    loaderRow.style.display = "none";
                    noDataRow.style.display = "table-row";
                });
        }



        function setupMainTabClicks() {
            const checkTabs = document.querySelectorAll('.check-tab');
            const tabGroups = document.querySelectorAll('.check-tab-bar-group');

            checkTabs.forEach((tab, index) => {
                tab.addEventListener('click', () => {
                    checkTabs.forEach(t => t.classList.remove('main-check-active'));
                    tab.classList.add('main-check-active');

                    const type = ['morning', 'mid-day', 'end-day'][index];


                    tabGroups.forEach(group => {
                        group.style.display = group.dataset.type === type ? 'block' : 'none';
                    });


                    fetchCheckData(type);
                });
            });
        }


        function setupLowerTabClicks() {
            document.querySelectorAll('.check-lower-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    tab.closest('.check-tab-bar').querySelectorAll('.check-lower-tab')
                        .forEach(t => t.classList.remove('check-tab-active'));
                    tab.classList.add('check-tab-active');

                    if (!currentCheckData) return;

                    const textToKeyMap = {
                        "New Leads": "warm_leads",
                        "Pending Follow-up": "pending_followups",
                        "Pending Proposal": "pending_proposals",
                        "IG Pending Follow-up": "ig_pending_followups",

                        "Warm lead": "warm_leads",
                        "IG Warm Leads Followup Updates": "ig_warm_leads_followup_updates",
                        "Pending Follow-ups": "general_leads",

                        "LMS Updation": "warm_leads",
                        "IG Leads": "ig_leads",
                        "Proposal Follow-up": "followup_proposals_sent",


                    };

                    const key = textToKeyMap[tab.innerText.trim()];
                    const leads = currentCheckData[key] || [];

                    renderCheckLeadTable(leads);
                
                });
            });
        }


        setupMainTabClicks();
        setupLowerTabClicks()


        // const checkTabs = document.querySelectorAll('.check-tab');
        // const tabGroups = document.querySelectorAll('.check-tab-bar-group');

        // checkTabs.forEach((tab, index) => {
        //     tab.addEventListener('click', () => {

        //         checkTabs.forEach(t => t.classList.remove('main-check-active'));
        //         tab.classList.add('main-check-active');


        //         const type = ['morning', 'midday', 'eod'][index];

        //         tabGroups.forEach(group => {
        //             group.style.display = group.dataset.type === type ? 'block' : 'none';
        //         });
        //     });
        // });


        // document.querySelectorAll('.check-lower-tab').forEach(tab => {
        //     tab.addEventListener('click', () => {
        //         tab.closest('.check-tab-bar').querySelectorAll('.check-lower-tab').forEach(t => t.classList.remove('check-tab-active'));
        //         tab.classList.add('check-tab-active');
        //     });
        // });



     function renderCheckLeadTable(leads) {
    const tbody = document.getElementById("check-lead-table-body");
    const loaderRow = document.getElementById("loader-row");
    const noDataRow = document.getElementById("no-data-row");

    tbody.querySelectorAll("tr:not(#loader-row):not(#no-data-row)").forEach(tr => tr.remove());

    loaderRow.style.display = "none";

    if (!leads || leads.length === 0) {
        noDataRow.style.display = "table-row";
        return;
    } else {
        noDataRow.style.display = "none";
    }

    leads.forEach(lead => {
        const statusText = workflowStatusMap[lead.workflow_status] || "-";
        const originValue = originMap[lead.origin] || "-";
        const style = getStatusStyle(statusText);
        
        // Use the new hasActiveActionItems helper
        const safeActionItem = escapeForAttribute(lead.action_item || '');
        const hasActionItem = window.hasActiveActionItems ? 
            window.hasActiveActionItems(lead.action_item) : 
            (lead.action_item && lead.action_item.trim() !== '' && lead.action_item !== '[]');

        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #00000033";
        row.style.height = "40px";
        row.style.backgroundColor = `${lead.Mark_Imp ? "#EBEBEB" : ""}`;
        
        row.innerHTML = `
            <td><input type="checkbox" class="lead-checkbox" data-id="${lead.id}"/></td>
            <td style="cursor: pointer;" onclick="window.location.href='/lms/lead/${lead.id}'">
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${hasActionItem ? 
                        `<div class="action-indicator" 
                             data-action="${safeActionItem}"
                             style="cursor: pointer; display: flex;">
                            <div class="action-circle red"></div>
                        </div>` : 
                        `<div class="action-indicator" style="width: 12px; height: 12px; display: none;"></div>`
                    }
                    <span class="lead-name-span"
                          ${hasActionItem ? `data-action="${safeActionItem}"` : ''}
                          style="cursor: pointer;">
                        ${lead.full_name || ""}
                    </span>
                </div>
            </td>
            <td>${originValue}</td>
            <td data-status="${statusText}">
                <div style="
                    background-color: ${style.bg};
                    color: ${style.color};
                    border-radius: 3px;
                    padding: 1px 4px;
                    width: fit-content;">${statusText}</div>
            </td>
            <td>${lead.lead_notes_count}</td>
            <td>${lead.company_name || "-"}</td>
            <td>${lead.contact_name || "-"}</td>
            <td style="padding: 0px 8px;">${lead.emails?.join(", ") || "-"}</td>
            <td>${lead.phones?.join(", ") || "-"}</td>
            <td>${lead.assigned_to?.join(", ") || "-"}</td>
            <td>${lead.created_at || "-"}</td>
            <td>${lead.last_updated_note || "-"}</td>
            <td>${lead.next_follow_up_date || "-"}</td>
        `;
        tbody.appendChild(row);
    });

    // Update selection count and add listeners after rendering table
    updateSelectionCount();
    addCheckboxListeners();
}

        // Function to update selection count displays
        function updateSelectionCount() {
            const totalCheckboxes = document.querySelectorAll('.lead-checkbox').length;
            const selectedCheckboxes = document.querySelectorAll('.lead-checkbox:checked').length;

            // Update all selection count displays
            const selectionTexts = document.querySelectorAll('[id^="selection-count"]');
            selectionTexts.forEach(element => {
                element.textContent = `${selectedCheckboxes} of ${totalCheckboxes} Selected`;
            });
        }

        // Function to add event listeners to checkboxes
        function addCheckboxListeners() {
            const checkboxes = document.querySelectorAll('.lead-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSelectionCount);
            });
        }

        // Function to handle header checkbox toggle (select all/deselect all)
        function handleHeaderCheckboxChange(event) {
            const headerCheckbox = event.target;
            const leadCheckboxes = document.querySelectorAll('.lead-checkbox');

            leadCheckboxes.forEach(checkbox => {
                checkbox.checked = headerCheckbox.checked;
            });

            updateSelectionCount();
        }

        // Add event listeners to all header checkboxes - this is now handled in renderTableHeader

        // Drag and drop handlers for table headers
        let draggedHeaderElement = null;

        function handleHeaderDragStart(e) {
            draggedHeaderElement = this;
            this.classList.add('dragging');
            
            // Add visual feedback to show which element is being dragged
            this.style.opacity = '0.5';
            this.style.transform = 'rotate(2deg)';
            
            // Cross-browser compatibility for dataTransfer
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                // Use plain text instead of HTML for better compatibility
                e.dataTransfer.setData('text/plain', this.dataset.columnKey);
                // Also set text/html for Firefox compatibility
                try {
                    e.dataTransfer.setData('text/html', this.outerHTML);
                } catch (ex) {
                    // Silently handle browsers that don't support text/html
                }
            }
            
            // Highlight all potential drop zones
            const allHeaders = document.querySelectorAll('th.draggable-header');
            allHeaders.forEach(header => {
                if (header !== this) {
                    header.classList.add('drop-zone-active');
                }
            });
        }

        function handleHeaderDragOver(e) {
            // Prevent default behavior to allow drop
            e.preventDefault();
            e.stopPropagation();
            
            // Cross-browser compatibility for dropEffect
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move';
            }
            
            // Add visual feedback
            this.classList.add('drag-over');
            
            return false;
        }

        function handleHeaderDragLeave(e) {
            this.classList.remove('drag-over');
        }

        function handleHeaderDrop(e) {
            // Prevent default behavior and stop propagation
            e.preventDefault();
            e.stopPropagation();
            
            // Remove visual feedback immediately
            this.classList.remove('drag-over');
            
            // Prevent multiple calls by checking if already processing
            if (this.dataset.processing === 'true') {
                return false;
            }
            this.dataset.processing = 'true';
            
            if (draggedHeaderElement && draggedHeaderElement !== this) {
                const config = getColumnConfig();
                const draggedKey = draggedHeaderElement.dataset.columnKey;
                const targetKey = this.dataset.columnKey;
                
                if (draggedKey && targetKey && draggedKey !== targetKey) {
                    const draggedIndex = config.findIndex(col => col.key === draggedKey);
                    const targetIndex = config.findIndex(col => col.key === targetKey);
                    
                    if (draggedIndex !== -1 && targetIndex !== -1) {
                        // Remove the dragged column from its current position
                        const draggedColumn = config.splice(draggedIndex, 1)[0];
                        
                        // Simple and correct logic: always insert at target position
                        // When we remove an element before the target, target index shifts down by 1
                        let insertIndex = targetIndex;
                        
                        // Adjust for the removed element if dragged from left to right
                        if (draggedIndex < targetIndex) {
                            insertIndex = targetIndex;
                        }
                        
                        // Insert the dragged column at the calculated position
                        config.splice(insertIndex, 0, draggedColumn);
                        
                        saveColumnConfig(config);
                        
                        // Use setTimeout to ensure proper re-rendering
                        setTimeout(() => {
                            renderTableHeader();
                            
                            // Re-render table data with new column order
                            if (allFetchedLeads && allFetchedLeads.length > 0) {
                                renderTable(allFetchedLeads);
                            }
                            
                            // Clear processing flag after rendering
                            this.dataset.processing = 'false';
                        }, 10);
                    }
                }
            } else {
                // Clear processing flag if no valid drop
                this.dataset.processing = 'false';
            }
            
            return false;
        }

        function handleHeaderDragEnd(e) {
            // Clean up with a small delay to ensure all events are processed
            setTimeout(() => {
                const headers = document.querySelectorAll('th.draggable-header');
                headers.forEach(header => {
                    // Remove all drag-related classes and styles
                    header.classList.remove('dragging', 'drag-over', 'drop-zone-active');
                    header.style.pointerEvents = ''; // Re-enable pointer events
                    header.style.opacity = ''; // Reset opacity
                    header.style.transform = ''; // Reset transform
                    header.style.backgroundColor = ''; // Reset background
                    header.style.border = ''; // Reset border
                    header.title = ''; // Reset tooltip
                });
                
                draggedHeaderElement = null;
            }, 50);
        }

        // Browser detection utility
        function detectBrowser() {
            const userAgent = navigator.userAgent;
            let browser = 'Unknown';
            
            if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
            else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
            else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
            else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';
            
            return browser;
        }





        // Initialize table columns on page load
        function initializeTableColumns() {
            // Force localStorage initialization for cross-browser compatibility
            try {
                const testKey = 'lmsTableColumnsTest';
                localStorage.setItem(testKey, 'test');
                localStorage.removeItem(testKey);
                
                // Ensure column config is properly initialized
                getColumnConfig();
                
            } catch (e) {
                console.error('localStorage not available:', e);
                alert('Your browser\'s localStorage is disabled. Column customization will not persist.');
            }
            
            renderTableHeader();
        }
        
        // Test function to verify localStorage persistence


        // Render table header based on column config
        function renderTableHeader() {
            const thead = document.querySelector('thead tr');
            const visibleColumns = getVisibleColumns();
            
            if (!thead) {
                console.error('Table header row not found');
                return;
            }
            
            // Clear existing headers
            thead.innerHTML = '';
            
            visibleColumns.forEach(column => {
                const th = document.createElement('th');
                th.style.whiteSpace = 'nowrap';
                th.style.padding = '0px 10px';
                
                if (column.key === 'checkbox') {
                    th.innerHTML = '<input type="checkbox" name="" id="">';
                } else {
                    // Make headers draggable (except checkbox)
                    th.draggable = true;
                    th.classList.add('draggable-header');
                    th.dataset.columnKey = column.key;
                    
                    // Ensure the element is properly set up before adding event listeners
                    th.setAttribute('draggable', 'true');
                    
                    // Add drag event listeners with proper binding
                    const dragStartHandler = function(e) { return handleHeaderDragStart.call(this, e); };
                    const dragOverHandler = function(e) { return handleHeaderDragOver.call(this, e); };
                    const dragLeaveHandler = function(e) { return handleHeaderDragLeave.call(this, e); };
                    const dropHandler = function(e) { return handleHeaderDrop.call(this, e); };
                    const dragEndHandler = function(e) { return handleHeaderDragEnd.call(this, e); };
                    
                    th.addEventListener('dragstart', dragStartHandler, false);
                    th.addEventListener('dragover', dragOverHandler, false);
                    th.addEventListener('dragenter', dragOverHandler, false); // Use same handler for dragenter
                    th.addEventListener('dragleave', dragLeaveHandler, false);
                    th.addEventListener('drop', dropHandler, false);
                    th.addEventListener('dragend', dragEndHandler, false);
                    
                    // Additional compatibility for stubborn browsers
                    th.ondragover = function(e) { 
                        e.preventDefault(); 
                        return false; 
                    };
                    th.ondrop = function(e) { 
                        return handleHeaderDrop.call(this, e); 
                    };
                    
                    // Add mouse events as fallback
                    th.addEventListener('mousedown', function(e) {
                        // Ensure draggable is properly set on mouse interaction
                        this.setAttribute('draggable', 'true');
                        this.draggable = true;
                    });
                    
                    // Touch events for mobile/tablet support and better cross-browser compatibility
                    th.addEventListener('touchstart', function(e) {
                        const touch = e.touches[0];
                        th.dataset.startX = touch.clientX;
                        th.dataset.startY = touch.clientY;
                        th.dataset.isDragging = 'false';
                    });
                    
                    th.addEventListener('touchmove', function(e) {
                        if (th.dataset.isDragging === 'false') {
                            const touch = e.touches[0];
                            const deltaX = Math.abs(touch.clientX - parseFloat(th.dataset.startX));
                            const deltaY = Math.abs(touch.clientY - parseFloat(th.dataset.startY));
                            
                            // If moved more than 10px, start dragging
                            if (deltaX > 10 || deltaY > 10) {
                                th.dataset.isDragging = 'true';
                                e.preventDefault(); // Prevent scrolling
                                
                                // Visual feedback
                                th.style.opacity = '0.5';
                                th.style.transform = `translate(${touch.clientX - parseFloat(th.dataset.startX)}px, ${touch.clientY - parseFloat(th.dataset.startY)}px)`;
                            }
                        } else {
                            e.preventDefault();
                            const touch = e.touches[0];
                            th.style.transform = `translate(${touch.clientX - parseFloat(th.dataset.startX)}px, ${touch.clientY - parseFloat(th.dataset.startY)}px)`;
                        }
                    });
                    
                    th.addEventListener('touchend', function(e) {
                        if (th.dataset.isDragging === 'true') {
                            // Reset visual feedback
                            th.style.opacity = '';
                            th.style.transform = '';
                            
                            // Find drop target
                            const touch = e.changedTouches[0];
                            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                            
                            if (elementBelow && elementBelow.classList.contains('draggable-header') && elementBelow !== th) {
                                // Simulate drop event
                                const fakeEvent = {
                                    dataTransfer: {
                                        getData: () => th.dataset.columnKey,
                                        types: ['text/plain']
                                    },
                                    target: elementBelow,
                                    preventDefault: () => {},
                                    stopPropagation: () => {}
                                };
                                handleHeaderDrop.call(elementBelow, fakeEvent);
                            }
                        }
                        th.dataset.isDragging = 'false';
                    });
                    
                    // Ensure the element can receive drop events
                    th.ondragover = function(e) { e.preventDefault(); return false; };
                    th.ondrop = function(e) { return handleHeaderDrop.call(this, e); };
                    
                    if (column.sortable) {
                        console.log(column);
                        
                        th.id = getHeaderId(column.key);
                        th.innerHTML = `
                            ${column.label}
                            <span class="sort-arrow down-arrow">▼</span>
                            <span class="sort-arrow up-arrow">▲</span>
                        `;
                        th.classList.add('date-header');
                        
                        // Add click handler for sorting (separate from drag events)
                        let clickTimeout;
                        th.addEventListener('click', function(e) {
                            // Clear any existing timeout
                            clearTimeout(clickTimeout);
                            
                            // Add small delay to prevent conflicts with drag operations
                            clickTimeout = setTimeout(() => {
                                // Only trigger sort if we're not dragging
                                if (!draggedHeaderElement) {
                                    onHeaderClick(column.sortKey, getHeaderId(column.key));
                                }
                            }, 10);
                        });
                    } else {
                        th.textContent = column.label;
                    }
                }
                
                thead.appendChild(th);
            });
            
            // Re-add header checkbox listener
            const headerCheckbox = thead.querySelector('input[type="checkbox"]');
            if (headerCheckbox) {
                headerCheckbox.addEventListener('change', handleHeaderCheckboxChange);
            }
            
            // Verify all draggable headers are properly set up
            setTimeout(() => {
                const draggableHeaders = document.querySelectorAll('th.draggable-header');
                draggableHeaders.forEach((header, index) => {
                    // Ensure all properties are properly set
                    if (!header.draggable) {
                        header.draggable = true;
                        header.setAttribute('draggable', 'true');
                    }
                    
                    // Verify dataset is properly set
                    if (!header.dataset.columnKey) {
                        console.error('Column key missing for header:', header);
                    }
                });
            }, 50);
        }

        function getHeaderId(columnKey) {
            const idMap = {
                'created_at': 'created-at-header',
                'updated_at': 'updated-at-header', 
                'last_updated_note': 'last-updated-note-header',
                'next_follow_up': 'next-follow-up-header'
            };
            return idMap[columnKey] || columnKey + '-header';
        }

        // Debug function to check all draggable headers
        function checkDraggableHeaders() {
            const headers = document.querySelectorAll('th.draggable-header');
            console.log(`Found ${headers.length} draggable headers:`);
            
            headers.forEach((header, index) => {
                console.log(`${index + 1}. ${header.dataset.columnKey}: draggable=${header.draggable}, hasClass=${header.classList.contains('draggable-header')}`);
            });
            
            return headers.length;
        }
        
        // Make debug function available globally
        window.checkDraggableHeaders = checkDraggableHeaders;

        // Add CSS styles for action indicators
        const actionStyles = document.createElement('style');
        actionStyles.textContent = `
            .action-circle {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                transition: all 0.3s ease;
                flex-shrink: 0;
                border: 2px solid transparent;
            }
            
            .action-circle.red {
                background-color: #ff4444;
                border-color: #ff2222;
                box-shadow: 0 0 8px rgba(255, 68, 68, 0.5);
            }
            
            .action-indicator {
                padding: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .action-indicator:hover .action-circle {
                transform: scale(1.4);
            }
            
            .action-indicator:hover .action-circle.red {
                box-shadow: 0 0 12px rgba(255, 68, 68, 0.8);
                background-color: #ff2222;
            }
        `;
        document.head.appendChild(actionStyles);



// ============================================
// NEW ACTION ITEM TOOLTIP SYSTEM
// ============================================

class ActionTooltip {
    constructor() {
        this.tooltip = null;
        this.init();
    }

    init() {
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'action-item-tooltip';
        this.tooltip.className = 'action-tooltip';
        
        this.tooltip.style.cssText = `
            position: fixed;
            display: none;
            background: #ffffff;
            color: #2c3e50;
            padding: 0;
            border-radius: 8px;
            font-size: 13px;
            max-width: 400px;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            border: 1px solid #e0e0e0;
        `;
        
        document.body.appendChild(this.tooltip);
    }

    parseActionItems(rawText) {
        if (!rawText || rawText.trim() === '') return [];
        
        try {
            // Try to parse as JSON array
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed)) {
                // Filter out completed items (done: true)
                return parsed.filter(item => !item.done);
            }
            return [];
        } catch (e) {
            // If not JSON, treat as plain text
            return [{ text: rawText, done: false }];
        }
    }

    formatActionItems(items) {
        if (!items || items.length === 0) return null;
        
        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 14px;
            font-weight: 600;
            border-radius: 8px 8px 0 0;
            font-size: 12px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        `;
        header.textContent = `Action Items (${items.length})`;
        
        // Create items list
        const list = document.createElement('div');
        list.style.cssText = `
            padding: 8px 0;
            max-height: 300px;
            overflow-y: auto;
        `;
        
        items.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.style.cssText = `
                padding: 10px 14px;
                border-bottom: 1px solid #f0f0f0;
                display: flex;
                gap: 10px;
                align-items: start;
                transition: background 0.2s;
            `;
            
            // Add hover effect
            itemEl.onmouseenter = () => itemEl.style.background = '#f8f9fa';
            itemEl.onmouseleave = () => itemEl.style.background = 'transparent';
            
            // Remove border from last item
            if (index === items.length - 1) {
                itemEl.style.borderBottom = 'none';
            }
            
            // Bullet point
            const bullet = document.createElement('div');
            bullet.style.cssText = `
                width: 6px;
                height: 6px;
                background: #667eea;
                border-radius: 50%;
                margin-top: 6px;
                flex-shrink: 0;
            `;
            
            // Text content
            const text = document.createElement('div');
            text.style.cssText = `
                flex: 1;
                line-height: 1.6;
                color: #2c3e50;
                word-wrap: break-word;
            `;
            text.textContent = item.text || item;
            
            itemEl.appendChild(bullet);
            itemEl.appendChild(text);
            list.appendChild(itemEl);
        });
        
        const container = document.createElement('div');
        container.appendChild(header);
        container.appendChild(list);
        
        return container;
    }

    show(element, rawText) {
        if (!rawText || rawText.trim() === '') {
            this.hide();
            return;
        }
        
        // Parse and filter action items
        const items = this.parseActionItems(rawText);
        
        if (items.length === 0) {
            this.hide();
            return;
        }
        
        // Clear and rebuild tooltip content
        this.tooltip.innerHTML = '';
        const content = this.formatActionItems(items);
        
        if (!content) {
            this.hide();
            return;
        }
        
        this.tooltip.appendChild(content);
        
        // Add arrow
        const arrow = document.createElement('div');
        arrow.className = 'tooltip-arrow';
        arrow.style.cssText = `
            position: absolute;
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid #667eea;
            top: -10px;
            left: 20px;
        `;
        this.tooltip.appendChild(arrow);
        
        this.tooltip.style.display = 'block';
        this.position(element);
    }

    position(element) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        let left = rect.left;
        let top = rect.bottom + 12;
        
        // Adjust if tooltip goes off screen (right side)
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        // Adjust if tooltip goes off screen (left side)
        if (left < 10) {
            left = 10;
        }
        
        // Adjust arrow position based on element position
        const arrow = this.tooltip.querySelector('.tooltip-arrow');
        if (arrow) {
            const arrowLeft = Math.max(10, Math.min(rect.left - left + (rect.width / 2) - 10, tooltipRect.width - 30));
            arrow.style.left = arrowLeft + 'px';
        }
        
        // If tooltip goes off bottom of screen, show above instead
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = rect.top - tooltipRect.height - 12;
            
            if (arrow) {
                arrow.style.cssText = `
                    position: absolute;
                    width: 0;
                    height: 0;
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-top: 10px solid #ffffff;
                    bottom: -10px;
                    top: auto;
                    left: ${arrow.style.left};
                `;
            }
        }
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    }

    hide() {
        this.tooltip.style.display = 'none';
    }

    destroy() {
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
    }
}

// ============================================
// TOOLTIP MANAGER
// ============================================

class TooltipManager {
    constructor() {
        this.tooltip = new ActionTooltip();
        this.activeElement = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('mouseover', (e) => {
            const actionIndicator = e.target.closest('.action-indicator[data-action]');
            const leadName = e.target.closest('.lead-name-span[data-action]');
            
            const targetElement = actionIndicator || leadName;
            
            if (targetElement) {
                const actionText = targetElement.dataset.action;
                if (actionText) {
                    this.activeElement = targetElement;
                    this.tooltip.show(targetElement, actionText);
                }
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const actionIndicator = e.target.closest('.action-indicator[data-action]');
            const leadName = e.target.closest('.lead-name-span[data-action]');
            
            if (actionIndicator || leadName) {
                this.activeElement = null;
                this.tooltip.hide();
            }
        });
        
        document.addEventListener('scroll', () => {
            if (this.activeElement) {
                this.tooltip.hide();
                this.activeElement = null;
            }
        }, true);
    }

    destroy() {
        this.tooltip.destroy();
    }
}

// ============================================
// HELPER: Update Action Indicator Visibility
// ============================================

function updateActionIndicatorVisibility(element, rawActionText) {
    if (!element) return;
    
    // Check if rawActionText is empty, null, or whitespace
    if (!rawActionText || rawActionText.trim() === '') {
        element.style.display = 'none';
        return;
    }
    
    try {
        const parsed = JSON.parse(rawActionText);
        
        // Check if it's an array
        if (Array.isArray(parsed)) {
            // If empty array, hide indicator
            if (parsed.length === 0) {
                element.style.display = 'none';
                return;
            }
            
            // Filter out completed tasks
            const activeTasks = parsed.filter(item => !item.done);
            
            // If no active tasks, hide the indicator
            if (activeTasks.length === 0) {
                element.style.display = 'none';
            } else {
                element.style.display = 'flex';
            }
        } else {
            // Not an array, hide it
            element.style.display = 'none';
        }
    } catch (e) {
        // If JSON parse fails, treat as plain text
        if (rawActionText && rawActionText.trim() !== '' && rawActionText !== '[]') {
            element.style.display = 'flex';
        } else {
            element.style.display = 'none';
        }
    }
}

// ============================================
// HELPER: Check if Lead Has Active Actions
// ============================================

function hasActiveActionItems(rawActionText) {
    if (!rawActionText || rawActionText.trim() === '' || rawActionText === '[]') {
        return false;
    }
    
    try {
        const parsed = JSON.parse(rawActionText);
        if (Array.isArray(parsed)) {
            const activeTasks = parsed.filter(item => !item.done);
            return activeTasks.length > 0;
        }
        return false;
    } catch (e) {
        return rawActionText.trim() !== '';
    }
}

// ============================================
// INITIALIZATION
// ============================================

let actionTooltipManager = null;

function initActionTooltips() {
    if (actionTooltipManager) {
        actionTooltipManager.destroy();
    }
    
    actionTooltipManager = new TooltipManager();
    
    // Update visibility of all action indicators
    document.querySelectorAll('.action-indicator[data-action]').forEach(indicator => {
        const actionText = indicator.dataset.action;
        updateActionIndicatorVisibility(indicator, actionText);
    });
    
    console.log('✓ Action tooltip system initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActionTooltips);
} else {
    initActionTooltips();
}

window.initActionTooltips = initActionTooltips;
window.updateActionIndicatorVisibility = updateActionIndicatorVisibility;
window.hasActiveActionItems = hasActiveActionItems;
