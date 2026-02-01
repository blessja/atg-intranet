

const originSourceMap = ["i", "w", "cw", "l"];
let currentPage = 1;
let filters = {};

let allLeads = [];
let globalAssigneeUserOption = [];
let allTags = [];
let currentLeadTags = [];
// const originMap = {
//     'w': `<img src="{% static 'images/banao.png' %}" alt="Website" width="20" />`,
//     'l': `<img src="{% static 'images/linkedin.png' %}" alt="Website" width="20" />`,
//     'i': `<img src="{% static 'images/insta.png' %}" alt="Website" width="20" />`,
//     'cw': `<img src="{% static 'images/website.png' %}" alt="Website" width="20" />`,
//     't': 'Twitter',
//     'g': 'GitHub',
// };
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
    // 9: "Soft Confirmed",
    // 11: "Confirmed",
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

const callStatusMap = {
    'call_didnot_pickup': `Call Didn't Pickup`,
    'call_connected': 'Call Connected',
    'call_failed': 'Call Failed',
};

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
        // case "1st email mesage sent after intial call": return { bg: "#FFFAEB", color: "#DC6803B2" };
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


function getCallStatusStyle(status) {
    switch (status) {
        case "Call Didn't Pickup": return { bg: "#FFFAEB", color: "#DC6803B2" };
        case "Call Connected": return { bg: "#ECFDF3", color: "#17B26AE5" };
        case "Call Failed": return { bg: "#FEF8F2", color: "#FF5C00" };
        default: return { bg: "#FFFFFF", color: "#000000" };
    }
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
    const users = globalAssigneeUserOption || [];

    const desktopContainer = document.getElementById("assigned-list");
    const mobileContainer = document.getElementById("mobile-assigned-list");

    if (!desktopContainer && !mobileContainer) return;

    [desktopContainer, mobileContainer].forEach(container => {
        if (!container) return;
        container.innerHTML = "";
        users.forEach(user => {
            const label = document.createElement("label");
            label.style.display = "block";

            const input = document.createElement("input");
            input.type = "checkbox";
            input.value = user.id;
            input.onchange = updateAssignedFilter;

            label.appendChild(input);
            label.append(` ${user.first_name}`);
            container.appendChild(label);
        });
    });
}



let isAssigneeFilterPopulated = false;

function fetchTableData(page = 1) {
    currentPage = page;
    console.log(filters)
    let url = `/api/leads/?page=${page}`;
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

    // If we're on track-performance, don't reset to /lms/
    if (!currentPath.includes("lead")) {
        let newUrl = currentPath.includes("track-performance")
            ? `/lms/lead/${lead.id}`
            : `/lms/?${filterString}`;

        window.history.replaceState(null, '', newUrl);
    }

    const fetchUrl = `/api/leads/?${filterString}`;
    console.log("Fetching", fetchUrl);
    fetch(fetchUrl)
        .then(res => res.json())
        .then(data => {
            globalAssigneeUserOption = data.results?.bussiness_analyst_users || [];
            if (!isAssigneeFilterPopulated && globalAssigneeUserOption.length > 0) {
                populateAssignedToFilter();
                isAssigneeFilterPopulated = true;
            }
            const originCounts = data.results.origin_counts || {};
            originSourceMap.forEach(key => {
                const count = originCounts[key] || "-";
                const el = document.getElementById(`count-${key}`);
                if (el) el.textContent = count;
            });

            renderTable(data.results.results);
            renderPagination(data.current_page, data.total_pages);
            // populateAssignedToFilter();
        })
        .catch(err => console.error("Failed to fetch leads:", err));
}

function renderTable(leads) {
    const tbody = document.getElementById("lead-table-body");
    if (!tbody) {
        console.error("Table tbody element not found");
        return;
    }
    tbody.innerHTML = "";
    allLeads = leads;
    leads.forEach(lead => {
        const statusText = workflowStatusMap[lead.workflow_status] || "-";
        const originValue = originMap[lead.origin] || "-";
        const style = getStatusStyle(statusText);
        const callStatusText = callStatusMap[lead.call_status] || "-";
        const callstyle = getCallStatusStyle(callStatusText);

        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #00000033";
        row.style.height = "40px";
        row.style.backgroundColor = `${lead.Mark_Imp ? "#EBEBEB" : ""}`
        const last_updated_note = lead.last_updated_note ?
            new Date(lead.last_updated_note).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
            }) : "-";

        row.innerHTML = `
                                    <td><input type="checkbox" class="lead-checkbox" data-id="${lead.id}"/></td>
                                    <td onClick="window.location.href='/lms/lead/${lead.id}'" style="cursor: pointer;">${lead.full_name || ""}</td>
                                    <td>${lead.type || ""}</td>
                                    <td>${originValue}</td>
                                    <td data-status="${statusText}">
                                        <div style="
                                            background-color: ${style.bg};
                                            color: ${style.color};
                                            border-radius: 3px;
                                            padding: 1px 4px;
                                            width: fit-content;">${statusText}</div>
                                    </td>
                                    <td>
  <span 
    class="lead-notes-hover" 
    data-notes='${JSON.stringify(lead.lead_notes || [])}'
    style="cursor: pointer; text-decoration: underline;">
    ${lead.lead_notes_count || "-"}
  </span>
</td>

                                    <td data-callstatus="${callStatusText}">
                                        <div style="
                                            background-color: ${callstyle.bg};
                                            color: ${callstyle.color};
                                            border-radius: 3px;
                                            padding: 1px 4px;
                                            width: fit-content;">${callStatusText}</div>
                                    </td>
                                    <td>${lead.company_name || "-"}</td>
                                    
                                    <td style="padding: 0px 8px;">${lead.emails?.join(", ") || "-"}</td>
                                    <td> ${lead.proposal_links && lead.proposal_links.length > 0
                ? lead.proposal_links.map(link => `<a href="${link.url}" target="_blank">${link.url_type || "Link"}</a>`).join(", ")
                : "-"
            }
                                    </td>

                                    <td> ${lead.audit_links && lead.audit_links.length > 0
                ? lead.audit_links.map(link => `<a href="${link.url}" target="_blank">${link.audit_type || "Link"}</a>`).join(", ")
                : "-"
            }
                                    </td>
                                    <td>${lead.phones?.join(", ") || "-"}</td>
                                    <td>${lead.assigned_to?.join(", ") || "-"}</td>
                                    <td>${lead.industry || "-"}</td>
                                    <td>${lead.created_at || "-"}</td>
                                    <td>${lead.updated_at || "-"}</td>
                                    <td>${last_updated_note || "-"}</td>
                                    <td>${lead.next_follow_up_date || "-"}</td>
                                `;
        tbody.appendChild(row);
    });

    // Update selection count and add listeners after rendering table
    updateSelectionCount();
    addCheckboxListeners();
    attachNoteHoverListeners();
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


    if (current > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Prev";
        prevBtn.classList.add("pagination-button");
        prevBtn.addEventListener("click", () => fetchTableData(current - 1));
        container.appendChild(prevBtn);
    }


    for (let i = start; i <= end; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.add("pagination-button");
        if (i === current) btn.classList.add("active-page");

        btn.addEventListener("click", () => fetchTableData(i));
        container.appendChild(btn);
    }


    if (current < total) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next";
        nextBtn.classList.add("pagination-button");
        nextBtn.addEventListener("click", () => fetchTableData(current + 1));
        container.appendChild(nextBtn);
    }
}

function toggleMoreDropdown() {
    const dropdown = document.getElementById("more-dropdown");
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
}



function getSelectedLeadIds() {
    const checkboxes = document.querySelectorAll(".lead-checkbox:checked");
    return Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
}

function markasIMP(lead_id){
    const star2 = document.getElementById("star2");
    const isImp=star2.dataset.imp;
    const leads =[{ lead_id, Mark_Imp: isImp === 'true' ? false : true }];

    const confirmed = confirm("Do you want to mark selected leads as important?");
    if (!confirmed) return;
    console.log(leads,isImp);
    star2.dataset.imp=leads[0].Mark_Imp
    
    sendBulkUpdate(leads);
    if(leads[0].Mark_Imp){
        console.log(leads[0].Mark_Imp);
        
        star2.checked=true;
    }else{
        console.log(leads[0].Mark_Imp);
        star2.checked=false;
    }
    
}

function bulkMarkImportant() {
    const ids = getSelectedLeadIds();
    if (!ids.length) return alert("Select at least one lead first.");

    const confirmed = confirm("Do you want to mark selected leads as important?");
    if (!confirmed) return;

    const leads = ids.map(id => ({ lead_id: id, Mark_Imp: true }));
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
    // { value: 9, label: "Soft Confirmed" },
    // { value: 26, label: "Email Sent" },
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
    // { value: 15, label: "1st email mesage sent after intial call" },
    // { value: 16, label: "2nd Follow-up" },
    // { value: 17, label: "3rd Follow-up" },
    // { value: 18, label: "Call Unresponsive" },
    // { value: 19, label: "Demo Booked" },
    // { value: 20, label: "Demo completed" },
    // { value: 21, label: "Whatsapp group onboarding" },
    // { value: 22, label: "JD request sent" },
    // { value: 23, label: "Pilot started" },
    // { value: 24, label: "Account setup & interview creation" },
    // { value: 25, label: "Swap confirmed / POC successful" },
    // { value: 1, label: "Contact Attempted" },
    // { value: 5, label: "Proposal Sent" },
    // { value: 0, label: "New Lead" },
    // { value: 26, label: "Email Sent" },
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

    const statusLabel = callStatusMap[status] || "selected status";

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


/* =========================================
   ACTION CHECKLIST LOGIC (Always Editable)
   ========================================= */

let currentActionList = [];

// 1. Initialize
function initActionChecklist(jsonString) {
    try {
        if (jsonString && jsonString.trim() !== "" && (jsonString.startsWith('[') || jsonString.startsWith('{'))) {
            currentActionList = JSON.parse(jsonString);
        } else if (jsonString && jsonString.trim() !== "") {
            // Handle old text data by making it a checklist item
            currentActionList = [{ text: jsonString, done: false }];
        } else {
            currentActionList = [];
        }
    } catch (e) {
        currentActionList = jsonString ? [{ text: jsonString, done: false }] : [];
    }
    renderActionChecklist();
}

// 2. Render List
function renderActionChecklist() {
    const container = document.getElementById('action-list-container');
    if (!container) return;
    
    container.innerHTML = '';

    currentActionList.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'action-item-row';
        
        // Checkbox (Always enabled)
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'action-item-checkbox';
        checkbox.checked = item.done;
        checkbox.onclick = () => toggleActionItem(index);

        // Text
        const textSpan = document.createElement('div');
        textSpan.className = `action-item-text ${item.done ? 'done' : ''}`;
        textSpan.textContent = item.text;

        // Delete Button (Always visible)
        const delBtn = document.createElement('span');
        delBtn.className = 'action-item-delete';
        delBtn.innerHTML = '🗑️'; 
        delBtn.onclick = () => deleteActionItem(index);

        row.appendChild(checkbox);
        row.appendChild(textSpan);
        row.appendChild(delBtn);
        container.appendChild(row);
    });
}

// 3. Add New Item
function addNewActionItem() {
    const input = document.getElementById('new-action-input');
    const text = input.value.trim();
    if (!text) return;

    currentActionList.push({ text: text, done: false });
    input.value = '';
    
    syncActionData(); 
}

// 4. Toggle Status
function toggleActionItem(index) {
    currentActionList[index].done = !currentActionList[index].done;
    syncActionData();
}

// 5. Delete Item
function deleteActionItem(index) {
    currentActionList.splice(index, 1);
    syncActionData();
}

// 6. Sync to hidden textarea & Auto-Save
function syncActionData() {
    const textarea = document.getElementById('lead-details-form-action');
    if (!textarea) return;

    // Convert list to JSON string
    textarea.value = JSON.stringify(currentActionList);
    
    // Update UI
    renderActionChecklist();

    // Trigger existing auto-save
    const event = new Event('change', { bubbles: true });
    textarea.dispatchEvent(event);

    // Update the cached lead if we're on the dashboard
if (typeof allLeads !== 'undefined' && currentEditingLeadId) {
    const cachedLead = allLeads.find(lead => lead.id === currentEditingLeadId);
    if (cachedLead) {
        cachedLead.action_item = textarea.value;
    }
}
}

// Dummy function to prevent errors if called elsewhere
function toggleActionChecklistMode(isEditable) {
    // Intentionally empty to keep checklist always active
}


document.addEventListener("click", function (e) {
    const dropdown = document.getElementById("assignee-dropdown");
    const button = document.getElementById("change-assignee-btn");


    if (dropdown && button && !dropdown.contains(e.target) && !button.contains(e.target)) {
        dropdown.style.display = "none";
    }
});


document.querySelectorAll(".mark-imp-filter").forEach(select => {
    select.addEventListener("change", e => {
        filters.mark_imp = e.target.value;
        fetchTableData(1);
    });
});




// document.querySelectorAll(".by-assigned-filter").forEach(select => {
//     select.addEventListener("change", e => {
//         filters.assigned_to = e.target.value;
//         fetchTableData(1);
//     });
// });

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


document.addEventListener("click", function (event) {
    const mobileDropdown = document.getElementById("mobile-assigned-to-filter");
    if (mobileDropdown && !mobileDropdown.contains(event.target)) {
        document.getElementById("mobile-assigned-list").classList.add("hidden");
    }

    const desktopDropdown = document.getElementById("assigned-to-filter");
    if (desktopDropdown && !desktopDropdown.contains(event.target)) {
        document.getElementById("assigned-list").classList.add("hidden");
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
    // Workflow Filter
    const wfDesktop = document.getElementById("workflow-status-filter");
    if (wfDesktop && !wfDesktop.contains(event.target)) {
        const list = document.getElementById("workflow-list");
        if(list) list.classList.add("hidden");
    }

    const wfMobile = document.getElementById("mobile-workflow-status-filter");
    if (wfMobile && !wfMobile.contains(event.target)) {
        const list = document.getElementById("mobile-workflow-list");
        if(list) list.classList.add("hidden");
    }

    // Origin Filter (Fixed the crash here)
    const originDesktop = document.getElementById("lead-origin-filter");
    if (originDesktop && !originDesktop.contains(event.target)) {
        const list = document.getElementById("lead-origin-list");
        if(list) list.classList.add("hidden");
    }

    const originMobile = document.getElementById("mobile-lead-origin-filter");
    if (originMobile && !originMobile.contains(event.target)) {
        const list = document.getElementById("mobile-origin-list");
        if(list) list.classList.add("hidden");
    }
});



function toggleMobileWorkflowDropdown() {
    document.getElementById("mobile-workflow-list").classList.toggle("hidden");
}


document.querySelectorAll(".call-status-filter").forEach(select => {
    select.addEventListener("change", e => {
        filters.call_status = e.target.value;
        fetchTableData(1);
    });
});

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
    if (dropdown && !dropdown.contains(event.target)) {
        document.getElementById("lead-origin-list").classList.add("hidden");
    }
});


document.addEventListener("click", function (event) {
    const workflowDropdown = document.getElementById("workflow-status-filter");
    if (workflowDropdown && !workflowDropdown.contains(event.target)) {
        document.getElementById("workflow-list").classList.add("hidden");
    }

    const originDropdown = document.getElementById("lead-origin-filter");
    if (originDropdown && !originDropdown.contains(event.target)) {
        document.getElementById("lead-origin-list").classList.add("hidden");
    }
});



function initFiltersFromURL() {

    const params = new URLSearchParams(window.location.search);


    if (params.has('call_status')) {
        const val = params.get('call_status');
        filters.call_status = val;

        document.querySelectorAll(".call-status-filter").forEach(select => {
            select.value = val;
        });
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


initFiltersFromURL();
// fetchTableData();

function closeLeadDetails() {
    // document.querySelector('.lms-main-dashboard').style.display = 'block';

    document.querySelector('.lead-details-dashboard').style.display = 'none';

    if (previousDashboard === "lms") {
        document.querySelector('.lms-main-dashboard').style.display = 'block';
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

        // If globalAssigneeUserOption is empty, fetch it
       if (!globalAssigneeUserOption || globalAssigneeUserOption.length === 0) {
    if (window.GLOBAL_BA_USERS && window.GLOBAL_BA_USERS.length > 0) {
        globalAssigneeUserOption = window.GLOBAL_BA_USERS;
    } else {
        // Do NOT call /api/leads/ here — it is slow.
        // If you really want a fallback API, create a lightweight endpoint that returns only BA users,
        // then call that (e.g. /api/ba-users/). For now, we skip fetching to avoid the slow call.
        console.warn("BA users not available from template; skipping slow /api/leads/ fetch.");
    }
}

        const button = document.getElementById("take-over-lead");
        displayTags(lead?.lead_data?.tags || []);

        if (lead?.user_group === "Business analyst") {
            button.style.display = "block";

            const isTaken = !!lead?.lead_data?.takeover_from;
            button.disabled = isTaken;
            button.style.cursor = isTaken ? "not-allowed" : "pointer";
        } else {
            button.style.display = "none";
        }

        // ... rest of your existing code for populating form fields ...
        document.getElementById("lead-details-form-client-name").innerText = lead?.lead_data?.full_name || "";
        document.getElementById("lead-details-form-updatedAt").innerText = lead?.lead_data?.updated_at || "";
        document.getElementById("lead-details-form-createdAt").innerText = lead?.lead_data?.created_at || "";
        document.getElementById("lead-details-form-call-icon").href = lead?.lead_data?.phones?.[0]
            ? `tel:${lead.lead_data.phones[0]}`
            : "#";
        const star2 = document.getElementById("star2");
        document.getElementById("origin-container").innerHTML = originMap[lead?.lead_data?.origin] || "-";

        if (star2) {
            const markImp = lead?.lead_data?.Mark_Imp || false;
            star2.checked = !!markImp;
            star2.dataset.imp = markImp;
        }

        document.getElementById("lead-details-form-company-name").innerText = lead?.lead_data?.company_name || "N/A";
        document.getElementById("lead-details-form-contact-name").innerText = lead?.lead_data?.contact_name || "N/A";
        document.getElementById("lead-details-form-email").innerText = (lead?.lead_data?.emails && lead?.lead_data?.emails[0]) || "N/A";
        document.getElementById("lead-details-form-phone").innerText = (lead?.lead_data?.phones && lead?.lead_data?.phones[0]) || "N/A";
        // document.getElementById("lead-details-form-url").innerText = lead?.lead_data?.URL || "N/A";
        const urlLink = document.getElementById("lead-details-form-url");
        const url = lead?.lead_data?.URL;
        if (url) {   
            urlLink.setAttribute("href", url);
            urlLink.innerText = url;
        } else {  
            urlLink.removeAttribute("href"); 
            urlLink.innerText = "N/A";
        }
        document.getElementById("lead-details-form-message").innerText = lead?.lead_data?.message || "N/A";
        document.getElementById("lead-details-form-intern").innerText = lead?.lead_data?.intern || "N/A";
        document.getElementById("lead-details-form-comment").innerText = lead?.lead_data?.comment || "N/A";
        document.getElementById("lead-details-form-industry").innerText = lead?.lead_data?.industry || "N/A";
        
        const rawActionData = lead?.lead_data?.action_item || "";
        document.getElementById("lead-details-form-action").value = rawActionData;
        initActionChecklist(rawActionData); // <--- THIS INITIALIZES THE CHECKLIST

        // const followUpDate = lead?.lead_data?.next_follow_up_date;

        // if (followUpDate) {
        //     const dateObj = new Date(followUpDate);
        //     const ddmmyyyy = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
        //     const yyyymmdd = dateObj.toISOString().split("T")[0];

        //     document.getElementById("lead-details-form-next-followup-display").value = ddmmyyyy;
        //     document.getElementById("lead-details-form-next-followup").value = yyyymmdd;
        // } else {
        //     document.getElementById("lead-details-form-next-followup-display").value = "";
        //     document.getElementById("lead-details-form-next-followup").value = "";
        // }

        // ... notes, proposals, audits code ...
        const notesContainer = document.getElementById("lead-notes-body");
        notesContainer.innerHTML = "";
        (lead?.lead_data?.lead_notes || []).slice().reverse() .forEach(note => {
            const item = document.createElement("div");
            item.className = "lead-note-item";
            item.id = `note-item-${note.id}`;
            item.innerHTML = `
    <div class="lead-note-header">
        <div>${note.note_type || "Note"}</div>
        <div class="lead-note-actions">
            <i class="edit-icon edit-note" data-note='${JSON.stringify(note).replace(/'/g, "&apos;")}'><img src="/static/images/pen.svg" alt="Website" width="15" /></i>
            <i class="delete-icon delete-note" data-id="${note.id}"><img src="/static/images/bin.svg" alt="Website" width="15" /></i>
        </div>
    </div>

    <div class="lead-note-meta">
        <div>Note by ${note.added_by_name || "-"}</div>
        <div>${note.created_at || ""}</div>
    </div>

    <div class="lead-note-message">
        ${note.note}
    </div>
`;

            notesContainer.appendChild(item);
        });

        // const proposalContainer = document.getElementById("lead-proposal-body");
        // proposalContainer.innerHTML = "";
        // (lead?.lead_data?.proposal_links || []).forEach(link => {
        //     const item = document.createElement("div");
        //     item.className = "lead-proposal-item";
        //     item.innerHTML = `
        //         <div class="lead-note-text">
        //             <a href="${link.url}" target="_blank">${link.url_type || "Link"}</a>
        //             <div>Feedback: ${link.audit_feedback}</div>
        //         </div>
        //         <input type="checkbox" class="delete-icon" id="${link.id}">🗑️
        //     `;
        //     proposalContainer.appendChild(item);
        // });

        // const auditContainer = document.getElementById("lead-audit-body");
        // auditContainer.innerHTML = "";
        // (lead?.lead_data?.audit_links || []).forEach(link => {
        //     const item = document.createElement("div");
        //     item.className = "lead-audit-item";
        //     item.innerHTML = `
        //         <div class="lead-audit-text">
        //             <a href="${link.url}" target="_blank">${link.audit_type || "Link"}</a>
        //             <div>Feedback: ${link.audit_feedback}</div>
        //         </div>
        //         <input type="checkbox" class="delete-icon" id="${link.id}">🗑️
        //     `;
        //     auditContainer.appendChild(item);
        // });
        
        await fetchAllTags(lead?.lead_data?.tags || []);
        // 2. Update the "fake" tag display
        updateTagDisplay();
        const selects = document.querySelectorAll(".lead-details-select");
        const originTextMap = {
    "w": "Banao Website",
    "ig": "InterviewGod",
    "l": "LinkedIn",
    "i": "Instagram",
    "cw": "Client Website"
};
const typeMap = {
    "DEV": "Development",
    "MKT": "Marketing",
    "DEV_MKT": "Dev+Markt",
    "OTH": "Others",
    "NG": "Not Gathered"
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
        // 9: "Soft Confirmed",
        // 11: "Confirmed",
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
        document.getElementById("lead-details-form-type").innerText=typeMap[lead?.lead_data?.type] || "N/A";
        document.getElementById("lead-details-form-origin").innerText=originTextMap[lead?.lead_data?.origin] || "N/A";
        // RIGHT: Sets value to "0", "1", etc.
        
        document.getElementById("lead-details-form-workflow").value = lead?.lead_data.workflow_status
        document.getElementById("lead-details-form-call-status").value = lead?.lead_data.call_status
        document.getElementById("call_updated_at").value = lead?.lead_data?.call_updated_at;

        // displaying next follow up date 
        const followUpDate = lead?.lead_data?.next_follow_up_date;
        const followUpDisplaySpan = document.getElementById("next_followup_date_display");

        if (followUpDisplaySpan) {
            if (followUpDate) {
                const dateObj = new Date(followUpDate);
                // Format as DD-MM-YYYY
                const ddmmyyyy = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
                followUpDisplaySpan.innerText = ddmmyyyy;
            } else {
                followUpDisplaySpan.innerText = "not set";
            }
        }

        // selects.forEach(select => {
        //     const label = select.previousElementSibling?.innerText?.toLowerCase();
        //     if (label.includes("type")) select.value = lead?.lead_data?.type || "";
        //     if (label.includes("origin")) select.value = lead?.lead_data?.origin || "";
        //     if (label.includes("workflow status")) {
        //         const value = lead?.lead_data?.workflow_status;
        //         select.value = (value !== undefined && value !== null) ? value : "";
        //     }

        //     if (label.includes("call status")) select.value = lead?.lead_data?.call_status || "";
        //     if (label.includes("industry")) select.value = lead?.lead_data?.industry || "";
        // });

        // Now populate assignee dropdown with the fetched data
        // await populateAssigneeDropdownLead();

        // previousAssignedIds = (lead?.lead_data?.assigned_to || [])
        //     .map(username => usernameToIdMap[username])
        //     .filter(id => id !== undefined);
        usernameToIdMap = {};
    if (globalAssigneeUserOption && globalAssigneeUserOption.length > 0) {
      globalAssigneeUserOption.forEach(user => {
          usernameToIdMap[user.username] = user.id;
      });
    }

    // 2. Now, map the assigned usernames (from API) to IDs
    const assignedUserIds = (lead?.lead_data?.assigned_to || [])
      .map(username => usernameToIdMap[username]) // Convert username to ID
      .filter(id => id !== undefined);           // Filter out any misses
    
    // 3. Store this globally so 'enableLeadEdit' can use it too
    previousAssignedIds = assignedUserIds;
    await populateAssigneeDropdownLead(assignedUserIds);
updateAssigneeDisplay();
        // const select = document.getElementById("lead-details-form-assignee");
        // select.innerHTML = "";
        // previousAssignedIds.forEach(id => {
        //     const user = Object.entries(usernameToIdMap).find(([k, v]) => v === id);
        //     const display = user ? user[0] : `User ${id}`;
        //     const option = document.createElement("option");
        //     option.value = id;
        //     option.textContent = display;
        //     option.selected = true;
        //     select.appendChild(option);
        // });
        enableLeadEdit(new Event('synthetic'));
        hideLoaderLeadDetail();
    } catch (error) {
        console.error("Error fetching lead details:", error);
        alert("Failed to load lead details!");
        hideLoaderLeadDetail();
    }
}

// let globalAssigneeUserOption = []

function populateAssigneeDropdownLead(assignedUserIds=[]) {
    const users = globalAssigneeUserOption;
    const select = document.getElementById("lead-details-form-assignee");
    // const currentSelected = Array.from(select.selectedOptions).map(opt => opt.value);
    select.innerHTML = "";

    usernameToIdMap = {};

    users.forEach(user => {
        console.log(user,assignedUserIds);
        
        usernameToIdMap[user.username] = user.id;

        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.first_name} ${user.last_name}`;

        if (assignedUserIds.includes(user.id)) {
            option.selected = true;
        }

        select.appendChild(option);
    });
    console.log(select);
    

}

function enableLeadEdit(event) {
      toggleTagEditMode(true);
    event.preventDefault();
    const form = document.getElementById("lead-details-form");
    const inputs = form.querySelectorAll("input, select, textarea");
    document.getElementById("star2").disabled = false;
    // Get the date input element
    const dateInput = document.getElementById("lead-details-form-next-followup");

    if (dateInput) {
        // 1. Get today's date
        const today = new Date();
        
        // 2. Format it to YYYY-MM-DD (which is required for the 'min' attribute)
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(today.getDate()).padStart(2, '0');
        const minDate = `${yyyy}-${mm}-${dd}`;

        // 3. Set the min attribute
        dateInput.setAttribute("min", minDate);
    }

    inputs.forEach(input => {   
        if (!input.classList.contains('note-select') && input.id !== 'call_updated_at') {
            input.disabled = false;
        }
     });

    // document.getElementById("lead-details-form-next-followup-display").style.display = "none";
    // const editableDate = document.getElementById("lead-details-form-next-followup");
    // editableDate.style.display = "block";
    // editableDate.disabled = false;

    populateAssigneeDropdownLead(previousAssignedIds);
    const origin = document.getElementById("lead-details-form-origin")?.value;
    const currentWorkflowStatus = document.getElementById("lead-details-form-workflow")?.value;
    populateWorkflowStatusOptions(origin, currentWorkflowStatus);

    // Add event listener to track assignee changes
    const assigneeSelect = document.getElementById("lead-details-form-assignee");
    assigneeSelect.addEventListener('change', function () {
        this.dataset.clicked = "true";
    });

    addAutoSubmitListeners();
    // document.getElementById("submit-lead-edit").style.display = "inline-block";
    // document.getElementById("cancel-lead-edit").style.display = "inline-block";
    // document.getElementById("edit-lead-btn").style.display = "none";
}

/**
 * Attaches the auto-submit listener to all relevant form fields.
 * We remove listeners first to prevent duplicates when data is reloaded.
 */
function addAutoSubmitListeners() {
    const form = document.getElementById("lead-details-form");
    
    
    if (!form) return;

    // --- 1. All Selects (Dropdowns) ---
    const selects = form.querySelectorAll("select");
    selects.forEach(select => {
        if(select.id !== 'lead-details-form-assignee' && select.id !== 'lead-tags'){
        select.removeEventListener('change', submitLeadEdit); // Prevent duplicates
        select.addEventListener('change', submitLeadEdit);
        }
    });

    // --- 2. Key Checkboxes (like "Mark Important") ---
    const starCheckbox = document.getElementById("star2");
    if (starCheckbox) {
        starCheckbox.removeEventListener('change', submitLeadEdit);
        starCheckbox.addEventListener('change', submitLeadEdit);
    }
    
    // --- 3. Text, Date, and Textarea fields (triggers on 'change' = on blur) ---
    const textInputs = form.querySelectorAll(
        "input[type='text'], input[type='date'], input[type='email'], textarea"
    );
    textInputs.forEach(input => {
        // Exclude fields that shouldn't auto-save, like the "new tag" input
        if (input.id !== 'new-tag-input' && input.id !== 'lead-details-form-next-followup' &&
            input.id !== 'note-textarea') { 
            input.removeEventListener('change', submitLeadEdit);
            input.addEventListener('change', submitLeadEdit);
        }
    });

    // for action filed 
    const actionTextarea = document.getElementById('lead-details-form-action');
    if (actionTextarea) {
        actionTextarea.removeEventListener('change', submitLeadEdit); // Prevent duplicates
        actionTextarea.addEventListener('change', submitLeadEdit);
    }
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
        // 9: "Soft Confirmed",
        // 11: "Confirmed",
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
    toggleTagEditMode(false);
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
    // const nextFollowUpDate = document.getElementById("lead-details-form-next-followup").value;

    const add_assignees = Array.from(assigneeSelect.selectedOptions).map(opt => Number(opt.value));

    // ADD THIS: Get selected tags if the select element exists
    const selectedTags = getSelectedTagIds();
    
    // Get action_item value
    const actionItem = document.getElementById("lead-details-form-action")?.value || '';

    // Get all form field values
    const companyName = document.getElementById("lead-details-form-company-name")?.value || '';
    const contactName = document.getElementById("lead-details-form-contact-name")?.value || '';
    const email = document.getElementById("lead-details-form-email")?.value || '';
    const phone = document.getElementById("lead-details-form-phone")?.value || '';
    const url = document.getElementById("lead-details-form-url")?.value || '';
    const message = document.getElementById("lead-details-form-message")?.value || '';
    const intern = document.getElementById("lead-details-form-intern")?.value || '';
    const comment = document.getElementById("lead-details-form-comment")?.value || '';
    const industry = document.getElementById("lead-details-form-industry")?.value || '';

    const payload = {
        id: currentEditingLeadId,
        origin,
        call_status: callStatus,
        workflow_status: workflowStatus,
        Mark_Imp: isImportant,
        type: document.getElementById("lead-details-form-type").value,
        add_assignees,
        // next_follow_up_date: nextFollowUpDate || null,
        tags: selectedTags,
        action_item: actionItem,
        company_name: companyName,
        contact_name: contactName,
        emails: email ? [email] : [],
        phones: phone ? [phone] : [],
        URL: url,
        message: message,
        intern: intern,
        comment: comment,
        industry: industry
    };

  console.log(payload);
  if (payload.next_follow_up_date) {
    try {
      const response = await fetch(
        `/api/leads/${currentEditingLeadId}/note-updated-today/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },

          credentials: "include",
        }
      );
      if (response.ok) {
        const { note_updated_today, next_follow_up_date } =
          await response.json();
        if (
          payload.next_follow_up_date !== next_follow_up_date &&
          !note_updated_today
        ) {
          alert(
            "please update the note for today before changing the follow up date"
          );
          document.getElementById("lead-details-form-next-followup").value=""
          return;
        }
      }
      console.log(response);
    } catch (error) {
      console.log(error);
      alert("An error occurred while updating the lead! related to lead notes");
    }
  }

  try {
    const response = await fetch(
      `/api/lead-dashboard/${currentEditingLeadId}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(payload),
        credentials: "include",
      }
    );
    console.log(response);

    if (response.ok) {
      // ADD THIS: Get the response data to access updated tags
      const responseData = await response.json();

      showToast("Lead updated successfully!", "success");
      const updatedDate = document.getElementById(
        "lead-details-form-next-followup"
      ).value;
      if (updatedDate) {
        const [yyyy, mm, dd] = updatedDate.split("-");
        const formattedDate = `${dd}-${mm}-${yyyy}`;
        document.getElementById(
          "lead-details-form-next-followup-display"
        ).value = formattedDate;
      } else {
        document.getElementById(
          "lead-details-form-next-followup-display"
        ).value = "";
      }
    const updatedLead = allLeads.find(lead => lead.id === currentEditingLeadId);
if (updatedLead) {
    updatedLead.action_item = document.getElementById("lead-details-form-action")?.value || '';
    
    // Force re-render of the specific row to update the red icon
    const rowIndex = allLeads.findIndex(lead => lead.id === currentEditingLeadId);
    if (rowIndex !== -1 && typeof renderTable === 'function') {
        // Re-render just this lead's row
        const tbody = document.getElementById("lead-table-body");
        if (tbody && tbody.children[rowIndex]) {
            const singleLeadArray = [allLeads[rowIndex]];
            const tempContainer = document.createElement('tbody');
            
            // Render the updated row into temp container
            const visibleColumns = getVisibleColumns();
            const lead = allLeads[rowIndex];
            const statusText = workflowStatusMap[lead.workflow_status] || "-";
            const originValue = originMap[lead.origin] || "-";
            const style = getStatusStyle(statusText);
            
            const row = document.createElement("tr");
            row.style.cssText = `border-bottom: 1px solid #00000033; height: 40px; background-color: ${lead.Mark_Imp ? "#EBEBEB" : ""}`;
            
            const last_updated_note = lead.last_updated_note
                ? new Date(lead.last_updated_note).toISOString().split("T")[0]
                : "-";
            
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
                        
                    // ... rest of the cases remain the same
                    case 'origin':
                        td.innerHTML = originValue;
                        break;
                    case 'workflow_status':
                        td.dataset.status = statusText;
                        td.innerHTML = `<div style="background-color: ${style.bg}; color: ${style.color}; border-radius: 3px; padding: 1px 4px; width: fit-content;">${statusText}</div>`;
                        break;
                    case 'lead_notes_count':
                        td.innerHTML = `<span class="lead-notes-hover" data-notes="${encodeURIComponent(JSON.stringify(lead.lead_notes || []))}" style="cursor: pointer;">${lead.lead_notes_count || "N/A"}</span>`;
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
                        const createdDate = lead.created_at ? new Date(lead.created_at).toISOString().split("T")[0] : "-";
                        td.textContent = createdDate !== "-" ? convertToDDMMYYYY(createdDate) : "-";
                        break;
                    case "last_updated_note":
                        td.textContent = convertToDDMMYYYY(last_updated_note) || "-";
                        break;
                    case "next_follow_up":
                        const followUpDate = lead.next_follow_up_date ? new Date(lead.next_follow_up_date).toISOString().split("T")[0] : "-";
                        td.textContent = followUpDate !== "-" ? convertToDDMMYYYY(followUpDate) : "-";
                        break;
                    default:
                        td.textContent = "-";
                }
                
                row.appendChild(td);
            });
            
            // Replace the old row with the new one
            tbody.children[rowIndex].replaceWith(row);
            
            // Re-attach listeners for the new row
            const checkbox = row.querySelector('.lead-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', updateSelectionCount);
            }
            
            // Re-attach note hover listeners
            const noteEl = row.querySelector('.lead-notes-hover');
            if (noteEl) {
                noteEl.addEventListener("mouseenter", (e) => {
                    const notes = JSON.parse(decodeURIComponent(noteEl.dataset.notes || "[]"));
                    const tooltip = document.getElementById("lead-notes-tooltip");
                    if (notes.length > 0) {
                        tooltip.innerHTML = notes.reverse().map(n => `
                            <div style="margin-bottom:6px; border-bottom:1px solid #eee; padding-bottom:4px;">
                                <div style="white-space: pre-wrap;word-break: break-word;">${n.note || "-"}</div>
                                <div style="color:#666; font-size:12px;">By: ${n.added_by_name || "-"} on ${n.created_at || "-"}</div>
                            </div>
                        `).join("");
                    } else {
                        tooltip.innerHTML = "<i>No notes available</i>";
                    }
                    tooltip.style.display = "block";
                    tooltip.style.left = (e.pageX + 10) + "px";
                    tooltip.style.top = (e.pageY + 10) + "px";
                });
                noteEl.addEventListener("mousemove", (e) => {
                    const tooltip = document.getElementById("lead-notes-tooltip");
                    tooltip.style.left = (e.pageX + 10) + "px";
                    tooltip.style.top = (e.pageY + 10) + "px";
                });
                noteEl.addEventListener("mouseleave", () => {
                    document.getElementById("lead-notes-tooltip").style.display = "none";
                });
            }
            
            // Re-initialize action tooltips for this row
            if (window.initActionTooltips) {
                window.initActionTooltips();
            }
        }
    }
}
    
    if (typeof fetchTableData === "function") {
        fetchTableData(currentPage);
    }

      // ADD THIS: Update displayed tags if they exist
      // if (responseData.result && responseData.result.tags && typeof displayTags === 'function') {
      //     displayTags(responseData.result.tags);
      // }

    //   disableLeadEdit();

      if (typeof fetchTableData === "function") {
        fetchTableData(currentPage);
      }
    } else {
      alert("Failed to update lead!");
    }
  } catch (error) {
    console.error("Error submitting lead edit:", error);
    alert("An error occurred while updating the lead!");
  }
  
}

function convertToDDMMYYYY(dateStr) {
    if (!dateStr || dateStr === "-") return null;
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
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
    console.log("Submitting note...");
    const notes = [];

    const newNoteTextarea = document.getElementById("note-textarea");
    const noteValue = newNoteTextarea.value.trim();

    const nextFollowUpDateInput = document.getElementById("lead-details-form-next-followup");
    const nextFollowUpDate = nextFollowUpDateInput.value;
    console.log(nextFollowUpDateInput,nextFollowUpDate);

    // Basic validations
    if (!noteValue) {
        showToast("Please enter a note.","error");
        return;
    }
    
    // validation 
    const fullNoteText = newNoteTextarea.value; 
    const summaryStartMarker = "--- Activity Summary ---";
    let customMessage = "";
    const summaryStartIndex = fullNoteText.indexOf(summaryStartMarker);

    if (summaryStartIndex !== -1) {
        // Find text *before* the summary
        const markerStartIndex = fullNoteText.lastIndexOf('\n', summaryStartIndex);
        customMessage = (markerStartIndex !== -1) ? fullNoteText.substring(0, markerStartIndex).trim() : "";
    } else {
        // No summary, the whole text is the custom message
        customMessage = fullNoteText.trim();
    }

    // This is the key fix:
    const hasCustomNote = customMessage !== ""; 

    // (B) Check for selected option
    let hasSelectedOption = false;
    let noteType = null;
    const form = document.getElementById('note-textarea').closest('.ld-note-box');
    const selects = form.querySelectorAll(".note-select");

    for (let i = 0; i < selects.length; i++) {
        const select = selects[i];
        const type = select.dataset.type;
        const checkbox = form.querySelector(`.note-checkbox[data-type="${type}"]`);

        if (checkbox && checkbox.checked && select.value !== "") {
            hasSelectedOption = true;
            noteType = `${type} - ${select.value}`;
            break; 
        }
    }

    // (C) Check for date
    const hasFollowUpDate = nextFollowUpDate !== "";

    // --- 3. Run the validation logic ---
    const isNoteValid = hasCustomNote || hasSelectedOption;

    if (!isNoteValid || !hasFollowUpDate) {
        if (!hasFollowUpDate) {
            showToast("Please add a next follow-up date.", "error");
        } else if (!isNoteValid) {
            showToast("Please add a custom note(above the activity) or select an activity (e.g., Call Status).", "error");
        }
        return; // STOP the function here
    }
    notes.push({ note: noteValue });

    const payload = {
        lead_notes: notes,
        ...(nextFollowUpDate && { next_follow_up_date: nextFollowUpDate }),
    };

    try {
        const response = await fetch(`/api/lead-dashboard/${currentEditingLeadId}/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
           showToast("Note updated successfully!", "success");
            // reseting notes 
            newNoteTextarea.value=""
            const checkboxes = document.querySelectorAll(".note-checkbox");
            checkboxes.forEach(cb => {
                cb.checked = false;
            });
            nextFollowUpDateInput.value=""
            const selects = document.querySelectorAll(".note-select");
            selects.forEach(sel => {
                sel.disabled = true;
                sel.selectedIndex = 0; 
            });
            toggleLeadDetails(currentEditingLeadId);
        } else {
            alert("Failed to update notes.");
        }
    } catch (error) {
        console.error("Error submitting notes:", error);
        alert("An error occurred.");
    }

}
// deleting note 

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
document.addEventListener("DOMContentLoaded", () => {

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
        const callStatusText = callStatusMap[lead.call_status] || "-";
        const callstyle = getCallStatusStyle(callStatusText);

        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #00000033";
        row.style.height = "40px";
        row.style.backgroundColor = `${lead.Mark_Imp ? "#EBEBEB" : ""}`

        row.innerHTML = `
                                    <td><input type="checkbox" class="lead-checkbox" data-id="${lead.id}"/></td>
                                    <td onClick="window.location.href='/lms/lead/${lead.id}'" style="cursor: pointer;">${lead.full_name || ""}</td>
                                    <td>${lead.type || ""}</td>
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
                                    <td data-callstatus="${callStatusText}">
                                        <div style="
                                            background-color: ${callstyle.bg};
                                            color: ${callstyle.color};
                                            border-radius: 3px;
                                            padding: 1px 4px;
                                            width: fit-content;">${callStatusText}</div>
                                    </td>
                                    <td>${lead.company_name || "-"}</td>
                                    <td>${lead.contact_name || "-"}</td>
                                    <td style="padding: 0px 8px;">${lead.emails?.join(", ") || "-"}</td>
                                    <td> ${lead.proposal_links && lead.proposal_links.length > 0
                ? lead.proposal_links.map(link => `<a href="${link.url}" target="_blank">${link.url_type || "Link"}</a>`).join(", ")
                : "-"
            }
                                        
                                    </td>
                                    <td> ${lead.audit_links && lead.audit_links.length > 0
                ? lead.audit_links.map(link => `<a href="${link.url}" target="_blank">${link.audit_type || "Link"}</a>`).join(", ")
                : "-"
            }
                                    </td>
                                    <td>${lead.phones?.join(", ") || "-"}</td>
                                    <td>${lead.assigned_to?.join(", ") || "-"}</td>
                                    <td>${lead.industry || "-"}</td>
                                    <td>${lead.created_at || "-"}</td>
                                    <td>${lead.updated_at || "-"}</td>
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

    console.log(currentCheckData);

    leads.forEach(lead => {
        const statusText = workflowStatusMap[lead.workflow_status] || "-";
        const originValue = originMap[lead.origin] || "-";
        const style = getStatusStyle(statusText);
        const callStatusText = callStatusMap[lead.call_status] || "-";
        const callstyle = getCallStatusStyle(callStatusText);

        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #00000033";
        row.style.height = "40px";
        row.style.backgroundColor = `${lead.Mark_Imp ? "#EBEBEB" : ""}`

        row.innerHTML = `
                                    <td><input type="checkbox" class="lead-checkbox" data-id="${lead.id}"/></td>
                                    <td onClick='toggleLeadDetails(${lead.id}, temp="check")' style="cursor: pointer;">${lead.full_name || ""}</td>
                                    <td>${lead.type || ""}</td>
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
                                    <td data-callstatus="${callStatusText}">
                                        <div style="
                                            background-color: ${callstyle.bg};
                                            color: ${callstyle.color};
                                            border-radius: 3px;
                                            padding: 1px 4px;
                                            width: fit-content;">${callStatusText}</div>
                                    </td>
                                    <td>${lead.company_name || "-"}</td>
                                    <td>${lead.contact_name || "-"}</td>
                                    <td style="padding: 0px 8px;">${lead.emails?.join(", ") || "-"}</td>
                                    <td>  ${lead.proposal_links && lead.proposal_links.length > 0
                ? lead.proposal_links.map(link => `<a href="${link.url}" target="_blank">${link.url_type || "Link"}</a>`).join(", ")
                : "-"
            }</td>
                     <td> ${lead.audit_links && lead.audit_links.length > 0
                ? lead.audit_links.map(link => `<a href="${link.url}" target="_blank">${link.audit_type || "Link"}</a>`).join(", ")
                : "-"
            }
                                    </td>
                                    <td>${lead.phones?.join(", ") || "-"}</td>
                                    <td>${lead.assigned_to?.join(", ") || "-"}</td>
                                    <td>${lead.industry || "-"}</td>
                                    <td>${lead.created_at || "-"}</td>
                                    <td>${lead.updated_at || "-"}</td>
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

// Add event listeners to all header checkboxes on page load
document.addEventListener('DOMContentLoaded', function () {
    const headerCheckboxes = document.querySelectorAll('thead input[type="checkbox"]');
    headerCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleHeaderCheckboxChange);
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const callBtn = document.getElementById("lead-details-form-call-icon");

    if (callBtn) {
        callBtn.addEventListener("click", (e) => {
            // normal call works
            const phone = document.getElementById("lead-details-form-phone")?.innerText;
            if (phone) {
                callBtn.setAttribute("href", `tel:${phone}`);
            }

            // after 10 seconds, show modal
            setTimeout(() => {
                document.getElementById("call-followup-modal").style.display = "flex";
            }, 10000);
        });
    }
});




// Function to fetch all available tags
async function fetchAllTags(selectedLeadTags=[]) {
    try {
        const response = await fetch('/api/tags/');
        const data = await response.json();
        allTags = data;
        populateTagSelect(selectedLeadTags);
    } catch (error) {
        console.error('Error fetching tags:', error);
    }
}

// Function to populate the tag select dropdown
function populateTagSelect(selectedLeadTags=[]) {
    const tagSelect = document.getElementById('lead-tags');
    if (!tagSelect) return;
    
    tagSelect.innerHTML = '';
    currentLeadTags = selectedLeadTags;
    allTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.id;
        option.textContent = tag.name;
        if (currentLeadTags.some(leadTag => leadTag.id === tag.id)) {
            option.selected = true;
        }
        tagSelect.appendChild(option);
    });
}

// Function to display tags in read-only mode
function displayTags(tags) {
    const tagsDisplay = document.getElementById('tags-display');
    if (!tagsDisplay) return;
    
    currentLeadTags = tags || [];
    
    if (currentLeadTags.length === 0) {
        tagsDisplay.innerHTML = '<span class="text-muted">No tags assigned</span>';
    } else {
        tagsDisplay.innerHTML = currentLeadTags.map(tag => 
            `<span class="tag-item">${tag.name}</span>`
        ).join('');
    }
}

// Function to create a new tag
async function createNewTag() {
    const newTagInput = document.getElementById('new-tag-input');
    const tagName = newTagInput.value.trim();
    
    if (!tagName) {
        alert('Please enter a tag name');
        return;
    }
    
    try {
        const response = await fetch('/api/tags/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken// You'll need to implement this function
            },
            body: JSON.stringify({ name: tagName })
        });
        
        if (response.ok) {
            const newTag = await response.json();
            allTags.push(newTag);
            populateTagSelect();
            
            // Select the newly created tag
            const tagSelect = document.getElementById('lead-tags');
            const newOption = tagSelect.querySelector(`option[value="${newTag.id}"]`);
            if (newOption) {
                newOption.selected = true;
            }
            
            newTagInput.value = '';
        } else {
            alert('Error creating tag');
        }
    } catch (error) {
        console.error('Error creating tag:', error);
    }
}

// Function to toggle tag edit mode
function toggleTagEditMode(isEditMode) {
    // const tagsDisplay = document.getElementById('tags-display');
    // const tagsEdit = document.getElementById('tags-edit');
    
    // if (isEditMode) {
    //     tagsDisplay.style.display = 'none';
    //     tagsEdit.style.display = 'block';
    //     populateTagSelect();
    // } else {
    //     tagsDisplay.style.display = 'block';
    //     tagsEdit.style.display = 'none';
    // }
}

// Function to get selected tag IDs
function getSelectedTagIds() {
    console.log("=== DEBUG: getSelectedTagIds called ===");
    
    const tagSelect = document.getElementById("lead-tags"); // Changed from "lead-tags-select"
    console.log("tagSelect element:", tagSelect);
    
    if (!tagSelect) {
        console.log("ERROR: lead-tags element not found!");
        return [];
    }
    
    const selectedIds = Array.from(tagSelect.selectedOptions).map(opt => Number(opt.value));
    console.log("Final selectedIds:", selectedIds);
    return selectedIds;
}




/**
 * This is your dynamic text logic, now reusable.
 * It targets elements based on a unique ID.
 */
function updateInPlaceNoteText(uniqueId) {
    const form = document.getElementById(`note-edit-form-${uniqueId}`);
    if (!form) return;

    const textarea = document.getElementById(`note-textarea-${uniqueId}`);
    const dateInput = document.getElementById(`note-date-${uniqueId}`);
    const selects = form.querySelectorAll(".note-select-edit");

    const summaryStartMarker = "--- Activity Summary ---";
    
    // 1. Get the full current text and find the *custom message* part
    let currentFullText = textarea.value;
    let customMessage = "";

    const summaryStartIndex = currentFullText.indexOf(summaryStartMarker);
    
    if (summaryStartIndex !== -1) {
        // Find the start of the "---" block (the \n before it)
        const markerStartIndex = currentFullText.lastIndexOf('\n', summaryStartIndex);
        customMessage = (markerStartIndex !== -1) ? currentFullText.substring(0, markerStartIndex).trim() : "";
    } else {
        // No summary found, the whole text is custom
        customMessage = currentFullText.trim();
    }

    // 2. Build the NEW summary lines
    let summaryLines = [];
    selects.forEach(select => {
        const type = select.dataset.type;
        const checkbox = form.querySelector(`.note-checkbox-edit[data-type="${type}"]`);
        if (checkbox.checked && select.value && select.value !== "") { // Check for empty value
            summaryLines.push(`${type} - ${select.value}`);
        }
    });

    if (dateInput.value) {
        const date = new Date(dateInput.value);
        const formatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        summaryLines.push(`Next follow-up date - ${formatted}`);
    }

    // 3. Combine everything back together
    if (summaryLines.length > 0) {
        let newSummaryBlock = "";
        
        if (customMessage === "") {
            // NO custom message
            newSummaryBlock = summaryStartMarker + "\n" + summaryLines.join("\n");
        } else {
            // HAS custom message
            newSummaryBlock = "\n\n" + summaryStartMarker + "\n" + summaryLines.join("\n");
        }
        
        // Set the final value, replacing the old summary
        textarea.value = customMessage + newSummaryBlock;
        
    } else {
        // If no summary lines, just keep the custom message
        textarea.value = customMessage;
    }
}

/**
 * Attaches all necessary listeners to a newly created note form.
 */
function attachInPlaceNoteListeners(uniqueId) {
    const form = document.getElementById(`note-edit-form-${uniqueId}`);
    if (!form) return;

    const checkboxes = form.querySelectorAll(".note-checkbox-edit");
    const selects = form.querySelectorAll(".note-select-edit");
    const dateInput = form.querySelector(".note-date-edit");

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            const type = checkbox.dataset.type;
            const select = form.querySelector(`.note-select-edit[data-type="${type}"]`);
            if (checkbox.checked) {
                select.disabled = false;
            } else {
                select.disabled = true;
                select.value = "";
            }
            updateInPlaceNoteText(uniqueId);
        });
    });

    selects.forEach(select => {
        select.addEventListener("change", () => updateInPlaceNoteText(uniqueId));
    });
    dateInput.addEventListener("change", () => updateInPlaceNoteText(uniqueId));
}

/**
 * Generates the HTML for an in-place note editor.
 * We use unique IDs to manage multiple edit forms at once.
 */
function getNoteEditFormHTML(noteId) {
    const uniqueId = `edit-${noteId}`;
    
    return `
    <div id="note-edit-form-${uniqueId}" class="ld-note-box" style="padding: 10px; width:100%; background: #fafafa; border: 1px solid #ddd; border-radius: 8px;">
        <div class="note-entry">
            <textarea class="ld-textarea" id="note-textarea-${uniqueId}"
                placeholder="Note title... Note description..."></textarea>
        </div>

        <div class="ld-contact-grid" id="note-options-grid-${uniqueId}">
            <div class="ld-contact-item">
                <label><input type="checkbox" class="note-checkbox-edit" data-type="Call Status" data-target="${uniqueId}" /> Phone call</label>
                <select class="note-select-edit note-select" data-type="Call Status" data-target="${uniqueId}" disabled>
                    <option value="">Call Status</option>
                    <option value="call_failed">Call Failed</option>
                    <option value="call_connected">Call Connected</option>
                    <option value="call_didnot_pickup">Call Didn't Pickup</option>
                </select>
            </div>
            <div class="ld-contact-item">
                <label><input type="checkbox" class="note-checkbox-edit" data-type="Email Status" data-target="${uniqueId}" /> Email</label>
                <select class="note-select-edit note-select" data-type="Email Status" data-target="${uniqueId}" disabled>
                    <option value="">Email status</option>
                    <option value="Email Sent">Email Sent</option>
                    <option value="Email Delivered">Email Delivered</option>
                    <option value="Email Opened">Email Opened</option>
                    <option value="Link Clicked">Link Clicked</option>
                    <option value="Replied">Replied</option>
                    <option value="Bounced">Bounced</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>
            <div class="ld-contact-item">
                <label><input type="checkbox" class="note-checkbox-edit" data-type="Whatsapp Status" data-target="${uniqueId}" /> Whatsapp</label>
                <select class="note-select-edit note-select" data-type="Whatsapp Status" data-target="${uniqueId}" disabled>
                    <option value="">Whatsapp Status</option>
                    <option value="Message Sent">Message Sent</option>
                    <option value="Message Delivered">Message Delivered</option>
                    <option value="Message Read">Message Read</option>
                    <option value="Lead Replied">Lead Replied</option>
                    <option value="call initiated(via Whatsapp call)">call initiated(via Whatsapp call)</option>
                    <option value="Not Delivered / Blocked">Not Delivered / Blocked</option>
                </select>
            </div>
            <div class="ld-contact-item">
                <label><input type="checkbox" class="note-checkbox-edit" data-type="LinkedIn Status" data-target="${uniqueId}" /> LinkedIn</label>
                <select class="note-select-edit note-select" data-type="LinkedIn Status" data-target="${uniqueId}" disabled>
                    <option value="">LinkedIn status</option>
                    <option value="Connection Request Sent">Connection Request Sent</option>
                    <option value="Request Pending">Request Pending</option>
                    <option value="Connected">Connected</option>
                    <option value="Message Sent">Message Sent</option>
                    <option value="Message Seen">Message Seen</option>
                    <option value="Lead Replied">Lead Replied</option>
                    <option value="Profile Unavailable / Restricted">Profile Unavailable / Restricted</option>
                    <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                </select>
            </div>
        </div>

        <div class="ld-add-row">
            <input placeholder="Next follow-up date" id="note-date-${uniqueId}" class="ld-date note-date-edit" data-target="${uniqueId}" type="date" />
            
            <button class="ld-add-btn" onclick="saveInPlaceNote(${noteId})" type="button" 
                    style="background-color: #4CAF50;">Save</button>
            <button class="ld-add-btn" onclick="cancelInPlaceEdit(${noteId})" type="button" 
                    style="background-color: #f44336;">Cancel</button>
        </div>
    </div>
    `;
}

/**
 * CALLED WHEN YOU CLICK THE 'EDIT' ICON
 * Swaps the note display with the new edit form
 */
function startInPlaceNoteEdit(note, container) {
    const noteId = note.id;
    const uniqueId = `edit-${noteId}`;
    
    // 1. Save the original HTML
    container.dataset.originalHtml = container.innerHTML;

    // 2. Inject the new edit form
    container.innerHTML = getNoteEditFormHTML(noteId);

    // 3. Populate the new form with the note's data
    // Parse the note to find the custom message
    const summaryMarker = "\n--- Activity Summary ---\n";
    let customMessage = note.note;
    const summaryIndex = customMessage.indexOf(summaryMarker);
    if (summaryIndex !== -1) {
        const markerStartIndex = customMessage.lastIndexOf('\n', summaryIndex);
        if (markerStartIndex !== -1) {
            customMessage = customMessage.substring(0, markerStartIndex);
        } else {
            customMessage = ""; 
        }
    }
    document.getElementById(`note-textarea-${uniqueId}`).value = customMessage;
    
    const dateValue = note.next_follow_up_date || "";
    document.getElementById(`note-date-${uniqueId}`).value = dateValue.split('T')[0];

    // Set the dropdown/checkbox state
    if (note.note_type) {
        try {
            const [type, value] = note.note_type.split(' - ');
            const checkbox = document.querySelector(`#note-edit-form-${uniqueId} .note-checkbox-edit[data-type="${type.trim()}"]`);
            const select = document.querySelector(`#note-edit-form-${uniqueId} .note-select-edit[data-type="${type.trim()}"]`);
            if (checkbox && select) {
                checkbox.checked = true;
                select.disabled = false;
                select.value = value.trim();
            }
        } catch (e) { console.log("Could not parse note_type:", note.note_type); }
    }
    
   
    
    // 5. Attach all the listeners to the new form
    attachInPlaceNoteListeners(uniqueId);
    updateInPlaceNoteText(uniqueId);
}

/**
 * CALLED WHEN YOU CLICK THE 'EDIT' ICON
 * Swaps the note display with the new edit form
 */
function startInPlaceNoteEdit(note, container) {
    const noteId = note.id;
    const uniqueId = `edit-${noteId}`;
    
    // 1. Save the original HTML
    container.dataset.originalHtml = container.innerHTML;

    // 2. Inject the new edit form
    container.innerHTML = getNoteEditFormHTML(noteId);

    // 3. PARSING LOGIC 
    const summaryStartMarker = "--- Activity Summary ---";
    let fullNoteText = note.note;
    let customMessage = "";
    let summaryBlock = ""; 

    const summaryStartIndex = fullNoteText.indexOf(summaryStartMarker);

    if (summaryStartIndex !== -1) {
        // A. Find the custom message
        const markerStartIndex = fullNoteText.lastIndexOf('\n', summaryStartIndex); 
        if (markerStartIndex !== -1) {
            customMessage = fullNoteText.substring(0, markerStartIndex).trim();
        } else {
            customMessage = ""; // Summary was at the very top
        }

        // B. Find the summary block (everything AFTER the marker line)
        summaryBlock = fullNoteText.substring(summaryStartIndex + summaryStartMarker.length).trim();
    } else {
        // No summary found, the whole note is the custom message
        customMessage = fullNoteText;
    }
    // 4. Populate the textarea with ONLY the custom message
    document.getElementById(`note-textarea-${uniqueId}`).value = customMessage;
    // 5. Reset all checkboxes and selects
    const form = document.getElementById(`note-edit-form-${uniqueId}`);
    form.querySelectorAll(".note-checkbox-edit").forEach(cb => cb.checked = false);
    form.querySelectorAll(".note-select-edit").forEach(sel => {
        sel.disabled = true;
        sel.selectedIndex = 0;
    });

    // 6. Parse the summary block and set the form state
    if (summaryBlock) {
        const summaryLines = summaryBlock.split('\n');
        
        summaryLines.forEach(line => {
            const parts = line.split(' - ');
            if (parts.length < 2) return; 

            const key = parts[0].trim();
            const value = parts.slice(1).join(' - ').trim(); 

            if (key === 'Next follow-up date') {
                // Parse date from DD/MM/YYYY to YYYY-MM-DD
                try {
                    const [day, month, year] = value.split('/');
                    const yyyyMmDd = `${year}-${month}-${day}`;
                    document.getElementById(`note-date-${uniqueId}`).value = yyyyMmDd;
                } catch (e) { console.log('Could not parse date:', value); }

            } else {
                // This is a dropdown (e.g., "Call Status")
                const checkbox = form.querySelector(`.note-checkbox-edit[data-type="${key}"]`);
                const select = form.querySelector(`.note-select-edit[data-type="${key}"]`);
                
                if (checkbox && select) {
                    checkbox.checked = true;
                    select.disabled = false;
                    select.value = value;
                }
            }
        });
    }
    
    // 7. Attach all the listeners to the new form
    attachInPlaceNoteListeners(uniqueId);

    updateInPlaceNoteText(`edit-${note.id}`);
}

/**
 * CALLED WHEN YOU CLICK THE IN-PLACE 'SAVE' BUTTON
 */
async function saveInPlaceNote(noteId) {
    const uniqueId = `edit-${noteId}`;
    const noteValue = document.getElementById(`note-textarea-${uniqueId}`).value.trim();
    const nextFollowUpDate = document.getElementById(`note-date-${uniqueId}`).value;

    const payload = {
        lead_notes: [
            { id: noteId, note: noteValue,edit:true }
        ],
        ...(nextFollowUpDate && { next_follow_up_date: nextFollowUpDate }),
    };
    

    try {
        const response = await fetch(`/api/lead-dashboard/${currentEditingLeadId}/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken, 
            },
            body: JSON.stringify(payload),
            credentials: 'include'
        });

        if (response.ok) {
            // alert("note updated successfully...!");
            showToast("Note updated sucessfully!","success");
             toggleLeadDetails(currentEditingLeadId); 
        } else {
            // alert("Failed to update note.");
            showToast("Failed to  updated Note!","error");

        }
    } catch (error) {
        console.error("Error saving note:", error);
        alert("An error occurred while saving the note.");
    }
}

/**
 * CALLED WHEN YOU CLICK THE IN-PLACE 'CANCEL' BUTTON
 */
function cancelInPlaceEdit(noteId) {
    const container = document.getElementById(`note-item-${noteId}`);
    if (container && container.dataset.originalHtml) {
        // Restore the original, non-edited content
        container.innerHTML = container.dataset.originalHtml;
    } else {
        // Fallback: just reload everything
        toggleLeadDetails(currentEditingLeadId);
    }
}


// toast messages 
function showToast(message, variant = 'info', duration = 3000) {
    // Find or create the toast container
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${variant}`;
    toast.innerText = message;

    // Add to container
    container.appendChild(toast);

    // Set removal timer
    setTimeout(() => {
        // Add fade-out class
        toast.classList.add('toast-fade-out');
        
        // Wait for animation to finish, then remove the element
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, duration);
}


function updateTagDisplay() {
    const select = document.getElementById("lead-tags");
    const display = document.getElementById("lead-tags-display");
    if (!select || !display) return;

    const selectedOptions = Array.from(select.selectedOptions);

    if (selectedOptions.length === 0) {
        display.innerText = "No tags";
    } else if (selectedOptions.length === 1) {
        display.innerText = selectedOptions[0].textContent;
    } else {
        const firstTag = selectedOptions[0].textContent;
        const moreCount = selectedOptions.length - 1;
        display.innerText = `${firstTag} & ${moreCount} more`;
    }
}
