

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
            0: "Negative",
            1: "Call To Be Made",
            2: "Requirement Pending",
            3: "Proposal Pending",
            4: "Proposal Sent",
            7: "Audit Pending",
            8: "Audit Sent",
            9: "Soft Confirmed",
            11: "Confirmed",
            12: "Priority Audit Pending",
            13: "New Call To Be Made",
            14: "InterviewGod",
            15: "1st email mesage sent after intial call",
            16: "2nd Follow-up",
            17: "3rd Follow-up",
            18: "Call Unresponsive",
            19: "Demo Booked",
            20: "Demo completed",
            21: "Whatsapp group onboarding",
            22: "JD request sent",
            23: "Pilot started",
            24: "Account setup & interview creation",
            25: "Swap confirmed / POC successful",
            26: "Email Sent"
        };

        const callStatusMap = {
            'call_didnot_pickup': `Call Didn't Pickup`,
            'call_connected': 'Call Connected',
            'call_failed': 'Call Failed',
        };

        function getStatusStyle(status) {
            switch (status) {
                case "Proposal Pending": return { bg: "#FEF3F2", color: "#D94C20" };
                case "Soft Confirmed": return { bg: "#D1E7DD", color: "#079455" };
                case "Requirement Pending": return { bg: "#FEF8F2", color: "#FF5C00" };
                case "Audit Pending": return { bg: "#FFFAEB", color: "#DC6803B2" };
                case "Call To Be Made": return { bg: "#FFFAEB", color: "#DC6803B2" };
                case "New Call To Be Made": return { bg: "#FFFAEB", color: "#DC6803B2" };
                case "Audit Sent": return { bg: "#FFFAEB", color: "#FF4E03E5" };
                case "InterviewGod": return { bg: "#FFFAEB", color: "#FF4E03E5" };
                case "Negative": return { bg: "#FEF3F2", color: "#D92D20" };
                case "Proposal Sent": return { bg: "#ECFDF3", color: "#17B26AE5" };
                case "Confirmed": return { bg: "#ECFDF3", color: "#079455" };
                case "Priority Audit Pending": return { bg: "#FFFAEB", color: "#DC6803B2" };
                case "1st email mesage sent after intial call": return { bg: "#FFFAEB", color: "#DC6803B2" };
                case "2nd Follow-up": return { bg: "#FFFAEB", color: "#DC6803B2" };
                case "3rd Follow-up": return { bg: "#FFFAEB", color: "#DC6803B2" };
                case "Call Unresponsive": return { bg: "#FFFAEB", color: "#FF4E03E5" };
                case "Demo Booked": return { bg: "#ECFDF3", color: "#17B26AE5" };
                case "Demo completed": return { bg: "#ECFDF3", color: "#17B26AE5" };
                case "Whatsapp group onboarding": return { bg: "#ECFDF3", color: "#17B26AE5" };
                case "JD request sent": return { bg: "#ECFDF3", color: "#17B26AE5" };
                case "Pilot started": return { bg: "#ECFDF3", color: "#079455" };
                case "Account setup & interview creation": return { bg: "#ECFDF3", color: "#079455" };
                case "Swap confirmed / POC successful": return { bg: "#ECFDF3", color: "#079455" };
                case "Email Sent": return { bg: "#ECFDF3", color: "#079455" };

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
                                    <td onClick='toggleLeadDetails(${lead.id})' style="cursor: pointer;">${lead.full_name || ""}</td>
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


        document.addEventListener("click", function (event) {
            const dropdown = document.getElementById("more-dropdown");
            const moreBtn = document.querySelector(".more-option");
            if (!dropdown.contains(event.target) && !moreBtn.contains(event.target)) {
                dropdown.style.display = "none";
            }
        });

        function getSelectedLeadIds() {
            const checkboxes = document.querySelectorAll(".lead-checkbox:checked");
            return Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
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
            { value: 7, label: "Audit Pending" },
            { value: 8, label: "Audit Sent" },
            { value: 1, label: "Call To Be Made" },
            { value: 11, label: "Confirmed" },
            { value: 14, label: "InterviewGod" },
            { value: 0, label: "Negative" },
            { value: 13, label: "New Call To Be Made" },
            { value: 12, label: "Priority Audit Pending" },
            { value: 3, label: "Proposal Pending" },
            { value: 4, label: "Proposal Sent" },
            { value: 2, label: "Requirement Pending" },
            { value: 9, label: "Soft Confirmed" },
            { value: 26, label: "Email Sent" },
        ];

        const linkedinWorkflowOptions = [
            { value: 15, label: "1st email mesage sent after intial call" },
            { value: 16, label: "2nd Follow-up" },
            { value: 17, label: "3rd Follow-up" },
            { value: 18, label: "Call Unresponsive" },
            { value: 19, label: "Demo Booked" },
            { value: 20, label: "Demo completed" },
            { value: 21, label: "Whatsapp group onboarding" },
            { value: 22, label: "JD request sent" },
            { value: 23, label: "Pilot started" },
            { value: 24, label: "Account setup & interview creation" },
            { value: 25, label: "Swap confirmed / POC successful" },
            { value: 1, label: "Call To Be Made" },
            { value: 0, label: "Negative" },
            { value: 26, label: "Email Sent" },
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
                ? [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 1, 0, 26]
                : [7, 8, 1, 11, 14, 0, 13, 12, 3, 4, 2, 9, 26];

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
            if (!mobileDropdown.contains(event.target)) {
                document.getElementById("mobile-assigned-list").classList.add("hidden");
            }

            const desktopDropdown = document.getElementById("assigned-to-filter");
            if (!desktopDropdown.contains(event.target)) {
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
        fetchTableData();

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



        async function toggleLeadDetails(leadId, template) {
            currentEditingLeadId = leadId;
            previousDashboard = template || "lms";
            document.querySelector('.lms-main-dashboard').style.display = 'none';
            document.querySelector('.lead-details-dashboard').style.display = 'flex';

            if (template === "check") {
                document.querySelector('.checks-main-dashboard').style.display = 'none';
                document.querySelector('.lead-details-dashboard').style.display = 'flex';
            }

            if (template === "jrba") {
                document.querySelector('.jr-ba-dashboard').style.display = 'none';
                document.querySelector('.lead-details-dashboard').style.display = 'flex';
            }

            showLoaderLeadDetail()
            try {
                const response = await fetch(`/api/lead-dashboard/${leadId}/`);
                const lead = await response.json();
                // console.log(lead)

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
                ? [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 1, 0, 26]
                : [7, 8, 1, 11, 14, 0, 13, 12, 3, 4, 2, 9, 26];

            const workflowStatusMap = {
                0: "Negative",
                1: "Call To Be Made",
                2: "Requirement Pending",
                3: "Proposal Pending",
                4: "Proposal Sent",
                7: "Audit Pending",
                8: "Audit Sent",
                9: "Soft Confirmed",
                11: "Confirmed",
                12: "Priority Audit Pending",
                13: "New Call To Be Made",
                14: "InterviewGod",
                15: "1st email mesage sent after intial call",
                16: "2nd Follow-up",
                17: "3rd Follow-up",
                18: "Call Unresponsive",
                19: "Demo Booked",
                20: "Demo completed",
                21: "Whatsapp group onboarding",
                22: "JD request sent",
                23: "Pilot started",
                24: "Account setup & interview creation",
                25: "Swap confirmed / POC successful",
                26: "Email Sent"
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

          function convertToDDMMYYYY(dateStr) {
      if (!dateStr || dateStr == "-") return null;
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    }

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
                                    <td>${convertToDDMMYYYY(lead.updated_at )|| "-"}</td>
                                    <td>${convertToDDMMYYYY(new Date(lead.last_updated_note).toISOString().split("T")[0]) || "-"}</td>
                                    <td>${convertToDDMMYYYY(lead.next_follow_up_date) || "-"}</td>
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
